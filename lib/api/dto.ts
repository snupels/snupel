import { z } from "zod";

const positiveInt = z.number().int().positive();
const nullableUrl = z.url().nullable();
const apiDateTime = z.iso.datetime({ local: true });
const timestamps = {
  id: positiveInt,
  createdAt: apiDateTime,
  updatedAt: apiDateTime,
};

export const authProviderSchema = z.enum(["google", "kakao"]);
export const genderSchema = z.enum(["male", "female", "other", "unknown"]);
const phoneNumberSchema = z.string().trim().regex(/^01[016789]-?\d{3,4}-?\d{4}$/);
export const activityCategorySchema = z.enum(["sports", "event", "festival", "tourism"]);
export const courseThemeSchema = z.enum(["healing", "thrill", "photo_spot", "stamp"]);
export const submissionStatusSchema = z.enum(["pending", "approved", "rejected"]);

export const signupRequestSchema = z.strictObject({
  email: z.email(),
  password: z.string().min(8).max(128),
  birthDate: z.iso.date().nullable().optional(),
  gender: genderSchema.nullable().optional(),
  nickname: z.string().trim().min(2).max(30),
  phoneNumber: phoneNumberSchema,
  agreeTerms: z.literal(true),
  agreePrivacy: z.literal(true),
  agreeMarketingEmail: z.boolean().default(false),
  agreeMarketingSns: z.boolean().default(false),
});
export const loginRequestSchema = z.strictObject({
  email: z.email(),
  password: z.string().min(1).max(128),
});
export const oauthLoginRequestSchema = z.strictObject({
  code: z.string().min(1),
  redirectUri: z.url(),
  state: z.string().min(1),
});
export const authUserSchema = z.strictObject({
  id: positiveInt,
  email: z.email(),
  nickname: z.string().nullable().default(null),
  phoneNumber: z.string().nullable().default(null),
  profileImageUrl: z.string().nullable().default(null),
  birthDate: z.string().nullable().default(null),
  gender: genderSchema.nullable().default(null),
  onboardingRequired: z.boolean().default(true),
  marketingEmailAgreed: z.boolean().default(false),
  marketingSnsAgreed: z.boolean().default(false),
});
export const authResponseSchema = z.strictObject({
  accessToken: z.string(),
  tokenType: z.string().default("Bearer"),
  expiresIn: positiveInt,
  user: authUserSchema,
});
export const oauthAuthorizeResponseSchema = z.strictObject({
  provider: authProviderSchema,
  authorizationUrl: z.url(),
});
export const profileUpdateSchema = z.strictObject({
  nickname: z.string().min(2).max(30).nullable().optional(),
  phoneNumber: phoneNumberSchema.nullable().optional(),
  profileImageKey: z.string().max(500).nullable().optional(),
  birthDate: z.iso.date().nullable().optional(),
  gender: genderSchema.nullable().optional(),
  agreeTerms: z.literal(true).optional(),
  agreePrivacy: z.literal(true).optional(),
  agreeMarketingEmail: z.boolean().optional(),
  agreeMarketingSns: z.boolean().optional(),
});
export const profileUploadRequestSchema = z.strictObject({ contentType: z.enum(["image/jpeg", "image/png", "image/webp"]) });
export const profileUploadResponseSchema = z.strictObject({
  uploadUrl: z.url(),
  fields: z.record(z.string(), z.string()),
  objectKey: z.string(),
  expiresIn: positiveInt,
});
export const accountReminderSchema = z.strictObject({ email: z.email() });
export const passwordResetRequestSchema = z.strictObject({ email: z.email() });
export const passwordResetConfirmSchema = z.strictObject({
  email: z.email(),
  code: z.string().regex(/^\d{6}$/),
  newPassword: z.string().min(8).max(128),
});
export const passwordVerifySchema = z.strictObject({
  currentPassword: z.string().min(1).max(128),
});
export const passwordChangeSchema = z.strictObject({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(8).max(128),
});
export const messageResponseSchema = z.strictObject({ message: z.string() });

