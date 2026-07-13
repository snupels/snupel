import { z } from "zod";
import {
  activityCreateSchema,
  activityPatchSchema,
  activityResponseSchema,
  authProviderSchema,
  authResponseSchema,
  badgeInputSchema,
  badgeResponseSchema,
  collectedBadgeCreateSchema,
  collectedBadgePatchSchema,
  collectedBadgeResponseSchema,
  collectedStampCreateSchema,
  collectedStampPatchSchema,
  collectedStampResponseSchema,
  courseCreateSchema,
  coursePatchSchema,
  courseResponseSchema,
  loginRequestSchema,
  oauthAuthorizeResponseSchema,
  oauthLoginRequestSchema,
  passportInputSchema,
  passportResponseSchema,
  signupRequestSchema,
  type ActivityCreate,
  type ActivityPatch,
  type AuthProvider,
  type CollectedBadgeCreate,
  type CollectedBadgePatch,
  type CollectedStampCreate,
  type CollectedStampPatch,
  type CourseCreate,
  type CoursePatch,
  type LoginRequest,
  type OAuthLoginRequest,
  type PassportInput,
  type SignupRequest,
} from "./dto";
import { request } from "./repository";

const TOKEN_KEY = "sportspassport-access-token";
const itemIdSchema = z.number().int().positive();
const emptySchema = z.undefined();

function token() {
  return typeof window === "undefined" ? undefined : sessionStorage.getItem(TOKEN_KEY) ?? undefined;
}

function withToken<T>(path: string, schema: z.ZodType<T>, method?: "GET" | "POST" | "PATCH" | "DELETE", body?: unknown) {
  return request(path, { method, body, token: token(), schema });
}

function resource<TCreate, TPatch, TResponse>(
  path: string,
  createSchema: z.ZodType<TCreate>,
  patchSchema: z.ZodType<TPatch>,
  responseSchema: z.ZodType<TResponse>,
) {
  return {
    list: () => withToken(path, z.array(responseSchema)),
    get: (id: number) => withToken(`${path}/${itemIdSchema.parse(id)}`, responseSchema),
    create: (input: TCreate) => withToken(path, responseSchema, "POST", createSchema.parse(input)),
    update: (id: number, input: TPatch) => withToken(`${path}/${itemIdSchema.parse(id)}`, responseSchema, "PATCH", patchSchema.parse(input)),
    remove: (id: number) => withToken(`${path}/${itemIdSchema.parse(id)}`, emptySchema, "DELETE"),
  };
}

function saveToken(auth: { accessToken: string }) {
  sessionStorage.setItem(TOKEN_KEY, auth.accessToken);
  return auth;
}

export const api = {
  health: () => request("/health", { schema: z.record(z.string(), z.string()) }),
  signup: (input: SignupRequest) => request("/auth/signup", { method: "POST", body: signupRequestSchema.parse(input), schema: authResponseSchema }).then(saveToken),
  login: (input: LoginRequest) => request("/auth/login", { method: "POST", body: loginRequestSchema.parse(input), schema: authResponseSchema }).then(saveToken),
  authorize: (provider: AuthProvider, redirectUri: string) => {
    const params = new URLSearchParams({ redirectUri: z.url().parse(redirectUri) });
    return request(`/auth/oauth/${authProviderSchema.parse(provider)}/authorize?${params}`, { schema: oauthAuthorizeResponseSchema });
  },
  oauthLogin: (provider: AuthProvider, input: OAuthLoginRequest) => request(`/auth/oauth/${authProviderSchema.parse(provider)}/login`, {
    method: "POST",
    body: oauthLoginRequestSchema.parse(input),
    schema: authResponseSchema,
  }).then(saveToken),
  hasToken: () => Boolean(token()),
  logout: () => sessionStorage.removeItem(TOKEN_KEY),
  badges: resource("/badges", badgeInputSchema, badgeInputSchema, badgeResponseSchema),
  activities: resource<ActivityCreate, ActivityPatch, z.infer<typeof activityResponseSchema>>("/activities", activityCreateSchema, activityPatchSchema, activityResponseSchema),
  courses: resource<CourseCreate, CoursePatch, z.infer<typeof courseResponseSchema>>("/courses", courseCreateSchema, coursePatchSchema, courseResponseSchema),
  passports: resource<PassportInput, PassportInput, z.infer<typeof passportResponseSchema>>("/passports", passportInputSchema, passportInputSchema, passportResponseSchema),
  collectedBadges: resource<CollectedBadgeCreate, CollectedBadgePatch, z.infer<typeof collectedBadgeResponseSchema>>("/collected-badges", collectedBadgeCreateSchema, collectedBadgePatchSchema, collectedBadgeResponseSchema),
  collectedStamps: resource<CollectedStampCreate, CollectedStampPatch, z.infer<typeof collectedStampResponseSchema>>("/collected-stamps", collectedStampCreateSchema, collectedStampPatchSchema, collectedStampResponseSchema),
};
