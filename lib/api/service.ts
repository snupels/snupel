import { z } from "zod";
import {
  activityCreateSchema,
  activityPatchSchema,
  activityExploreResponseSchema,
  activityResponseSchema,
  authProviderSchema,
  authResponseSchema,
  authUserSchema,
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
  courseRecommendationRequestSchema,
  courseRecommendationResponseSchema,
  communityFeedResponseSchema,
  courseResponseSchema,
  eventsExploreQuerySchema,
  feedVisibilityUpdateSchema,
  loginRequestSchema,
  oauthAuthorizeResponseSchema,
  oauthLoginRequestSchema,
  openMeteoResponseSchema,
  profileUpdateSchema,
  profileUploadRequestSchema,
  profileUploadResponseSchema,
  accountReminderSchema,
  passwordResetRequestSchema,
  passwordResetConfirmSchema,
  messageResponseSchema,
  passportInputSchema,
  passportResponseSchema,
  missionProgressSchema,
  rejectSubmissionSchema,
  signupRequestSchema,
  sportsExploreQuerySchema,
  stampSubmissionCreateSchema,
  stampSubmissionResponseSchema,
  submissionStatusSchema,
  uploadUrlRequestSchema,
  uploadUrlResponseSchema,
  weatherQuerySchema,
  weatherResponseSchema,
  type ActivityCreate,
  type ActivityPatch,
  type AuthProvider,
  type AuthUser,
  type CollectedBadgeCreate,
  type CollectedBadgePatch,
  type CollectedStampCreate,
  type CollectedStampPatch,
  type CourseCreate,
  type CoursePatch,
  type CourseRecommendationRequest,
  type EventsExploreQuery,
  type FeedVisibilityUpdate,
  type LoginRequest,
  type OAuthLoginRequest,
  type PassportInput,
  type ProfileUpdate,
  type ProfileUploadRequest,
  type PasswordResetConfirm,
  type SignupRequest,
  type SportsExploreQuery,
  type StampSubmissionCreate,
  type SubmissionStatus,
  type UploadUrlRequest,
  type WeatherQuery,
} from "./dto";
import { request, requestUrl } from "./repository";

const TOKEN_KEY = "sportspassport-access-token";
const USER_KEY = "sportspassport-auth-user";
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

function saveToken(auth: { accessToken: string; user: AuthUser }) {
  sessionStorage.setItem(TOKEN_KEY, auth.accessToken);
  sessionStorage.setItem(USER_KEY, JSON.stringify(auth.user));
  window.dispatchEvent(new Event("sportspassport-auth-change"));
  return auth;
}

function currentUser() {
  if (typeof window === "undefined") return undefined;
  const saved = sessionStorage.getItem(USER_KEY);
  if (!saved) return undefined;
  try {
    return authUserSchema.parse(JSON.parse(saved));
  } catch {
    sessionStorage.removeItem(USER_KEY);
    return undefined;
  }
}

