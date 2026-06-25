import type { AuthProvider } from "@/schemas/auth";

type OAuthProviderConfig = {
  authorizationUrl: string;
  tokenUrl: string;
  profileUrl: string;
  clientIdEnv: string;
  clientSecretEnv: string;
  scope?: string;
};

export type OAuthProfile = {
  providerUserId: string;
  email?: string;
};

const providerConfigs = {
  google: {
    authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    profileUrl: "https://openidconnect.googleapis.com/v1/userinfo",
    clientIdEnv: "GOOGLE_CLIENT_ID",
    clientSecretEnv: "GOOGLE_CLIENT_SECRET",
    scope: "openid email profile",
  },
  kakao: {
    authorizationUrl: "https://kauth.kakao.com/oauth/authorize",
    tokenUrl: "https://kauth.kakao.com/oauth/token",
    profileUrl: "https://kapi.kakao.com/v2/user/me",
    clientIdEnv: "KAKAO_CLIENT_ID",
    clientSecretEnv: "KAKAO_CLIENT_SECRET",
    scope: "account_email",
  },
} satisfies Record<AuthProvider, OAuthProviderConfig>;

function getConfig(provider: AuthProvider) {
  const config: OAuthProviderConfig = providerConfigs[provider];
  const clientId = process.env[config.clientIdEnv];
  const clientSecret = process.env[config.clientSecretEnv];

  if (!clientId || !clientSecret) {
    throw new Error(
      `${config.clientIdEnv} and ${config.clientSecretEnv} are required.`,
    );
  }

  return { ...config, clientId, clientSecret };
}

export function createAuthorizationUrl(params: {
  provider: AuthProvider;
  redirectUri: string;
  state?: string;
}) {
  const config = getConfig(params.provider);
  const url = new URL(config.authorizationUrl);

  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("response_type", "code");

  if (params.state) {
    url.searchParams.set("state", params.state);
  }

  if (config.scope) {
    url.searchParams.set("scope", config.scope);
  }

  return url.toString();
}

export function isAllowedRedirectUri(redirectUri: string) {
  try {
    new URL(redirectUri);
  } catch {
    return false;
  }

  const allowed = process.env.AUTH_ALLOWED_REDIRECT_URIS?.split(",")
    .map((uri) => uri.trim())
    .filter(Boolean);

  return allowed?.length
    ? allowed.includes(redirectUri)
    : process.env.NODE_ENV !== "production";
}

export async function fetchOAuthProfile(params: {
  provider: AuthProvider;
  code: string;
  redirectUri: string;
  state?: string;
}): Promise<OAuthProfile> {
  const config = getConfig(params.provider);
  const accessToken = await exchangeCodeForAccessToken(config, params);
  const profileResponse = await fetch(config.profileUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!profileResponse.ok) {
    throw new Error(`Failed to fetch ${params.provider} profile.`);
  }

  const profile = await profileResponse.json();

  return normalizeProfile(params.provider, profile);
}

async function exchangeCodeForAccessToken(
  config: ReturnType<typeof getConfig>,
  params: {
    provider: AuthProvider;
    code: string;
    redirectUri: string;
    state?: string;
  },
) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: params.redirectUri,
    code: params.code,
  });

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Failed to exchange ${params.provider} OAuth code.`);
  }

  const token = await response.json();

  if (!token.access_token || typeof token.access_token !== "string") {
    throw new Error(`Invalid ${params.provider} token response.`);
  }

  return token.access_token;
}

function normalizeProfile(provider: AuthProvider, profile: unknown): OAuthProfile {
  if (provider === "google") {
    const googleProfile = profile as { sub?: unknown; email?: unknown };

    return {
      providerUserId: requiredString(googleProfile.sub, "google.sub"),
      email: optionalEmail(googleProfile.email),
    };
  }

  if (provider === "kakao") {
    const kakaoProfile = profile as {
      id?: unknown;
      kakao_account?: { email?: unknown };
    };

    return {
      providerUserId: requiredString(kakaoProfile.id, "kakao.id"),
      email: optionalEmail(kakaoProfile.kakao_account?.email),
    };
  }

  throw new Error(`Unsupported OAuth provider: ${provider}.`);
}

function requiredString(value: unknown, field: string) {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  throw new Error(`Missing required OAuth profile field: ${field}.`);
}

function optionalEmail(value: unknown) {
  return typeof value === "string" && value.includes("@") ? value : undefined;
}
