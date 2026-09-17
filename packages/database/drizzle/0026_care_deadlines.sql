ALTER TABLE "care_requests" ADD COLUMN "expires_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "care_offers" ADD COLUMN "expires_at" timestamp with time zone;
