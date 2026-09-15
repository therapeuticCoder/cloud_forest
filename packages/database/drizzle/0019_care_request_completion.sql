ALTER TABLE "care_requests" ADD COLUMN "requester_completed_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "care_requests" ADD COLUMN "claimant_completed_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "care_requests" ADD COLUMN "completed_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "care_requests" DROP CONSTRAINT "care_requests_status_allowed";
--> statement-breakpoint
ALTER TABLE "care_requests" DROP CONSTRAINT "care_requests_claim_state";
--> statement-breakpoint
ALTER TABLE "care_requests" ADD CONSTRAINT "care_requests_status_allowed" CHECK ("care_requests"."status" in ('open', 'claimed', 'orphaned', 'completed'));
--> statement-breakpoint
ALTER TABLE "care_requests" ADD CONSTRAINT "care_requests_claim_state" CHECK (("care_requests"."status" = 'open' and "care_requests"."claimant_user_id" is null and "care_requests"."claimed_at" is null and "care_requests"."requester_completed_at" is null and "care_requests"."claimant_completed_at" is null and "care_requests"."completed_at" is null) or ("care_requests"."status" in ('claimed', 'orphaned') and "care_requests"."claimant_user_id" is not null and "care_requests"."claimed_at" is not null and "care_requests"."completed_at" is null) or ("care_requests"."status" = 'completed' and "care_requests"."claimant_user_id" is not null and "care_requests"."claimed_at" is not null and "care_requests"."requester_completed_at" is not null and "care_requests"."claimant_completed_at" is not null and "care_requests"."completed_at" is not null));
