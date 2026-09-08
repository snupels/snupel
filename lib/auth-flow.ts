import { z } from "zod";

export const OAUTH_SESSION_KEY = "sportspassport-oauth";
const DEFAULT_RETURN_PATH = "/mypage/";

/** Only return to this site; never trust an OAuth or login query as a URL. */
export function safeReturnPath(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return DEFAULT_RETURN_PATH;
  try {
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith("//") || decoded.includes("\\") || decoded.split("").some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)) return DEFAULT_RETURN_PATH;
    const url = new URL(value, "https://sportspassport.kr");
    if (url.origin !== "https://sportspassport.kr" || /^\/(login|onboarding)(\/|$)/.test(url.pathname)) return DEFAULT_RETURN_PATH;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return DEFAULT_RETURN_PATH; }
}

export function loginHref(path: string): string {
  return `/login/?next=${encodeURIComponent(safeReturnPath(path))}`;
}

export function authDestination(onboardingRequired: boolean, next: unknown): string {
  const path = safeReturnPath(next);
  return onboardingRequired ? `/onboarding/?next=${encodeURIComponent(path)}` : path;
}

const oauthSessionSchema = z.object({
  provider: z.enum(["google", "kakao"]),
  redirectUri: z.url(),
  next: z.string().optional(),
  createdAt: z.number().optional(),
});

export function parseOAuthSession(saved: string | null, origin: string, now = Date.now()) {
  try {
    const session = oauthSessionSchema.parse(JSON.parse(saved ?? "null"));
    if (session.redirectUri !== new URL("/login/", origin).toString()) return null;
    if (session.createdAt !== undefined && (now - session.createdAt > 600_000 || session.createdAt > now)) return null;
    return { ...session, next: safeReturnPath(session.next) };
  } catch { return null; }
}

export function authErrorMessage(reason: unknown): string {
  const error = reason as { status?: number; body?: { error?: string } } | null;
  const messages: Record<string, string> = {
    invalid_credentials: "이메일 또는 비밀번호를 확인해 주세요.",
    email_already_exists: "이미 가입한 이메일입니다. 로그인하거나 비밀번호 찾기를 이용해 주세요.",
    invalid_oauth_state: "소셜 로그인 요청이 만료되었거나 다른 창에서 시작되었습니다. 이 창에서 다시 로그인해 주세요.",
    oauth_code_expired: "소셜 로그인 인증이 만료되었습니다. 카카오 또는 Google 버튼을 눌러 다시 시작해 주세요.",
    oauth_unavailable: "소셜 로그인 제공자에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    oauth_not_configured: "소셜 로그인 연결 설정을 확인 중입니다. 잠시 후 다시 시도하거나 이메일로 로그인해 주세요.",
    invalid_request: "입력 내용 또는 로그인 연결 정보를 확인해 주세요.",
    rate_limited: "요청이 많습니다. 잠시 기다린 후 다시 시도해 주세요.",
  };
  if (error?.body?.error && messages[error.body.error]) return messages[error.body.error];
  if (error?.status === 401) return messages.invalid_credentials;
  if (error?.status === 429) return messages.rate_limited;
  return "요청을 처리하지 못했습니다. 인터넷 연결을 확인하고 다시 시도해 주세요.";
}
