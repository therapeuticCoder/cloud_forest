CREATE TABLE "cares" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"originator_user_id" varchar(128) NOT NULL,
	"participant_user_id" varchar(128),
	"direction" varchar(8) NOT NULL,
	"category" varchar(32) DEFAULT 'food' NOT NULL,
	"subtype" varchar(200) DEFAULT '' NOT NULL,
	"days" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"times" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"time_note" varchar(500) DEFAULT '' NOT NULL,
	"location" varchar(500) DEFAULT 'Not specified' NOT NULL,
	"requirements" text DEFAULT '' NOT NULL,
	"sensitivities" text DEFAULT '' NOT NULL,
	"audience" varchar(16) DEFAULT 'party' NOT NULL,
	"status" varchar(16) DEFAULT 'open' NOT NULL,
	"expires_at" timestamp with time zone,
	"claimed_at" timestamp with time zone,
	"originator_completed_at" timestamp with time zone,
	"participant_completed_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"expired_at" timestamp with time zone,
	"withdrawn_by_user_id" varchar(128),
	"not_completed_at" timestamp with time zone,
	"withdrawal_statement_id" varchar(64),
	"withdrawal_message" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	CONSTRAINT "cares_id_length" CHECK (char_length("cares"."id") >= 1),
	CONSTRAINT "cares_direction_allowed" CHECK ("cares"."direction" in ('give', 'receive')),
	CONSTRAINT "cares_category_allowed" CHECK ("cares"."category" in ('transportation', 'food', 'pet-care', 'child-care', 'urgent-shelter', 'help-at-home', 'executive-function-support', 'get-out-of-the-house')),
	CONSTRAINT "cares_subtype_length" CHECK (char_length("cares"."subtype") <= 200),
	CONSTRAINT "cares_time_note_length" CHECK (char_length("cares"."time_note") <= 500),
	CONSTRAINT "cares_location_length" CHECK (char_length("cares"."location") between 1 and 500),
	CONSTRAINT "cares_requirements_length" CHECK (char_length("cares"."requirements") <= 10000),
	CONSTRAINT "cares_sensitivities_length" CHECK (char_length("cares"."sensitivities") <= 10000),
	CONSTRAINT "cares_audience_allowed" CHECK ("cares"."audience" in ('party', 'tribe')),
	CONSTRAINT "cares_status_allowed" CHECK ("cares"."status" in ('open', 'claimed', 'orphaned', 'completed', 'expired', 'not_completed')),
	CONSTRAINT "cares_withdrawal_statement_allowed" CHECK ("cares"."withdrawal_statement_id" is null or "cares"."withdrawal_statement_id" in ('meal-sorry-cant-follow-through', 'meal-something-changed', 'meal-sorry-committed')),
	CONSTRAINT "cares_withdrawal_message_length" CHECK (char_length("cares"."withdrawal_message") <= 1000),
	CONSTRAINT "cares_not_self_claimed" CHECK ("cares"."participant_user_id" is null or "cares"."originator_user_id" <> "cares"."participant_user_id"),
	CONSTRAINT "cares_lifecycle_allowed" CHECK (("cares"."status" = 'open' and "cares"."participant_user_id" is null and "cares"."claimed_at" is null and "cares"."originator_completed_at" is null and "cares"."participant_completed_at" is null and "cares"."completed_at" is null and "cares"."expired_at" is null and "cares"."withdrawn_by_user_id" is null and "cares"."not_completed_at" is null and "cares"."withdrawal_statement_id" is null) or ("cares"."status" in ('claimed', 'orphaned') and "cares"."participant_user_id" is not null and "cares"."claimed_at" is not null and "cares"."completed_at" is null and ("cares"."originator_completed_at" is null or "cares"."participant_completed_at" is null) and "cares"."expired_at" is null and "cares"."withdrawn_by_user_id" is null and "cares"."not_completed_at" is null and "cares"."withdrawal_statement_id" is null) or ("cares"."status" = 'completed' and "cares"."participant_user_id" is not null and "cares"."claimed_at" is not null and "cares"."originator_completed_at" is not null and "cares"."participant_completed_at" is not null and "cares"."completed_at" is not null and "cares"."expired_at" is null and "cares"."withdrawn_by_user_id" is null and "cares"."not_completed_at" is null and "cares"."withdrawal_statement_id" is null) or ("cares"."status" = 'expired' and "cares"."participant_user_id" is null and "cares"."claimed_at" is null and "cares"."originator_completed_at" is null and "cares"."participant_completed_at" is null and "cares"."completed_at" is null and "cares"."expired_at" is not null and "cares"."withdrawn_by_user_id" is null and "cares"."not_completed_at" is null and "cares"."withdrawal_statement_id" is null) or ("cares"."status" = 'not_completed' and "cares"."participant_user_id" is not null and "cares"."claimed_at" is not null and "cares"."completed_at" is null and "cares"."expired_at" is null and "cares"."withdrawn_by_user_id" is not null and "cares"."not_completed_at" is not null and "cares"."withdrawal_statement_id" is not null))
);
--> statement-breakpoint
ALTER TABLE "cares" ADD CONSTRAINT "cares_originator_user_id_user_id_fk" FOREIGN KEY ("originator_user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
--> statement-breakpoint
ALTER TABLE "cares" ADD CONSTRAINT "cares_participant_user_id_user_id_fk" FOREIGN KEY ("participant_user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
--> statement-breakpoint
ALTER TABLE "cares" ADD CONSTRAINT "cares_withdrawn_by_user_id_user_id_fk" FOREIGN KEY ("withdrawn_by_user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
--> statement-breakpoint
CREATE INDEX "cares_originator_index" ON "cares" USING btree ("originator_user_id");
--> statement-breakpoint
CREATE INDEX "cares_participant_index" ON "cares" USING btree ("participant_user_id");
--> statement-breakpoint
CREATE TABLE "care_passes" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"care_id" varchar(128) NOT NULL,
	"originator_user_id" varchar(128) NOT NULL,
	"viewer_user_id" varchar(128) NOT NULL,
	"audience" varchar(16) NOT NULL,
	"passed_at" timestamp with time zone NOT NULL,
	CONSTRAINT "care_passes_audience_allowed" CHECK ("care_passes"."audience" in ('party', 'tribe')),
	CONSTRAINT "care_passes_viewer_distinct" CHECK ("care_passes"."originator_user_id" <> "care_passes"."viewer_user_id")
);
--> statement-breakpoint
ALTER TABLE "care_passes" ADD CONSTRAINT "care_passes_care_id_cares_id_fk" FOREIGN KEY ("care_id") REFERENCES "public"."cares"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
--> statement-breakpoint
ALTER TABLE "care_passes" ADD CONSTRAINT "care_passes_originator_user_id_user_id_fk" FOREIGN KEY ("originator_user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
--> statement-breakpoint
ALTER TABLE "care_passes" ADD CONSTRAINT "care_passes_viewer_user_id_user_id_fk" FOREIGN KEY ("viewer_user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
--> statement-breakpoint
CREATE UNIQUE INDEX "care_passes_viewer_unique" ON "care_passes" USING btree ("care_id", "viewer_user_id", "audience");
--> statement-breakpoint
CREATE INDEX "care_passes_originator_viewer_index" ON "care_passes" USING btree ("originator_user_id", "viewer_user_id");
--> statement-breakpoint
INSERT INTO "cares" ("id", "originator_user_id", "participant_user_id", "direction", "category", "subtype", "days", "times", "time_note", "location", "requirements", "sensitivities", "audience", "status", "expires_at", "claimed_at", "originator_completed_at", "participant_completed_at", "completed_at", "expired_at", "withdrawn_by_user_id", "not_completed_at", "withdrawal_statement_id", "withdrawal_message", "created_at")
SELECT
  CASE WHEN "id" like 'care-request-from-offer-%' THEN substring("id" from length('care-request-from-offer-') + 1) ELSE "id" END,
  "originator_user_id",
  CASE WHEN "status" in ('claimed', 'orphaned', 'completed', 'not_completed') THEN CASE WHEN "originator_user_id" = "requester_user_id" THEN "claimant_user_id" ELSE "requester_user_id" END ELSE null END,
  CASE WHEN "originator_user_id" = "requester_user_id" THEN 'receive' ELSE 'give' END,
  "category", "subtype", "days", "times", "time_note", "location", "requirements", "sensitivities", "audience", "status", "expires_at", "claimed_at",
  CASE WHEN "originator_user_id" = "requester_user_id" THEN "requester_completed_at" ELSE "claimant_completed_at" END,
  CASE WHEN "originator_user_id" = "requester_user_id" THEN "claimant_completed_at" ELSE "requester_completed_at" END,
  "completed_at", "expired_at", "withdrawn_by_user_id", "not_completed_at", "withdrawal_statement_id", "withdrawal_message", "created_at"
FROM "care_requests";
--> statement-breakpoint
INSERT INTO "cares" ("id", "originator_user_id", "participant_user_id", "direction", "category", "subtype", "days", "times", "time_note", "location", "requirements", "sensitivities", "audience", "status", "expires_at", "expired_at", "created_at")
SELECT "id", "giver_user_id", null, 'give', "category", "subtype", "days", "times", "time_note", "location", "requirements", "sensitivities", "audience", CASE WHEN "status" = 'available' THEN 'open' ELSE 'expired' END, "expires_at", "expired_at", "created_at"
FROM "care_offers"
WHERE NOT EXISTS (
  SELECT 1
  FROM "care_requests" AS claimed_offer_request
  WHERE claimed_offer_request."id" = 'care-request-from-offer-' || "care_offers"."id"
);
--> statement-breakpoint
INSERT INTO "care_passes" ("id", "care_id", "originator_user_id", "viewer_user_id", "audience", "passed_at")
SELECT "id", CASE WHEN "care_request_id" like 'care-request-from-offer-%' THEN substring("care_request_id" from length('care-request-from-offer-') + 1) ELSE "care_request_id" END, "originator_user_id", "viewer_user_id", "audience", "passed_at"
FROM "care_request_passes";
--> statement-breakpoint
INSERT INTO "care_passes" ("id", "care_id", "originator_user_id", "viewer_user_id", "audience", "passed_at")
SELECT "id", "care_offer_id", "originator_user_id", "viewer_user_id", "audience", "passed_at"
FROM "care_offer_passes";
--> statement-breakpoint
ALTER TABLE "care_gratitudes" DROP CONSTRAINT "care_gratitudes_request_id_care_requests_id_fk";
--> statement-breakpoint
DROP INDEX "care_gratitudes_request_unique";
--> statement-breakpoint
ALTER TABLE "care_gratitudes" RENAME COLUMN "care_request_id" TO "care_id";
--> statement-breakpoint
UPDATE "care_gratitudes" SET "care_id" = substring("care_id" from length('care-request-from-offer-') + 1) WHERE "care_id" like 'care-request-from-offer-%';
--> statement-breakpoint
ALTER TABLE "care_gratitudes" ADD CONSTRAINT "care_gratitudes_care_id_cares_id_fk" FOREIGN KEY ("care_id") REFERENCES "public"."cares"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
--> statement-breakpoint
CREATE UNIQUE INDEX "care_gratitudes_care_unique" ON "care_gratitudes" USING btree ("care_id");
--> statement-breakpoint
DROP TABLE "care_request_passes";
--> statement-breakpoint
DROP TABLE "care_offer_passes";
--> statement-breakpoint
DROP TABLE "care_offers";
--> statement-breakpoint
DROP TABLE "care_requests";
