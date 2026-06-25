import { relations } from "drizzle-orm";
import {
  bigint,
  customType,
  date,
  decimal,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

const primaryId = () =>
  bigint("id", { mode: "number", unsigned: true }).primaryKey().autoincrement();

const timestampDatetime = customType<{
  data: Date;
  driverData: string;
  notNull: true;
  default: true;
  config: { onUpdate?: boolean };
}>({
  dataType: (config) =>
    `datetime not null default CURRENT_TIMESTAMP${
      config?.onUpdate ? " on update CURRENT_TIMESTAMP" : ""
    }`,
  fromDriver: (value) => new Date(value),
});

const timestamps = () => ({
  createdAt: timestampDatetime("created_at"),
  updatedAt: timestampDatetime("updated_at", { onUpdate: true }),
});

export const users = mysqlTable(
  "users",
  {
    id: primaryId(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash"),
    birthDate: date("birth_date", { mode: "date" }),
    gender: mysqlEnum("gender", ["male", "female", "other", "unknown"]),
    ...timestamps(),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

export const socialAccounts = mysqlTable(
  "social_accounts",
  {
    id: primaryId(),
    userId: bigint("user_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 50 }).notNull(),
    providerUserId: varchar("provider_user_id", { length: 255 }).notNull(),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("social_accounts_provider_user_unique").on(
      table.provider,
      table.providerUserId,
    ),
    index("social_accounts_user_id_idx").on(table.userId),
  ],
);

export const passports = mysqlTable("passports", {
  id: primaryId(),
  userId: bigint("user_id", { mode: "number", unsigned: true })
    .notNull()
    .unique("passports_user_id_unique")
    .references(() => users.id, { onDelete: "cascade" }),
  ...timestamps(),
});

export const activities = mysqlTable("activities", {
  id: primaryId(),
  category: mysqlEnum("category", ["sports", "event", "festival"]).notNull(),
  representativeImageUrl: text("representative_image_url"),
  sportName: varchar("sport_name", { length: 100 }),
  region: varchar("region", { length: 100 }),
  placeName: varchar("place_name", { length: 255 }),
  latitude: decimal("latitude", { precision: 10, scale: 7, mode: "number" }),
  longitude: decimal("longitude", { precision: 10, scale: 7, mode: "number" }),
  ...timestamps(),
});

export const stamps = mysqlTable(
  "stamps",
  {
    id: primaryId(),
    activityId: bigint("activity_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => activities.id, { onDelete: "cascade" }),
    description: text("description"),
    imageUrl: text("image_url"),
    ...timestamps(),
  },
  (table) => [index("stamps_activity_id_idx").on(table.activityId)],
);

export const collectedStamps = mysqlTable(
  "collected_stamps",
  {
    id: primaryId(),
    passportId: bigint("passport_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => passports.id, { onDelete: "cascade" }),
    stampId: bigint("stamp_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => stamps.id, { onDelete: "cascade" }),
    collectedAt: timestampDatetime("collected_at"),
  },
  (table) => [
    uniqueIndex("collected_stamps_passport_stamp_unique").on(
      table.passportId,
      table.stampId,
    ),
    index("collected_stamps_stamp_id_idx").on(table.stampId),
  ],
);

export const badges = mysqlTable("badges", {
  id: primaryId(),
  imageUrl: text("image_url"),
  description: text("description"),
  ...timestamps(),
});

export const collectedBadges = mysqlTable(
  "collected_badges",
  {
    id: primaryId(),
    passportId: bigint("passport_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => passports.id, { onDelete: "cascade" }),
    badgeId: bigint("badge_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => badges.id, { onDelete: "cascade" }),
    collectedAt: timestampDatetime("collected_at"),
  },
  (table) => [
    uniqueIndex("collected_badges_passport_badge_unique").on(
      table.passportId,
      table.badgeId,
    ),
    index("collected_badges_badge_id_idx").on(table.badgeId),
  ],
);

export const courses = mysqlTable("courses", {
  id: primaryId(),
  recommendedCompanion: varchar("recommended_companion", { length: 100 }),
  representativeImageUrl: text("representative_image_url"),
  estimatedDurationMinutes: int("estimated_duration_minutes", {
    unsigned: true,
  }),
  theme: mysqlEnum("theme", [
    "healing",
    "thrill",
    "photo_spot",
    "stamp",
  ]).notNull(),
  ...timestamps(),
});

export const courseStamps = mysqlTable(
  "course_stamps",
  {
    id: primaryId(),
    courseId: bigint("course_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    stampId: bigint("stamp_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => stamps.id, { onDelete: "cascade" }),
    createdAt: timestampDatetime("created_at"),
  },
  (table) => [
    uniqueIndex("course_stamps_course_stamp_unique").on(
      table.courseId,
      table.stampId,
    ),
    index("course_stamps_stamp_id_idx").on(table.stampId),
  ],
);

export const usersRelations = relations(users, ({ one, many }) => ({
  passport: one(passports),
  socialAccounts: many(socialAccounts),
}));

export const socialAccountsRelations = relations(socialAccounts, ({ one }) => ({
  user: one(users, {
    fields: [socialAccounts.userId],
    references: [users.id],
  }),
}));

export const passportsRelations = relations(passports, ({ one, many }) => ({
  user: one(users, {
    fields: [passports.userId],
    references: [users.id],
  }),
  collectedStamps: many(collectedStamps),
  collectedBadges: many(collectedBadges),
}));

export const activitiesRelations = relations(activities, ({ many }) => ({
  stamps: many(stamps),
}));

export const stampsRelations = relations(stamps, ({ one, many }) => ({
  activity: one(activities, {
    fields: [stamps.activityId],
    references: [activities.id],
  }),
  collectedStamps: many(collectedStamps),
  courseStamps: many(courseStamps),
}));

export const collectedStampsRelations = relations(
  collectedStamps,
  ({ one }) => ({
    passport: one(passports, {
      fields: [collectedStamps.passportId],
      references: [passports.id],
    }),
    stamp: one(stamps, {
      fields: [collectedStamps.stampId],
      references: [stamps.id],
    }),
  }),
);

export const badgesRelations = relations(badges, ({ many }) => ({
  collectedBadges: many(collectedBadges),
}));

export const collectedBadgesRelations = relations(
  collectedBadges,
  ({ one }) => ({
    passport: one(passports, {
      fields: [collectedBadges.passportId],
      references: [passports.id],
    }),
    badge: one(badges, {
      fields: [collectedBadges.badgeId],
      references: [badges.id],
    }),
  }),
);

export const coursesRelations = relations(courses, ({ many }) => ({
  courseStamps: many(courseStamps),
}));

export const courseStampsRelations = relations(courseStamps, ({ one }) => ({
  course: one(courses, {
    fields: [courseStamps.courseId],
    references: [courses.id],
  }),
  stamp: one(stamps, {
    fields: [courseStamps.stampId],
    references: [stamps.id],
  }),
}));
