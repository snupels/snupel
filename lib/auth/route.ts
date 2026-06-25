import { z } from "zod";

import { AuthError } from "./service";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const rateLimits = new Map<string, { count: number; resetAt: number }>();

export async function authJson<T>(
  request: Request,
  schema: z.ZodType<T>,
  handler: (input: T) => Promise<unknown>,
  status = 200,
) {
  if (!allowRequest(request)) {
    return Response.json(
      { error: "rate_limited", message: "Too many requests." },
      { status: 429 },
    );
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return Response.json(
      { error: "invalid_request", message: "Invalid request body." },
      { status: 400 },
    );
  }

  try {
    return Response.json(await handler(parsed.data), { status });
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json(
        { error: error.code, message: error.message },
        { status: 400 },
      );
    }

    throw error;
  }
}

function allowRequest(request: Request) {
  const now = Date.now();
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "local";
  const key = `${ip}:${new URL(request.url).pathname}`;
  const current = rateLimits.get(key);

  if (!current || current.resetAt <= now) {
    rateLimits.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  current.count += 1;
  // ponytail: process-local limiter; move to Redis when running multiple app instances.
  return current.count <= RATE_LIMIT_MAX;
}
