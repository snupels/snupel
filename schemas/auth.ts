import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const AuthProviderSchema = z
  .enum(["google", "kakao"])
  .meta({
    id: "AuthProvider"
  });

export const AuthUserSchema = z
  .object({
    id: z.number().int().positive(),
    email: z.email(),
  })
  .meta({
    id: "AuthUser"
  });

export const AuthResponseSchema = z
  .object({
    accessToken: z.string(),
    tokenType: z.literal("Bearer"),
    expiresIn: z.number().int().positive(),
    user: AuthUserSchema,
  })
  .meta({
    id: "AuthResponse"
  });

export const SignupRequestSchema = z
  .object({
    email: z.email(),
    password: z.string().min(8).max(128),
    birthDate: z.iso.date().optional(),
    gender: z.enum(["male", "female", "other", "unknown"]).optional(),
  })
  .meta({
    id: "SignupRequest"
  });

export const LoginRequestSchema = z
  .object({
    email: z.email(),
    password: z.string().min(1).max(128),
  })
  .meta({
    id: "LoginRequest"
  });

export const OAuthAuthorizeResponseSchema = z
  .object({
    provider: AuthProviderSchema,
    authorizationUrl: z.url(),
  })
  .meta({
    id: "OAuthAuthorizeResponse"
  });

export const OAuthLoginRequestSchema = z
  .object({
    code: z.string().min(1),
    redirectUri: z.url(),
    state: z.string().min(1),
  })
  .meta({
    id: "OAuthLoginRequest"
  });

export const ErrorResponseSchema = z
  .object({
    error: z.string(),
    message: z.string(),
  })
  .meta({
    id: "ErrorResponse"
  });

export type AuthProvider = z.infer<typeof AuthProviderSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type SignupRequest = z.infer<typeof SignupRequestSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type OAuthLoginRequest = z.infer<typeof OAuthLoginRequestSchema>;