export const badgeInputSchema = z.strictObject({
  image_url: nullableUrl.optional(),
  description: z.string().min(1).nullable().optional(),
});
export const badgeResponseSchema = z.object({
  ...timestamps,
  imageUrl: z.string().nullable(),
  description: z.string().nullable(),
});

const activityFields = {
  representative_image_url: nullableUrl.optional(),
  sport_name: z.string().max(100).nullable().optional(),
  region: z.string().max(100).nullable().optional(),
  sigun: z.string().max(100).nullable().optional(),
  place_name: z.string().max(255).nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  source: z.string().max(50).nullable().optional(),
  external_id: z.string().max(100).nullable().optional(),
  summary: z.string().nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  source_url: nullableUrl.optional(),
  starts_at: apiDateTime.nullable().optional(),
  ends_at: apiDateTime.nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  last_synced_at: apiDateTime.nullable().optional(),
  is_active: z.boolean().optional(),
};
export const activityCreateSchema = z.strictObject({
  category: activityCategorySchema,
  ...activityFields,
});
export const activityPatchSchema = z.strictObject({
  category: activityCategorySchema.nullable().optional(),
  ...activityFields,
});
export const activityResponseSchema = z.object({
  ...timestamps,
  category: activityCategorySchema,
  representativeImageUrl: z.string().nullable(),
  sportName: z.string().nullable(),
  region: z.string().nullable(),
  sigun: z.string().nullable().optional(),
  placeName: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  source: z.string().nullable().optional(),
  externalId: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  sourceUrl: z.string().nullable().optional(),
  startsAt: apiDateTime.nullable().optional(),
  endsAt: apiDateTime.nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  lastSyncedAt: apiDateTime.nullable().optional(),
  isActive: z.boolean().default(true),
});

export const activityExploreResponseSchema = activityResponseSchema.extend({
  themes: z.array(z.string()),
  hasMission: z.boolean(),
});

const courseFields = {
  recommended_companion: z.string().max(100).nullable().optional(),
  representative_image_url: nullableUrl.optional(),
  estimated_duration_minutes: positiveInt.nullable().optional(),
  title: z.string().max(255).nullable().optional(),
  description: z.string().nullable().optional(),
  is_published: z.boolean().optional(),
};
export const courseCreateSchema = z.strictObject({ ...courseFields, theme: courseThemeSchema });
export const coursePatchSchema = z.strictObject({
  ...courseFields,
  theme: courseThemeSchema.nullable().optional(),
});
export const courseResponseSchema = z.object({
  ...timestamps,
  category: activityCategorySchema,
  sportName: z.string().nullable(),
  recommendedCompanion: z.string().nullable(),
  representativeImageUrl: z.string().nullable(),
  estimatedDurationMinutes: z.number().int().nullable(),
  theme: courseThemeSchema,
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  isPublished: z.boolean().default(false),
});

export const courseItineraryStopSchema = z.object({
  position: z.number().int().nonnegative(),
  stampId: positiveInt,
  activityId: positiveInt,
  category: activityCategorySchema,
  placeName: z.string().nullable(),
  sportName: z.string().nullable(),
  address: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  estimatedMinutes: positiveInt,
});
export const courseItineraryResponseSchema = z.object({
  id: positiveInt,
  title: z.string().nullable(),
  description: z.string().nullable(),
  category: activityCategorySchema,
  sportName: z.string().nullable(),
  theme: courseThemeSchema,
  recommendedCompanion: z.string().nullable(),
  estimatedDurationMinutes: z.number().int().nonnegative(),
  stops: z.array(courseItineraryStopSchema),
});

export const passportInputSchema = z.strictObject({ user_id: positiveInt });
export const passportResponseSchema = z.object({ ...timestamps, userId: positiveInt });

export const collectedBadgeCreateSchema = z.strictObject({ passport_id: positiveInt, badge_id: positiveInt });
export const collectedBadgePatchSchema = z.strictObject({
  passport_id: positiveInt.nullable().optional(),
  badge_id: positiveInt.nullable().optional(),
});
export const collectedBadgeResponseSchema = z.object({
  id: positiveInt,
  passportId: positiveInt,
  badgeId: positiveInt,
  collectedAt: apiDateTime,
});

