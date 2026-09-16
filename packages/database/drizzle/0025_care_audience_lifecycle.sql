ALTER TABLE "care_requests" ADD COLUMN "expired_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "care_requests" DROP CONSTRAINT "care_requests_audience_allowed";
--> statement-breakpoint
ALTER TABLE "care_requests" DROP CONSTRAINT "care_requests_status_allowed";
--> statement-breakpoint
ALTER TABLE "care_requests" DROP CONSTRAINT "care_requests_claim_state";
--> statement-breakpoint
ALTER TABLE "care_requests" ADD CONSTRAINT "care_requests_audience_allowed" CHECK ("care_requests"."audience" in ('party', 'tribe'));
--> statement-breakpoint
ALTER TABLE "care_requests" ADD CONSTRAINT "care_requests_status_allowed" CHECK ("care_requests"."status" in ('open', 'claimed', 'orphaned', 'completed', 'expired'));
--> statement-breakpoint
ALTER TABLE "care_requests" ADD CONSTRAINT "care_requests_claim_state" CHECK (("care_requests"."status" = 'open' and "care_requests"."claimant_user_id" is null and "care_requests"."claimed_at" is null and "care_requests"."requester_completed_at" is null and "care_requests"."claimant_completed_at" is null and "care_requests"."completed_at" is null and "care_requests"."expired_at" is null) or ("care_requests"."status" in ('claimed', 'orphaned') and "care_requests"."claimant_user_id" is not null and "care_requests"."claimed_at" is not null and "care_requests"."requester_completed_at" is null and "care_requests"."claimant_completed_at" is null and "care_requests"."completed_at" is null and "care_requests"."expired_at" is null) or ("care_requests"."status" = 'completed' and "care_requests"."claimant_user_id" is not null and "care_requests"."claimed_at" is not null and "care_requests"."requester_completed_at" is not null and "care_requests"."claimant_completed_at" is not null and "care_requests"."completed_at" is not null and "care_requests"."expired_at" is null) or ("care_requests"."status" = 'expired' and "care_requests"."claimant_user_id" is null and "care_requests"."claimed_at" is null and "care_requests"."requester_completed_at" is null and "care_requests"."claimant_completed_at" is null and "care_requests"."completed_at" is null and "care_requests"."expired_at" is not null));
--> statement-breakpoint
ALTER TABLE "care_offers" ADD COLUMN "expired_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "care_offers" DROP CONSTRAINT "care_offers_audience_allowed";
--> statement-breakpoint
ALTER TABLE "care_offers" DROP CONSTRAINT "care_offers_status_allowed";
--> statement-breakpoint
ALTER TABLE "care_offers" ADD CONSTRAINT "care_offers_audience_allowed" CHECK ("care_offers"."audience" in ('party', 'tribe'));
--> statement-breakpoint
ALTER TABLE "care_offers" ADD CONSTRAINT "care_offers_status_allowed" CHECK ("care_offers"."status" in ('available', 'expired'));
--> statement-breakpoint
ALTER TABLE "care_offers" ADD CONSTRAINT "care_offers_expiry_state" CHECK (("care_offers"."status" = 'available' and "care_offers"."expired_at" is null) or ("care_offers"."status" = 'expired' and "care_offers"."expired_at" is not null));
--> statement-breakpoint
CREATE TABLE "care_request_passes" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"care_request_id" varchar(128) NOT NULL,
	"originator_user_id" varchar(128) NOT NULL,
	"viewer_user_id" varchar(128) NOT NULL,
	"audience" varchar(16) NOT NULL,
	"passed_at" timestamp with time zone NOT NULL,
	CONSTRAINT "care_request_passes_audience_allowed" CHECK ("care_request_passes"."audience" in ('party', 'tribe')),
	CONSTRAINT "care_request_passes_viewer_distinct" CHECK ("care_request_passes"."originator_user_id" <> "care_request_passes"."viewer_user_id")
);
--> statement-breakpoint
ALTER TABLE "care_request_passes" ADD CONSTRAINT "care_request_passes_care_request_id_care_requests_id_fk" FOREIGN KEY ("care_request_id") REFERENCES "public"."care_requests"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
--> statement-breakpoint
ALTER TABLE "care_request_passes" ADD CONSTRAINT "care_request_passes_originator_user_id_user_id_fk" FOREIGN KEY ("originator_user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
--> statement-breakpoint
ALTER TABLE "care_request_passes" ADD CONSTRAINT "care_request_passes_viewer_user_id_user_id_fk" FOREIGN KEY ("viewer_user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
--> statement-breakpoint
CREATE UNIQUE INDEX "care_request_passes_viewer_unique" ON "care_request_passes" USING btree ("care_request_id", "viewer_user_id", "audience");
--> statement-breakpoint
CREATE INDEX "care_request_passes_originator_viewer_index" ON "care_request_passes" USING btree ("originator_user_id", "viewer_user_id");
--> statement-breakpoint
CREATE TABLE "care_offer_passes" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"care_offer_id" varchar(128) NOT NULL,
	"originator_user_id" varchar(128) NOT NULL,
	"viewer_user_id" varchar(128) NOT NULL,
	"audience" varchar(16) NOT NULL,
	"passed_at" timestamp with time zone NOT NULL,
	CONSTRAINT "care_offer_passes_audience_allowed" CHECK ("care_offer_passes"."audience" in ('party', 'tribe')),
	CONSTRAINT "care_offer_passes_viewer_distinct" CHECK ("care_offer_passes"."originator_user_id" <> "care_offer_passes"."viewer_user_id")
);
--> statement-breakpoint
ALTER TABLE "care_offer_passes" ADD CONSTRAINT "care_offer_passes_care_offer_id_care_offers_id_fk" FOREIGN KEY ("care_offer_id") REFERENCES "public"."care_offers"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
--> statement-breakpoint
ALTER TABLE "care_offer_passes" ADD CONSTRAINT "care_offer_passes_originator_user_id_user_id_fk" FOREIGN KEY ("originator_user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
--> statement-breakpoint
ALTER TABLE "care_offer_passes" ADD CONSTRAINT "care_offer_passes_viewer_user_id_user_id_fk" FOREIGN KEY ("viewer_user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
--> statement-breakpoint
CREATE UNIQUE INDEX "care_offer_passes_viewer_unique" ON "care_offer_passes" USING btree ("care_offer_id", "viewer_user_id", "audience");
--> statement-breakpoint
CREATE INDEX "care_offer_passes_originator_viewer_index" ON "care_offer_passes" USING btree ("originator_user_id", "viewer_user_id");
