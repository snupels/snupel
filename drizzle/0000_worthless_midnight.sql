CREATE TABLE `activities` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`category` enum('sports','event','festival') NOT NULL,
	`representative_image_url` text,
	`sport_name` varchar(100),
	`region` varchar(100),
	`place_name` varchar(255),
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`created_at` datetime not null default CURRENT_TIMESTAMP,
	`updated_at` datetime not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
	CONSTRAINT `activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `badges` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`image_url` text,
	`description` text,
	`created_at` datetime not null default CURRENT_TIMESTAMP,
	`updated_at` datetime not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
	CONSTRAINT `badges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `collected_badges` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`passport_id` bigint unsigned NOT NULL,
	`badge_id` bigint unsigned NOT NULL,
	`collected_at` datetime not null default CURRENT_TIMESTAMP,
	CONSTRAINT `collected_badges_id` PRIMARY KEY(`id`),
	CONSTRAINT `collected_badges_passport_badge_unique` UNIQUE(`passport_id`,`badge_id`)
);
--> statement-breakpoint
CREATE TABLE `collected_stamps` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`passport_id` bigint unsigned NOT NULL,
	`stamp_id` bigint unsigned NOT NULL,
	`collected_at` datetime not null default CURRENT_TIMESTAMP,
	CONSTRAINT `collected_stamps_id` PRIMARY KEY(`id`),
	CONSTRAINT `collected_stamps_passport_stamp_unique` UNIQUE(`passport_id`,`stamp_id`)
);
--> statement-breakpoint
CREATE TABLE `course_stamps` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`course_id` bigint unsigned NOT NULL,
	`stamp_id` bigint unsigned NOT NULL,
	`created_at` datetime not null default CURRENT_TIMESTAMP,
	CONSTRAINT `course_stamps_id` PRIMARY KEY(`id`),
	CONSTRAINT `course_stamps_course_stamp_unique` UNIQUE(`course_id`,`stamp_id`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`recommended_companion` varchar(100),
	`representative_image_url` text,
	`estimated_duration_minutes` int unsigned,
	`theme` enum('healing','thrill','photo_spot','stamp') NOT NULL,
	`created_at` datetime not null default CURRENT_TIMESTAMP,
	`updated_at` datetime not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
	CONSTRAINT `courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `passports` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`created_at` datetime not null default CURRENT_TIMESTAMP,
	`updated_at` datetime not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
	CONSTRAINT `passports_id` PRIMARY KEY(`id`),
	CONSTRAINT `passports_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `social_accounts` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`provider` varchar(50) NOT NULL,
	`provider_user_id` varchar(255) NOT NULL,
	`created_at` datetime not null default CURRENT_TIMESTAMP,
	`updated_at` datetime not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
	CONSTRAINT `social_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `social_accounts_provider_user_unique` UNIQUE(`provider`,`provider_user_id`)
);
--> statement-breakpoint
CREATE TABLE `stamps` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`activity_id` bigint unsigned NOT NULL,
	`description` text,
	`image_url` text,
	`created_at` datetime not null default CURRENT_TIMESTAMP,
	`updated_at` datetime not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
	CONSTRAINT `stamps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` text,
	`birth_date` date,
	`gender` enum('male','female','other','unknown'),
	`created_at` datetime not null default CURRENT_TIMESTAMP,
	`updated_at` datetime not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `collected_badges` ADD CONSTRAINT `collected_badges_passport_id_passports_id_fk` FOREIGN KEY (`passport_id`) REFERENCES `passports`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `collected_badges` ADD CONSTRAINT `collected_badges_badge_id_badges_id_fk` FOREIGN KEY (`badge_id`) REFERENCES `badges`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `collected_stamps` ADD CONSTRAINT `collected_stamps_passport_id_passports_id_fk` FOREIGN KEY (`passport_id`) REFERENCES `passports`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `collected_stamps` ADD CONSTRAINT `collected_stamps_stamp_id_stamps_id_fk` FOREIGN KEY (`stamp_id`) REFERENCES `stamps`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_stamps` ADD CONSTRAINT `course_stamps_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_stamps` ADD CONSTRAINT `course_stamps_stamp_id_stamps_id_fk` FOREIGN KEY (`stamp_id`) REFERENCES `stamps`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `passports` ADD CONSTRAINT `passports_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `social_accounts` ADD CONSTRAINT `social_accounts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stamps` ADD CONSTRAINT `stamps_activity_id_activities_id_fk` FOREIGN KEY (`activity_id`) REFERENCES `activities`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `collected_badges_badge_id_idx` ON `collected_badges` (`badge_id`);--> statement-breakpoint
CREATE INDEX `collected_stamps_stamp_id_idx` ON `collected_stamps` (`stamp_id`);--> statement-breakpoint
CREATE INDEX `course_stamps_stamp_id_idx` ON `course_stamps` (`stamp_id`);--> statement-breakpoint
CREATE INDEX `social_accounts_user_id_idx` ON `social_accounts` (`user_id`);--> statement-breakpoint
CREATE INDEX `stamps_activity_id_idx` ON `stamps` (`activity_id`);