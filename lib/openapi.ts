import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import {
  AuthResponseSchema,
  AuthProviderSchema,
  ErrorResponseSchema,
  LoginRequestSchema,
  OAuthAuthorizeResponseSchema,
  OAuthLoginRequestSchema,
  SignupRequestSchema,
} from "@/schemas/auth";
import { HealthResponseSchema } from "@/schemas/health";

const registry = new OpenAPIRegistry();

registry.register("HealthResponse", HealthResponseSchema);
registry.register("SignupRequest", SignupRequestSchema);
registry.register("LoginRequest", LoginRequestSchema);
registry.register("OAuthLoginRequest", OAuthLoginRequestSchema);
registry.register("OAuthAuthorizeResponse", OAuthAuthorizeResponseSchema);
registry.register("AuthResponse", AuthResponseSchema);
registry.register("ErrorResponse", ErrorResponseSchema);

registry.registerPath({
  method: "get",
  path: "/api/health",
  summary: "Health check",
  description: "Returns the current service health status.",
  tags: ["System"],
  responses: {
    200: {
      description: "The service is healthy.",
      content: {
        "application/json": {
          schema: HealthResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/signup",
  summary: "Sign up with email and password",
  description: "Creates a normal user account and returns an access token.",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: SignupRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "The user was created and authenticated.",
      content: {
        "application/json": {
          schema: AuthResponseSchema,
        },
      },
    },
    400: {
      description: "The request is invalid or the email already exists.",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/login",
  summary: "Log in with email and password",
  description: "Authenticates a normal user and returns an access token.",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: LoginRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "The user was authenticated.",
      content: {
        "application/json": {
          schema: AuthResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid request or credentials.",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/auth/oauth/{provider}/authorize",
  summary: "Create OAuth authorization URL",
  description:
    "Returns a provider authorization URL. Supported providers: google, kakao.",
  tags: ["Auth"],
  request: {
    params: z.object({
      provider: AuthProviderSchema,
    }),
    query: z.object({
      redirectUri: z.url(),
    }),
  },
  responses: {
    200: {
      description: "Authorization URL for the provider.",
      content: {
        "application/json": {
          schema: OAuthAuthorizeResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid provider or request.",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/oauth/{provider}/login",
  summary: "Log in with OAuth code",
  description:
    "Exchanges an OAuth authorization code, creates or links the social account, and returns an access token.",
  tags: ["Auth"],
  request: {
    params: z.object({
      provider: AuthProviderSchema,
    }),
    body: {
      content: {
        "application/json": {
          schema: OAuthLoginRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "The user was authenticated.",
      content: {
        "application/json": {
          schema: AuthResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid provider or request.",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "Snupel API",
      version: "1.0.0",
    },
    tags: [
      {
        name: "Auth",
        description: "Signup and login endpoints.",
      },
      {
        name: "System",
        description: "Operational endpoints.",
      },
    ],
  });
}
