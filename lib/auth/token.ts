import { createHmac } from "node:crypto";

const DEFAULT_EXPIRES_IN = 60 * 60 * 24 * 7;

type JwtPayload = {
  sub: string;
  email: string;
  iat: number;
  exp: number;
};

function base64Url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is required.");
  }

  return secret;
}

export function getAccessTokenExpiresIn() {
  const value = Number(process.env.AUTH_ACCESS_TOKEN_EXPIRES_IN);

  return Number.isFinite(value) && value > 0 ? value : DEFAULT_EXPIRES_IN;
}

export function signAccessToken(user: { id: number; email: string }) {
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = getAccessTokenExpiresIn();
  const payload: JwtPayload = {
    sub: String(user.id),
    email: user.email,
    iat: now,
    exp: now + expiresIn,
  };

  const encodedHeader = base64Url(
    JSON.stringify({ alg: "HS256", typ: "JWT" }),
  );
  const encodedPayload = base64Url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac("sha256", getJwtSecret())
    .update(signingInput)
    .digest("base64url");

  return {
    accessToken: `${signingInput}.${signature}`,
    expiresIn,
  };
}
