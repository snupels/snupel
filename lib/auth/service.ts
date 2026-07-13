import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { socialAccounts, users } from "@/lib/db/schema";
import type { AuthProvider, AuthResponse } from "@/schemas/auth";

import { hashPassword, verifyPassword } from "./password";
import { fetchOAuthProfile, isAllowedRedirectUri } from "./oauth";
import { signAccessToken } from "./token";
import { AuthError } from "./error";

export { AuthError } from "./error";

type AuthUser = {
  id: number;
  email: string;
};

function createAuthResponse(user: AuthUser): AuthResponse {
  const token = signAccessToken(user);

  return {
    ...token,
    tokenType: "Bearer",
    user,
  };
}

export async function signupWithEmail(input: {
  email: string;
  password: string;
  birthDate?: string;
  gender?: "male" | "female" | "other" | "unknown";
}) {
  const normalizedEmail = input.email.toLowerCase();
  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new AuthError("email_already_exists", "Email is already registered.");
  }

  const passwordHash = await hashPassword(input.password);
  const [inserted] = await db
    .insert(users)
    .values({
      email: normalizedEmail,
      passwordHash,
      birthDate: input.birthDate ? new Date(input.birthDate) : undefined,
      gender: input.gender,
    })
    .$returningId();

  return createAuthResponse({
    id: inserted.id,
    email: normalizedEmail,
  });
}

export async function loginWithEmail(input: { email: string; password: string }) {
  const user = await findUserByEmail(input.email.toLowerCase());

  if (!user?.passwordHash) {
    throw new AuthError("invalid_credentials", "Invalid email or password.");
  }

  const isValidPassword = await verifyPassword(input.password, user.passwordHash);

  if (!isValidPassword) {
    throw new AuthError("invalid_credentials", "Invalid email or password.");
  }

  return createAuthResponse(user);
}

export async function loginWithOAuth(input: {
  provider: AuthProvider;
  code: string;
  redirectUri: string;
  state?: string;
}) {
  if (!isAllowedRedirectUri(input.redirectUri)) {
    throw new AuthError("invalid_request", "redirectUri is not allowed.");
  }

  const profile = await fetchOAuthProfile(input);
  const providerUserId = profile.providerUserId;
  const socialAccount = await findSocialAccount(input.provider, providerUserId);

  if (socialAccount) {
    return createAuthResponse(socialAccount.user);
  }

  const email =
    profile.email?.toLowerCase() ??
    `${input.provider}_${providerUserId}@oauth.snupel.local`;
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new AuthError(
      "oauth_email_exists",
      "Email is already registered. Log in before linking OAuth.",
    );
  }

  const user = await createSocialOnlyUser({ email });

  await db.insert(socialAccounts).values({
    userId: user.id,
    provider: input.provider,
    providerUserId,
  });

  return createAuthResponse(user);
}

async function createSocialOnlyUser(input: { email: string }) {
  const [inserted] = await db
    .insert(users)
    .values({
      email: input.email,
      passwordHash: null,
    })
    .$returningId();

  return {
    id: inserted.id,
    email: input.email,
  };
}

async function findUserByEmail(email: string) {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user;
}

async function findSocialAccount(provider: AuthProvider, providerUserId: string) {
  const [account] = await db
    .select({
      user: {
        id: users.id,
        email: users.email,
      },
    })
    .from(socialAccounts)
    .innerJoin(users, eq(socialAccounts.userId, users.id))
    .where(
      and(
        eq(socialAccounts.provider, provider),
        eq(socialAccounts.providerUserId, providerUserId),
      ),
    )
    .limit(1);

  return account;
}
