ALTER TABLE "curated_persons" ADD COLUMN "first_name" varchar(100) DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "curated_persons" ADD COLUMN "last_name" varchar(100) DEFAULT '' NOT NULL;
