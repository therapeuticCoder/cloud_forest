ALTER TABLE "user" ADD COLUMN "username" varchar(30);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" varchar(16) DEFAULT 'user' NOT NULL;
--> statement-breakpoint
DO $$
DECLARE
	account RECORD;
	candidate varchar(30);
	base_username varchar(320);
	suffix integer;
BEGIN
	FOR account IN
		SELECT "id", lower(split_part("email", '@', 1)) AS base_username
		FROM "user"
		WHERE "username" IS NULL
		ORDER BY "created_at", "id"
	LOOP
		base_username := account.base_username;
		candidate := left(base_username, 30);
		suffix := 2;
		WHILE EXISTS (SELECT 1 FROM "user" WHERE "username" = candidate) LOOP
			candidate := left(
				base_username,
				greatest(1, 30 - length(suffix::text) - 1)
			) || '-' || suffix::text;
			suffix := suffix + 1;
		END LOOP;
		UPDATE "user"
		SET "username" = candidate
		WHERE "id" = account.id;
	END LOOP;
END $$;
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
