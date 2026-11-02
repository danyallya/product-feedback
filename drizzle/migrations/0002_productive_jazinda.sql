CREATE TABLE `idea_submission_limits` (
	`bucket_key` text PRIMARY KEY NOT NULL,
	`attempts` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idea_submission_limits_expires` ON `idea_submission_limits` (`expires_at`);--> statement-breakpoint
ALTER TABLE `ideas` ADD `moderation_status` text DEFAULT 'pending' NOT NULL;
--> statement-breakpoint
UPDATE `ideas` SET `moderation_status` = 'approved';
