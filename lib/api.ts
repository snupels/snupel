import { getLoginUser } from "./auth/route";

export function json<T = unknown>(data: T, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const created = <T = unknown>(data: T) => json<T>(data, 201);

export const badRequest = (message = "Bad Request") =>
  json({ error: "bad_request", message }, 400);

export const notFound = (message = "Not Found") =>
  json({ error: "not_found", message }, 404);

export function noContent() {
  return new Response(null, { status: 204 });
}

export type LoginUser = { id: number; email: string };

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export async function apiResponse(action: () => Promise<Response>) {
  try {
    return await action();
  } catch (error) {
    if (error instanceof ApiError) {
      return json({ error: error.code, message: error.message }, error.status);
    }
    throw error;
  }
}

export function requireUser(request: Request) {
  const user = getLoginUser(request);
  if (!user) throw new ApiError(401, "unauthorized", "Login is required.");
  return user;
}

export function requireAdmin(request: Request) {
  const user = requireUser(request);
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (!admins.includes(user.email.toLowerCase())) {
    throw new ApiError(403, "forbidden", "Administrator access is required.");
  }
  return user;
}

export function hasDatabaseCode(error: unknown, code: string) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}
