ALTER TABLE "care_requests" ADD COLUMN "withdrawn_by_user_id" varchar(128);
--> statement-breakpoint
ALTER TABLE "care_requests" ADD COLUMN "not_completed_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "care_requests" ADD COLUMN "withdrawal_statement_id" varchar(64);
--> statement-breakpoint
ALTER TABLE "care_requests" ADD COLUMN "withdrawal_message" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "care_requests" ADD CONSTRAINT "care_requests_withdrawn_by_user_id_user_id_fk" FOREIGN KEY ("withdrawn_by_user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
--> statement-breakpoint
ALTER TABLE "care_requests" DROP CONSTRAINT "care_requests_status_allowed";
--> statement-breakpoint
ALTER TABLE "care_requests" DROP CONSTRAINT "care_requests_claim_state";
--> statement-breakpoint
ALTER TABLE "care_requests" ADD CONSTRAINT "care_requests_status_allowed" CHECK ("care_requests"."status" in ('open', 'claimed', 'orphaned', 'completed', 'expired', 'not_completed'));
--> statement-breakpoint
ALTER TABLE "care_requests" ADD CONSTRAINT "care_requests_claim_state" CHECK (("care_requests"."status" = 'open' and "care_requests"."claimant_user_id" is null and "care_requests"."claimed_at" is null and "care_requests"."requester_completed_at" is null and "care_requests"."claimant_completed_at" is null and "care_requests"."completed_at" is null and "care_requests"."expired_at" is null and "care_requests"."withdrawn_by_user_id" is null and "care_requests"."not_completed_at" is null and "care_requests"."withdrawal_statement_id" is null) or ("care_requests"."status" in ('claimed', 'orphaned') and "care_requests"."claimant_user_id" is not null and "care_requests"."claimed_at" is not null and "care_requests"."completed_at" is null and ("care_requests"."requester_completed_at" is null or "care_requests"."claimant_completed_at" is null) and "care_requests"."expired_at" is null and "care_requests"."withdrawn_by_user_id" is null and "care_requests"."not_completed_at" is null and "care_requests"."withdrawal_statement_id" is null) or ("care_requests"."status" = 'completed' and "care_requests"."claimant_user_id" is not null and "care_requests"."claimed_at" is not null and "care_requests"."requester_completed_at" is not null and "care_requests"."claimant_completed_at" is not null and "care_requests"."completed_at" is not null and "care_requests"."expired_at" is null and "care_requests"."withdrawn_by_user_id" is null and "care_requests"."not_completed_at" is null and "care_requests"."withdrawal_statement_id" is null) or ("care_requests"."status" = 'expired' and "care_requests"."claimant_user_id" is null and "care_requests"."claimed_at" is null and "care_requests"."requester_completed_at" is null and "care_requests"."claimant_completed_at" is null and "care_requests"."completed_at" is null and "care_requests"."expired_at" is not null and "care_requests"."withdrawn_by_user_id" is null and "care_requests"."not_completed_at" is null and "care_requests"."withdrawal_statement_id" is null) or ("care_requests"."status" = 'not_completed' and "care_requests"."claimant_user_id" is not null and "care_requests"."claimed_at" is not null and "care_requests"."completed_at" is null and "care_requests"."expired_at" is null and "care_requests"."withdrawn_by_user_id" is not null and "care_requests"."not_completed_at" is not null and "care_requests"."withdrawal_statement_id" is not null));
--> statement-breakpoint
ALTER TABLE "care_requests" ADD CONSTRAINT "care_requests_withdrawal_statement_allowed" CHECK ("care_requests"."withdrawal_statement_id" is null or "care_requests"."withdrawal_statement_id" in ('meal-sorry-cant-follow-through', 'meal-something-changed', 'meal-sorry-committed'));
--> statement-breakpoint
ALTER TABLE "care_requests" ADD CONSTRAINT "care_requests_withdrawal_message_length" CHECK (char_length("care_requests"."withdrawal_message") <= 1000);