function saveUser(user: AuthUser) {
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

function queryString(input: Record<string, unknown>) {
  const params = new URLSearchParams();
  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

function pageQuery(page = 1, size = 20) {
  return queryString({ page: positiveIntSchema.parse(page), size: pageSizeSchema.parse(size) });
}

const positiveIntSchema = z.number().int().positive();
const pageSizeSchema = positiveIntSchema.max(100);

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
  currentUser,
  me: () => withToken("/auth/me", authUserSchema).then(saveUser),
  updateProfile: (input: ProfileUpdate) => withToken("/auth/me", authUserSchema, "PATCH", profileUpdateSchema.parse(input)).then(saveUser),
  createProfileUploadUrl: (input: ProfileUploadRequest) => withToken(
    "/auth/profile-photo/upload-url",
    profileUploadResponseSchema,
    "POST",
    profileUploadRequestSchema.parse(input),
  ),
  accountReminder: (email: string) => request("/auth/account-reminder", {
    method: "POST",
    body: accountReminderSchema.parse({ email }),
    schema: messageResponseSchema,
  }),
  requestPasswordReset: (email: string) => request("/auth/password-reset/request", {
    method: "POST",
    body: passwordResetRequestSchema.parse({ email }),
    schema: messageResponseSchema,
  }),
  confirmPasswordReset: (input: PasswordResetConfirm) => request("/auth/password-reset/confirm", {
    method: "POST",
    body: passwordResetConfirmSchema.parse(input),
    schema: messageResponseSchema,
  }),
  logout: () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event("sportspassport-auth-change"));
  },
  badges: resource("/badges", badgeInputSchema, badgeInputSchema, badgeResponseSchema),
  activities: resource<ActivityCreate, ActivityPatch, z.infer<typeof activityResponseSchema>>("/activities", activityCreateSchema, activityPatchSchema, activityResponseSchema),
  courses: resource<CourseCreate, CoursePatch, z.infer<typeof courseResponseSchema>>("/courses", courseCreateSchema, coursePatchSchema, courseResponseSchema),
  passports: resource<PassportInput, PassportInput, z.infer<typeof passportResponseSchema>>("/passports", passportInputSchema, passportInputSchema, passportResponseSchema),
  collectedBadges: resource<CollectedBadgeCreate, CollectedBadgePatch, z.infer<typeof collectedBadgeResponseSchema>>("/collected-badges", collectedBadgeCreateSchema, collectedBadgePatchSchema, collectedBadgeResponseSchema),
  collectedStamps: resource<CollectedStampCreate, CollectedStampPatch, z.infer<typeof collectedStampResponseSchema>>("/collected-stamps", collectedStampCreateSchema, collectedStampPatchSchema, collectedStampResponseSchema),
  sports: {
    list: (input: SportsExploreQuery = {}) => {
      const query = sportsExploreQuerySchema.parse(input);
      return request(`/sports${queryString(query)}`, { schema: z.array(activityExploreResponseSchema) });
    },
  },
  events: {
    list: (input: EventsExploreQuery = {}) => {
      const query = eventsExploreQuerySchema.parse(input);
      return request(`/events${queryString(query)}`, { schema: z.array(activityExploreResponseSchema) });
    },
  },
  weather: (input: WeatherQuery) => {
    const query = weatherQuerySchema.parse(input);
    return request(`/weather${queryString(query)}`, { schema: weatherResponseSchema });
  },
  openMeteoWeather: (input: WeatherQuery) => {
    const coordinates = weatherQuerySchema.parse(input);
    const params = new URLSearchParams({
      latitude: String(coordinates.latitude),
      longitude: String(coordinates.longitude),
      current: "temperature_2m,relative_humidity_2m,weather_code",
      daily: "weather_code,temperature_2m_max,temperature_2m_min",
      forecast_days: "1",
      timezone: "Asia/Seoul",
    });
    return requestUrl(`https://api.open-meteo.com/v1/forecast?${params}`, { schema: openMeteoResponseSchema });
  },
  courseRecommendations: (input: CourseRecommendationRequest) => withToken(
    "/course-recommendations",
    courseRecommendationResponseSchema,
    "POST",
    courseRecommendationRequestSchema.parse(input),
  ),
  passportMissions: (passportId: number, page = 1, size = 20) => withToken(
    `/passports/${itemIdSchema.parse(passportId)}/missions${pageQuery(page, size)}`,
    z.array(missionProgressSchema),
  ),
  stampSubmissions: {
    list: (page = 1, size = 20) => withToken(`/stamp-submissions${pageQuery(page, size)}`, z.array(stampSubmissionResponseSchema)),
    create: (input: StampSubmissionCreate) => withToken("/stamp-submissions", stampSubmissionResponseSchema, "POST", stampSubmissionCreateSchema.parse(input)),
    createUploadUrl: (input: UploadUrlRequest) => withToken("/stamp-submissions/upload-url", uploadUrlResponseSchema, "POST", uploadUrlRequestSchema.parse(input)),
    updateFeedVisibility: (id: number, input: FeedVisibilityUpdate) => withToken(
      `/stamp-submissions/${itemIdSchema.parse(id)}/feed`,
      stampSubmissionResponseSchema,
      "PATCH",
      feedVisibilityUpdateSchema.parse(input),
    ),
  },
  communityFeed: {
    list: (page = 1, size = 20) => request(
      `/community-feed${pageQuery(page, size)}`,
      { schema: z.array(communityFeedResponseSchema) },
    ),
    mine: (page = 1, size = 20) => withToken(
      `/community-feed/me${pageQuery(page, size)}`,
      z.array(communityFeedResponseSchema),
    ),
  },
  adminStampSubmissions: {
    list: (status: SubmissionStatus = "pending", page = 1, size = 20) => withToken(
      `/admin/stamp-submissions${queryString({ status: submissionStatusSchema.parse(status), page: positiveIntSchema.parse(page), size: pageSizeSchema.parse(size) })}`,
      z.array(stampSubmissionResponseSchema),
    ),
    approve: (id: number) => withToken(`/admin/stamp-submissions/${itemIdSchema.parse(id)}/approve`, stampSubmissionResponseSchema, "POST"),
    reject: (id: number, reason: string) => withToken(
      `/admin/stamp-submissions/${itemIdSchema.parse(id)}/reject`,
      stampSubmissionResponseSchema,
      "POST",
      rejectSubmissionSchema.parse({ reason }),
    ),
  },
};
