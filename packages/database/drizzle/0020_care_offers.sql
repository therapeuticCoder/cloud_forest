CREATE TABLE "care_offers" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"giver_user_id" varchar(128) NOT NULL,
	"kind" varchar(16) DEFAULT 'meal' NOT NULL,
	"meal_description" text NOT NULL,
	"available_when" varchar(500) NOT NULL,
	"handoff_style" varchar(200) NOT NULL,
	"audience" varchar(16) DEFAULT 'party' NOT NULL,
	"status" varchar(16) DEFAULT 'available' NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "care_offers" ADD CONSTRAINT "care_offers_giver_user_id_user_id_fk" FOREIGN KEY ("giver_user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
--> statement-breakpoint
CREATE INDEX "care_offers_giver_index" ON "care_offers" USING btree ("giver_user_id");
--> statement-breakpoint
ALTER TABLE "care_offers" ADD CONSTRAINT "care_offers_id_length" CHECK (char_length("care_offers"."id") >= 1);
--> statement-breakpoint
ALTER TABLE "care_offers" ADD CONSTRAINT "care_offers_kind_allowed" CHECK ("care_offers"."kind" = 'meal');
--> statement-breakpoint
ALTER TABLE "care_offers" ADD CONSTRAINT "care_offers_meal_description_length" CHECK (char_length("care_offers"."meal_description") between 1 and 10000);
--> statement-breakpoint
ALTER TABLE "care_offers" ADD CONSTRAINT "care_offers_available_when_length" CHECK (char_length("care_offers"."available_when") between 1 and 500);
--> statement-breakpoint
ALTER TABLE "care_offers" ADD CONSTRAINT "care_offers_handoff_style_length" CHECK (char_length("care_offers"."handoff_style") between 1 and 200);
--> statement-breakpoint
ALTER TABLE "care_offers" ADD CONSTRAINT "care_offers_audience_allowed" CHECK ("care_offers"."audience" = 'party');
--> statement-breakpoint
ALTER TABLE "care_offers" ADD CONSTRAINT "care_offers_status_allowed" CHECK ("care_offers"."status" = 'available');