export const collectedStampCreateSchema = z.strictObject({ passport_id: positiveInt, stamp_id: positiveInt });
export const collectedStampPatchSchema = z.strictObject({
  passport_id: positiveInt.nullable().optional(),
  stamp_id: positiveInt.nullable().optional(),
});
export const collectedStampResponseSchema = z.object({
  id: positiveInt,
  passportId: positiveInt,
  stampId: positiveInt,
  collectedAt: apiDateTime,
});

export const sportsExploreQuerySchema = z.strictObject({
  region: z.string().max(100).optional(),
  sigun: z.string().max(100).optional(),
  sport: z.string().max(100).optional(),
  theme: z.string().max(30).optional(),
  mission: z.boolean().optional(),
  page: positiveInt.default(1),
  size: positiveInt.max(100).default(20),
});
export const eventsExploreQuerySchema = sportsExploreQuerySchema.omit({ sport: true, theme: true });
export const weatherQuerySchema = z.strictObject({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
export const weatherResponseSchema = z.strictObject({
  forecastAt: apiDateTime,
  temperatureC: z.number().nullable(),
  precipitationProbability: z.number().int().nullable(),
  sky: z.string().nullable(),
  precipitationType: z.string().nullable(),
});
export const openMeteoResponseSchema = z.object({
  current: z.object({
    time: z.string(),
    temperature_2m: z.number(),
    relative_humidity_2m: z.number(),
    weather_code: z.number().int(),
  }),
  daily: z.object({
    time: z.array(z.string()),
    weather_code: z.array(z.number().int()),
    temperature_2m_max: z.array(z.number()),
    temperature_2m_min: z.array(z.number()),
  }),
});

export const courseRecommendationRequestSchema = z.strictObject({
  theme: courseThemeSchema,
  region: z.string().min(1).max(100),
  sigun: z.string().max(100).nullable().optional(),
  sport: z.string().max(100).nullable().optional(),
  availableMinutes: positiveInt.max(1440),
});
export const recommendedStopSchema = z.strictObject({
  activityId: z.number().int(),
  reason: z.string(),
  estimatedMinutes: positiveInt,
});
export const courseRecommendationResponseSchema = z.strictObject({
  stops: z.array(recommendedStopSchema),
  usedAi: z.boolean(),
  matchScore: z.number().int().min(0).max(100),
});

export const missionProgressSchema = z.strictObject({
  courseId: positiveInt,
  title: z.string().nullable(),
  theme: z.string(),
  totalStamps: z.number().int().nonnegative(),
  collectedStamps: z.number().int().nonnegative(),
  completed: z.boolean(),
});

export const stampSubmissionCreateSchema = z.strictObject({
  passport_id: positiveInt,
  stamp_id: positiveInt,
  object_key: z.string().min(1).max(500),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  gps_accuracy_m: z.number().positive().max(5000),
  captured_at: apiDateTime,
  share_to_feed: z.boolean().optional(),
  feed_caption: z.string().max(300).nullable().optional(),
});
export const uploadUrlRequestSchema = z.strictObject({
  passport_id: positiveInt,
  stamp_id: positiveInt,
  content_type: z.string().min(1),
});
export const uploadUrlResponseSchema = z.strictObject({
  uploadUrl: z.string(),
  fields: z.record(z.string(), z.string()),
  objectKey: z.string(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  gpsAccuracyM: z.number().nullable(),
  capturedAt: apiDateTime.nullable(),
  expiresIn: z.number().int(),
});
export const stampSubmissionResponseSchema = z.object({
  ...timestamps,
  passportId: z.number().int(),
  stampId: z.number().int(),
  objectKey: z.string(),
  status: submissionStatusSchema,
  reviewerId: z.number().int().nullable(),
  reviewedAt: apiDateTime.nullable(),
  rejectionReason: z.string().nullable(),
  proofUrl: z.string().nullable().optional(),
  shareToFeed: z.boolean().default(false),
  feedCaption: z.string().nullable().default(null),
});
export const feedVisibilityUpdateSchema = z.strictObject({
  share_to_feed: z.boolean(),
  feed_caption: z.string().max(300).nullable().optional(),
});
export const communityFeedResponseSchema = z.object({
  id: positiveInt,
  proofUrl: z.string().nullable(),
  caption: z.string().nullable(),
  authorName: z.string(),
  placeName: z.string().nullable(),
  sigun: z.string().nullable(),
  sportName: z.string().nullable(),
  approvedAt: apiDateTime,
});
export const rejectSubmissionSchema = z.strictObject({ reason: z.string().min(1).max(1000) });

export type AuthProvider = z.infer<typeof authProviderSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type SignupRequest = z.infer<typeof signupRequestSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type OAuthLoginRequest = z.infer<typeof oauthLoginRequestSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;
export type ProfileUploadRequest = z.infer<typeof profileUploadRequestSchema>;
export type PasswordResetConfirm = z.infer<typeof passwordResetConfirmSchema>;
export type PasswordVerify = z.infer<typeof passwordVerifySchema>;
export type PasswordChange = z.infer<typeof passwordChangeSchema>;
export type BadgeInput = z.infer<typeof badgeInputSchema>;
export type BadgeResponse = z.infer<typeof badgeResponseSchema>;
export type ActivityCreate = z.infer<typeof activityCreateSchema>;
export type ActivityPatch = z.infer<typeof activityPatchSchema>;
export type ActivityResponse = z.infer<typeof activityResponseSchema>;
export type ActivityExploreResponse = z.infer<typeof activityExploreResponseSchema>;
export type CourseCreate = z.infer<typeof courseCreateSchema>;
export type CoursePatch = z.infer<typeof coursePatchSchema>;
export type CourseResponse = z.infer<typeof courseResponseSchema>;
export type CourseItineraryResponse = z.infer<typeof courseItineraryResponseSchema>;
export type PassportInput = z.infer<typeof passportInputSchema>;
export type PassportResponse = z.infer<typeof passportResponseSchema>;
export type CollectedBadgeCreate = z.infer<typeof collectedBadgeCreateSchema>;
export type CollectedBadgePatch = z.infer<typeof collectedBadgePatchSchema>;
export type CollectedBadgeResponse = z.infer<typeof collectedBadgeResponseSchema>;
export type CollectedStampCreate = z.infer<typeof collectedStampCreateSchema>;
export type CollectedStampPatch = z.infer<typeof collectedStampPatchSchema>;
export type CollectedStampResponse = z.infer<typeof collectedStampResponseSchema>;
export type SportsExploreQuery = z.input<typeof sportsExploreQuerySchema>;
export type EventsExploreQuery = z.input<typeof eventsExploreQuerySchema>;
export type WeatherQuery = z.infer<typeof weatherQuerySchema>;
export type WeatherResponse = z.infer<typeof weatherResponseSchema>;
export type OpenMeteoResponse = z.infer<typeof openMeteoResponseSchema>;
export type CourseRecommendationRequest = z.infer<typeof courseRecommendationRequestSchema>;
export type CourseRecommendationResponse = z.infer<typeof courseRecommendationResponseSchema>;
export type MissionProgress = z.infer<typeof missionProgressSchema>;
export type StampSubmissionCreate = z.infer<typeof stampSubmissionCreateSchema>;
export type UploadUrlRequest = z.infer<typeof uploadUrlRequestSchema>;
export type UploadUrlResponse = z.infer<typeof uploadUrlResponseSchema>;
export type StampSubmissionResponse = z.infer<typeof stampSubmissionResponseSchema>;
export type FeedVisibilityUpdate = z.infer<typeof feedVisibilityUpdateSchema>;
export type CommunityFeedResponse = z.infer<typeof communityFeedResponseSchema>;
export type SubmissionStatus = z.infer<typeof submissionStatusSchema>;
