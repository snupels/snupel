import { authJson } from "@/lib/auth/route";
import { AuthError, loginWithOAuth } from "@/lib/auth/service";
import { AuthProviderSchema, OAuthLoginRequestSchema } from "@/schemas/auth";

type Context = {
  params: Promise<{
    provider: string;
  }>;
};

export async function POST(request: Request, context: Context) {
  const { provider: rawProvider } = await context.params;
  const provider = AuthProviderSchema.safeParse(rawProvider);

  if (!provider.success) {
    return Response.json(
      { error: "unsupported_provider", message: "Unsupported OAuth provider." },
      { status: 400 },
    );
  }

  const response = await authJson(request, OAuthLoginRequestSchema, (input) => {
    const expectedState = getCookie(request, oauthStateCookie(provider.data));

    if (!expectedState || input.state !== expectedState) {
      throw new AuthError("invalid_oauth_state", "Invalid OAuth state.");
    }

    return loginWithOAuth({ provider: provider.data, ...input });
  });

  response.headers.append(
    "Set-Cookie",
    `${oauthStateCookie(provider.data)}=; Path=/api/auth/oauth/${provider.data}/login; Max-Age=0; HttpOnly; SameSite=Lax`,
  );

  return response;
}

function oauthStateCookie(provider: string) {
  return `oauth_state_${provider}`;
}

function getCookie(request: Request, name: string) {
  return request.headers
    .get("cookie")
    ?.split(";")
    .map((cookie) => cookie.trim().split("="))
    .find(([key]) => key === name)?.[1];
}
