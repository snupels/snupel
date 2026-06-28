import { NextResponse } from "next/server";

export function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status });
}

export function created(body: unknown) {
  return json(body, 201);
}

export function badRequest(message: string) {
  return json({ error: message }, 400);
}

export function notFound(message: string) {
  return json({ error: message }, 404);
}

export function noContent() {
  return new Response(null, { status: 204 });
}
