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
import {
  ActivityCreateSchema,
  ActivityPatchSchema,
  ActivityResponseSchema,
} from "@/lib/activities/dto";
import {
  BadgeCreateSchema,
  BadgePatchSchema,
  BadgeResponseSchema,
} from "@/lib/badges/dto";
import {
  CollectedBadgeCreateSchema,
  CollectedBadgePatchSchema,
  CollectedBadgeResponseSchema,
} from "@/lib/collected-badges/dto";
import {
  CollectedStampCreateSchema,
  CollectedStampPatchSchema,
  CollectedStampResponseSchema,
} from "@/lib/collected-stamps/dto";
import {
  CourseCreateSchema,
  CoursePatchSchema,
  CourseResponseSchema,
} from "@/lib/courses/dto";
import {
  PassportCreateSchema,
  PassportPatchSchema,
  PassportResponseSchema,
} from "@/lib/passports/dto";

const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

registry.register("HealthResponse", HealthResponseSchema);
registry.register("SignupRequest", SignupRequestSchema);
registry.register("LoginRequest", LoginRequestSchema);
registry.register("OAuthLoginRequest", OAuthLoginRequestSchema);
registry.register("OAuthAuthorizeResponse", OAuthAuthorizeResponseSchema);
registry.register("AuthResponse", AuthResponseSchema);
registry.register("ErrorResponse", ErrorResponseSchema);

type CrudDocs = {
  path: string;
  tag: string;
  create: z.ZodType;
  patch: z.ZodType;
  response: z.ZodType;
  privateRead?: boolean;
};

const bearer = [{ bearerAuth: [] }];
const body = (schema: z.ZodType) => ({
  content: { "application/json": { schema } },
});
const response = (schema: z.ZodType) => ({
  description: "Success.",
  content: { "application/json": { schema } },
});

function registerCrud(docs: CrudDocs) {
  const params = z.object({ id: z.coerce.number().int().positive() });
  const errors = {
    400: response(ErrorResponseSchema),
    401: response(ErrorResponseSchema),
    403: response(ErrorResponseSchema),
    404: response(ErrorResponseSchema),
    409: response(ErrorResponseSchema),
  };

  registry.registerPath({
    method: "get",
    path: docs.path,
    tags: [docs.tag],
    security: docs.privateRead ? bearer : undefined,
    responses: { 200: response(z.array(docs.response)), ...errors },
  });
  registry.registerPath({
    method: "post",
    path: docs.path,
    tags: [docs.tag],
    security: bearer,
    request: { body: body(docs.create) },
    responses: { 201: response(docs.response), ...errors },
  });
  registry.registerPath({
    method: "get",
    path: `${docs.path}/{id}`,
    tags: [docs.tag],
    security: docs.privateRead ? bearer : undefined,
    request: { params },
    responses: { 200: response(docs.response), ...errors },
  });
  registry.registerPath({
    method: "patch",
    path: `${docs.path}/{id}`,
    tags: [docs.tag],
    security: bearer,
    request: { params, body: body(docs.patch) },
    responses: { 200: response(docs.response), ...errors },
  });
  registry.registerPath({
    method: "delete",
    path: `${docs.path}/{id}`,
    tags: [docs.tag],
    security: bearer,
    request: { params },
    responses: { 204: { description: "Deleted." }, ...errors },
  });
}

registerCrud({
  path: "/api/badges",
  tag: "Badges",
  create: BadgeCreateSchema,
  patch: BadgePatchSchema,
  response: BadgeResponseSchema,
});
registerCrud({
  path: "/api/activities",
  tag: "Activities",
  create: ActivityCreateSchema,
  patch: ActivityPatchSchema,
  response: ActivityResponseSchema,
});
registerCrud({
  path: "/api/courses",
  tag: "Courses",
  create: CourseCreateSchema,
  patch: CoursePatchSchema,
  response: CourseResponseSchema,
});
registerCrud({
  path: "/api/passports",
  tag: "Passports",
  create: PassportCreateSchema,
  patch: PassportPatchSchema,
  response: PassportResponseSchema,
  privateRead: true,
});
registerCrud({
  path: "/api/collected-badges",
  tag: "Collected badges",
  create: CollectedBadgeCreateSchema,
  patch: CollectedBadgePatchSchema,
  response: CollectedBadgeResponseSchema,
  privateRead: true,
});
registerCrud({
  path: "/api/collected-stamps",
  tag: "Collected stamps",
  create: CollectedStampCreateSchema,
  patch: CollectedStampPatchSchema,
  response: CollectedStampResponseSchema,
  privateRead: true,
});

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
      { name: "Badges" },
      { name: "Activities" },
      { name: "Courses" },
      { name: "Passports" },
      { name: "Collected badges" },
      { name: "Collected stamps" },
    ],
  });
}
