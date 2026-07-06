import { NextResponse } from "next/server";

export function json<T = unknown>(data: T, status = 200) {
  return NextResponse.json(data as unknown, { status });
}

export function created(data: unknown) {
  return json(data, 201);
}

export function badRequest(message: string) {
  return NextResponse.json({ error: "bad_request", message }, { status: 400 });
}

export function notFound(message: string) {
  return NextResponse.json({ error: "not_found", message }, { status: 404 });
}

export function noContent() {
  return new Response(null, { status: 204 });
}
