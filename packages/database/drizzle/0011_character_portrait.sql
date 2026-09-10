ALTER TABLE "curated_persons" ADD COLUMN "portrait_url" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "curated_persons" ADD CONSTRAINT "curated_persons_portrait_url_length" CHECK (char_length("curated_persons"."portrait_url") <= 2000000);
