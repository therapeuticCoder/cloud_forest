CREATE TABLE "care_requests" (
  "id" varchar(128) PRIMARY KEY NOT NULL,
  "requester_user_id" varchar(128) NOT NULL,
  "kind" varchar(16) DEFAULT 'meal' NOT NULL,
  "helpful_when" varchar(500) NOT NULL,
  "food_works" text NOT NULL,
  "food_does_not_work" text DEFAULT '' NOT NULL,
  "handoff_style" varchar(200) NOT NULL,
  "audience" varchar(16) DEFAULT 'party' NOT NULL,
  "status" varchar(16) DEFAULT 'open' NOT NULL,
  "claimant_user_id" varchar(128),
  "claimed_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL,
  CONSTRAINT "care_requests_id_length" CHECK (char_length("care_requests"."id") >= 1),
  CONSTRAINT "care_requests_kind_allowed" CHECK ("care_requests"."kind" = 'meal'),
  CONSTRAINT "care_requests_helpful_when_length" CHECK (char_length("care_requests"."helpful_when") between 1 and 500),
  CONSTRAINT "care_requests_food_works_length" CHECK (char_length("care_requests"."food_works") between 1 and 10000),
  CONSTRAINT "care_requests_food_does_not_work_length" CHECK (char_length("care_requests"."food_does_not_work") <= 10000),
  CONSTRAINT "care_requests_handoff_style_length" CHECK (char_length("care_requests"."handoff_style") between 1 and 200),
  CONSTRAINT "care_requests_audience_allowed" CHECK ("care_requests"."audience" = 'party'),
  CONSTRAINT "care_requests_status_allowed" CHECK ("care_requests"."status" in ('open', 'claimed')),
  CONSTRAINT "care_requests_claim_state" CHECK (("care_requests"."status" = 'open' and "care_requests"."claimant_user_id" is null and "care_requests"."claimed_at" is null) or ("care_requests"."status" = 'claimed' and "care_requests"."claimant_user_id" is not null and "care_requests"."claimed_at" is not null)),
  CONSTRAINT "care_requests_not_self_claimed" CHECK ("care_requests"."claimant_user_id" is null or "care_requests"."requester_user_id" <> "care_requests"."claimant_user_id")
);
--> statement-breakpoint
ALTER TABLE "care_requests" ADD CONSTRAINT "care_requests_requester_user_id_user_id_fk" FOREIGN KEY ("requester_user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
--> statement-breakpoint
ALTER TABLE "care_requests" ADD CONSTRAINT "care_requests_claimant_user_id_user_id_fk" FOREIGN KEY ("claimant_user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
--> statement-breakpoint
CREATE INDEX "care_requests_requester_index" ON "care_requests" USING btree ("requester_user_id");
--> statement-breakpoint
CREATE INDEX "care_requests_claimant_index" ON "care_requests" USING btree ("claimant_user_id");
