ALTER TABLE `workspaces` ADD `visibility` text DEFAULT 'public' NOT NULL;--> statement-breakpoint
ALTER TABLE `workspaces` ADD `owner_password_salt` text;--> statement-breakpoint
ALTER TABLE `workspaces` ADD `owner_password_hash` text;