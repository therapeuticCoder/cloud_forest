ALTER TABLE "care_requests" ADD COLUMN "originator_user_id" varchar(128);
--> statement-breakpoint
UPDATE "care_requests" SET "originator_user_id" = "requester_user_id" WHERE "originator_user_id" IS NULL;
--> statement-breakpoint
ALTER TABLE "care_requests" ALTER COLUMN "originator_user_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "care_requests" ADD CONSTRAINT "care_requests_originator_user_id_user_id_fk" FOREIGN KEY ("originator_user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
--> statement-breakpoint
CREATE INDEX "care_requests_originator_index" ON "care_requests" USING btree ("originator_user_id");
