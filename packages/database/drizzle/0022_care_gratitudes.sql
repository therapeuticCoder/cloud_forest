CREATE TABLE "care_gratitudes" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"care_request_id" varchar(128) NOT NULL,
	"receiver_user_id" varchar(128) NOT NULL,
	"giver_user_id" varchar(128) NOT NULL,
	"statement_id" varchar(64) NOT NULL,
	"message" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	CONSTRAINT "care_gratitudes_id_length" CHECK (char_length("care_gratitudes"."id") >= 1),
	CONSTRAINT "care_gratitudes_statement_allowed" CHECK ("care_gratitudes"."statement_id" in ('meal-fed-when-needed', 'meal-care-felt-easy', 'meal-seen-and-supported')),
	CONSTRAINT "care_gratitudes_message_length" CHECK (char_length("care_gratitudes"."message") <= 1000),
	CONSTRAINT "care_gratitudes_participants_distinct" CHECK ("care_gratitudes"."receiver_user_id" <> "care_gratitudes"."giver_user_id")
);
--> statement-breakpoint
ALTER TABLE "care_gratitudes" ADD CONSTRAINT "care_gratitudes_request_id_care_requests_id_fk" FOREIGN KEY ("care_request_id") REFERENCES "public"."care_requests"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
--> statement-breakpoint
ALTER TABLE "care_gratitudes" ADD CONSTRAINT "care_gratitudes_receiver_user_id_user_id_fk" FOREIGN KEY ("receiver_user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
--> statement-breakpoint
ALTER TABLE "care_gratitudes" ADD CONSTRAINT "care_gratitudes_giver_user_id_user_id_fk" FOREIGN KEY ("giver_user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
--> statement-breakpoint
CREATE UNIQUE INDEX "care_gratitudes_request_unique" ON "care_gratitudes" USING btree ("care_request_id");
--> statement-breakpoint
CREATE INDEX "care_gratitudes_receiver_index" ON "care_gratitudes" USING btree ("receiver_user_id");
--> statement-breakpoint
CREATE INDEX "care_gratitudes_giver_index" ON "care_gratitudes" USING btree ("giver_user_id");
