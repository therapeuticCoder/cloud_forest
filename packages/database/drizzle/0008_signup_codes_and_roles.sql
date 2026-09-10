ALTER TABLE "user" ADD COLUMN "username" varchar(30);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" varchar(16) DEFAULT 'user' NOT NULL;
--> statement-breakpoint
UPDATE "user"
SET "username" = lower(split_part("email", '@', 1))
WHERE "username" IS NULL;
--> statement-breakpoint
UPDATE "user"
SET "role" = 'admin'
WHERE "email" = 'river@example.test';
--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_role_allowed" CHECK ("user"."role" in ('admin', 'user'));
--> statement-breakpoint
CREATE UNIQUE INDEX "user_username_unique" ON "user" USING btree ("username");
--> statement-breakpoint
CREATE TABLE "signup_codes" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"code" varchar(256) NOT NULL,
	"created_by_user_id" varchar(128) NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "signup_codes" ADD CONSTRAINT "signup_codes_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "signup_codes_code_unique" ON "signup_codes" USING btree ("code");
--> statement-breakpoint
CREATE INDEX "signup_codes_creator_index" ON "signup_codes" USING btree ("created_by_user_id");
