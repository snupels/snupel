import { randomBytes } from "node:crypto";

import { createAuthorizationUrl } from "@/lib/auth/oauth";
import { isAllowedRedirectUri } from "@/lib/auth/oauth";
import { AuthProviderSchema } from "@/schemas/auth";

type Context = {
  params: Promise<{
    provider: string;
  }>;
};

export async function GET(request: Request, context: Context) {
  const { provider: rawProvider } = await context.params;
  const provider = AuthProviderSchema.safeParse(rawProvider);
  const requestUrl = new URL(request.url);
  const redirectUri = requestUrl.searchParams.get("redirectUri");

  if (!provider.success) {
    return Response.json(
      { error: "unsupported_provider", message: "Unsupported OAuth provider." },
      { status: 400 },
    );
  }

  if (!redirectUri) {
    return Response.json(
      { error: "invalid_request", message: "redirectUri is required." },
      { status: 400 },
    );
  }

  if (!isAllowedRedirectUri(redirectUri)) {
    return Response.json(
      { error: "invalid_request", message: "redirectUri is not allowed." },
      { status: 400 },
    );
  }

  const state = randomBytes(32).toString("base64url");
  const authorizationUrl = createAuthorizationUrl({
    provider: provider.data,
    redirectUri,
    state,
  });

  return Response.json(
    {
      provider: provider.data,
      authorizationUrl,
    },
    {
      headers: {
        "Set-Cookie": `${oauthStateCookie(provider.data)}=${state}; Path=/api/auth/oauth/${provider.data}/login; Max-Age=600; HttpOnly; SameSite=Lax${
          process.env.NODE_ENV === "production" ? "; Secure" : ""
        }`,
      },
    },
  );
}

function oauthStateCookie(provider: string) {
  return `oauth_state_${provider}`;
}
