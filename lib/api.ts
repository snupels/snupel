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
