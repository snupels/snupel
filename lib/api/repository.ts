import type { z } from "zod";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.sportspassport.kr/api").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(typeof body === "object" && body && "detail" in body ? String(body.detail) : `API 요청 실패 (${status})`);
  }
}

type RequestOptions<T> = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
  schema: z.ZodType<T>;
};

export async function request<T>(path: string, { method = "GET", body, token, schema }: RequestOptions<T>): Promise<T> {
  return requestUrl(`${API_BASE_URL}${path}`, { method, body, token, schema });
}

export async function requestUrl<T>(url: string, { method = "GET", body, token, schema }: RequestOptions<T>): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = response.status === 204 ? undefined : await response.json().catch(() => undefined);
  if (!response.ok) throw new ApiError(response.status, data);
  return schema.parse(data);
}
