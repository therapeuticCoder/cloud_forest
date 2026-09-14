ALTER TABLE "signup_codes" ADD COLUMN "connection_pairing_id" varchar(128);
--> statement-breakpoint
ALTER TABLE "signup_codes" ADD COLUMN "revoked_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "signup_codes" ADD CONSTRAINT "signup_codes_connection_pairing_id_connection_pairings_id_fk" FOREIGN KEY ("connection_pairing_id") REFERENCES "public"."connection_pairings"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
--> statement-breakpoint
CREATE INDEX "signup_codes_pairing_index" ON "signup_codes" USING btree ("connection_pairing_id");
