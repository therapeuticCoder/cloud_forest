ALTER TABLE "care_requests" ADD COLUMN "category" varchar(32) DEFAULT 'food' NOT NULL;
--> statement-breakpoint
ALTER TABLE "care_requests" ADD COLUMN "subtype" varchar(200) DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "care_requests" ADD COLUMN "days" jsonb DEFAULT '[]'::jsonb NOT NULL;
--> statement-breakpoint
ALTER TABLE "care_requests" ADD COLUMN "times" jsonb DEFAULT '[]'::jsonb NOT NULL;
--> statement-breakpoint
ALTER TABLE "care_requests" ADD COLUMN "time_note" varchar(500) DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "care_requests" ADD COLUMN "location" varchar(500) DEFAULT 'Not specified' NOT NULL;
--> statement-breakpoint
ALTER TABLE "care_requests" ADD COLUMN "requirements" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "care_requests" ADD COLUMN "sensitivities" text DEFAULT '' NOT NULL;
--> statement-breakpoint
UPDATE "care_requests"
SET
  "time_note" = "helpful_when",
  "location" = "handoff_style",
  "requirements" = "food_works",
  "sensitivities" = "food_does_not_work";
--> statement-breakpoint
ALTER TABLE "care_requests" ADD CONSTRAINT "care_requests_category_allowed" CHECK ("care_requests"."category" in ('transportation', 'food', 'pet-care', 'child-care', 'urgent-shelter', 'help-at-home', 'executive-function-support', 'get-out-of-the-house'));
--> statement-breakpoint
ALTER TABLE "care_requests" ADD CONSTRAINT "care_requests_subtype_length" CHECK (char_length("care_requests"."subtype") <= 200);
--> statement-breakpoint
ALTER TABLE "care_requests" ADD CONSTRAINT "care_requests_time_note_length" CHECK (char_length("care_requests"."time_note") <= 500);
--> statement-breakpoint
ALTER TABLE "care_requests" ADD CONSTRAINT "care_requests_location_length" CHECK (char_length("care_requests"."location") between 1 and 500);
--> statement-breakpoint
ALTER TABLE "care_requests" ADD CONSTRAINT "care_requests_requirements_length" CHECK (char_length("care_requests"."requirements") <= 10000);
--> statement-breakpoint
ALTER TABLE "care_requests" ADD CONSTRAINT "care_requests_sensitivities_length" CHECK (char_length("care_requests"."sensitivities") <= 10000);
--> statement-breakpoint
ALTER TABLE "care_offers" ADD COLUMN "category" varchar(32) DEFAULT 'food' NOT NULL;
--> statement-breakpoint
ALTER TABLE "care_offers" ADD COLUMN "subtype" varchar(200) DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "care_offers" ADD COLUMN "days" jsonb DEFAULT '[]'::jsonb NOT NULL;
--> statement-breakpoint
ALTER TABLE "care_offers" ADD COLUMN "times" jsonb DEFAULT '[]'::jsonb NOT NULL;
--> statement-breakpoint
ALTER TABLE "care_offers" ADD COLUMN "time_note" varchar(500) DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "care_offers" ADD COLUMN "location" varchar(500) DEFAULT 'Not specified' NOT NULL;
--> statement-breakpoint
ALTER TABLE "care_offers" ADD COLUMN "requirements" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "care_offers" ADD COLUMN "sensitivities" text DEFAULT '' NOT NULL;
--> statement-breakpoint
UPDATE "care_offers"
SET
  "time_note" = "available_when",
  "location" = "handoff_style",
  "requirements" = "meal_description";
--> statement-breakpoint
ALTER TABLE "care_offers" ADD CONSTRAINT "care_offers_category_allowed" CHECK ("care_offers"."category" in ('transportation', 'food', 'pet-care', 'child-care', 'urgent-shelter', 'help-at-home', 'executive-function-support', 'get-out-of-the-house'));
--> statement-breakpoint
ALTER TABLE "care_offers" ADD CONSTRAINT "care_offers_subtype_length" CHECK (char_length("care_offers"."subtype") <= 200);
--> statement-breakpoint
ALTER TABLE "care_offers" ADD CONSTRAINT "care_offers_time_note_length" CHECK (char_length("care_offers"."time_note") <= 500);
--> statement-breakpoint
ALTER TABLE "care_offers" ADD CONSTRAINT "care_offers_location_length" CHECK (char_length("care_offers"."location") between 1 and 500);
--> statement-breakpoint
ALTER TABLE "care_offers" ADD CONSTRAINT "care_offers_requirements_length" CHECK (char_length("care_offers"."requirements") <= 10000);
--> statement-breakpoint
ALTER TABLE "care_offers" ADD CONSTRAINT "care_offers_sensitivities_length" CHECK (char_length("care_offers"."sensitivities") <= 10000);
