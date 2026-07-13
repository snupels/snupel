import { z } from "zod";

const positiveInt = z.number().int().positive();
const nullableUrl = z.url().nullable();
const timestamps = {
  id: positiveInt,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
};

export const authProviderSchema = z.enum(["google", "kakao"]);
export const genderSchema = z.enum(["male", "female", "other", "unknown"]);
export const activityCategorySchema = z.enum(["sports", "event", "festival"]);
export const courseThemeSchema = z.enum(["healing", "thrill", "photo_spot", "stamp"]);

export const signupRequestSchema = z.strictObject({
  email: z.email(),
  password: z.string().min(8).max(128),
  birthDate: z.iso.date().nullable().optional(),
  gender: genderSchema.nullable().optional(),
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
export const authResponseSchema = z.strictObject({
  accessToken: z.string(),
  tokenType: z.string().default("Bearer"),
  expiresIn: positiveInt,
  user: z.strictObject({ id: positiveInt, email: z.email() }),
});
export const oauthAuthorizeResponseSchema = z.strictObject({
  provider: authProviderSchema,
  authorizationUrl: z.url(),
});

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
  place_name: z.string().max(255).nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
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
  placeName: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
});

const courseFields = {
  recommended_companion: z.string().max(100).nullable().optional(),
  representative_image_url: nullableUrl.optional(),
  estimated_duration_minutes: positiveInt.nullable().optional(),
};
export const courseCreateSchema = z.strictObject({ ...courseFields, theme: courseThemeSchema });
export const coursePatchSchema = z.strictObject({
  ...courseFields,
  theme: courseThemeSchema.nullable().optional(),
});
export const courseResponseSchema = z.object({
  ...timestamps,
  recommendedCompanion: z.string().nullable(),
  representativeImageUrl: z.string().nullable(),
  estimatedDurationMinutes: z.number().int().nullable(),
  theme: courseThemeSchema,
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
  collectedAt: z.iso.datetime(),
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
  collectedAt: z.iso.datetime(),
});

export type AuthProvider = z.infer<typeof authProviderSchema>;
export type SignupRequest = z.infer<typeof signupRequestSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type OAuthLoginRequest = z.infer<typeof oauthLoginRequestSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type BadgeInput = z.infer<typeof badgeInputSchema>;
export type BadgeResponse = z.infer<typeof badgeResponseSchema>;
export type ActivityCreate = z.infer<typeof activityCreateSchema>;
export type ActivityPatch = z.infer<typeof activityPatchSchema>;
export type ActivityResponse = z.infer<typeof activityResponseSchema>;
export type CourseCreate = z.infer<typeof courseCreateSchema>;
export type CoursePatch = z.infer<typeof coursePatchSchema>;
export type CourseResponse = z.infer<typeof courseResponseSchema>;
export type PassportInput = z.infer<typeof passportInputSchema>;
export type PassportResponse = z.infer<typeof passportResponseSchema>;
export type CollectedBadgeCreate = z.infer<typeof collectedBadgeCreateSchema>;
export type CollectedBadgePatch = z.infer<typeof collectedBadgePatchSchema>;
export type CollectedBadgeResponse = z.infer<typeof collectedBadgeResponseSchema>;
export type CollectedStampCreate = z.infer<typeof collectedStampCreateSchema>;
export type CollectedStampPatch = z.infer<typeof collectedStampPatchSchema>;
export type CollectedStampResponse = z.infer<typeof collectedStampResponseSchema>;
