CREATE TABLE "connections" (
  "id" varchar(128) PRIMARY KEY NOT NULL,
  "first_user_id" varchar(128) NOT NULL,
  "second_user_id" varchar(128) NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  CONSTRAINT "connections_users_ordered" CHECK ("connections"."first_user_id" < "connections"."second_user_id")
);
--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_first_user_id_user_id_fk" FOREIGN KEY ("first_user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_second_user_id_user_id_fk" FOREIGN KEY ("second_user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
--> statement-breakpoint
CREATE UNIQUE INDEX "connections_users_unique" ON "connections" USING btree ("first_user_id","second_user_id");
--> statement-breakpoint
CREATE TABLE "connection_pairings" (
  "id" varchar(128) PRIMARY KEY NOT NULL,
  "token_hash" varchar(128) NOT NULL,
  "initiator_user_id" varchar(128) NOT NULL,
  "initiator_curated_person_id" varchar(128) NOT NULL,
  "receiver_user_id" varchar(128),
  "receiver_curated_person_id" varchar(128),
  "initiator_confirmed_at" timestamp with time zone,
  "receiver_confirmed_at" timestamp with time zone,
  "status" varchar(16) DEFAULT 'pending' NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "completed_at" timestamp with time zone,
  "cancelled_at" timestamp with time zone,
  "superseded_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  CONSTRAINT "connection_pairings_status_allowed" CHECK ("connection_pairings"."status" in ('pending', 'completed', 'cancelled', 'superseded')),
  CONSTRAINT "connection_pairings_receiver_resolution" CHECK (("connection_pairings"."receiver_user_id" is null) = ("connection_pairings"."receiver_curated_person_id" is null))
);
--> statement-breakpoint
ALTER TABLE "connection_pairings" ADD CONSTRAINT "connection_pairings_initiator_user_id_user_id_fk" FOREIGN KEY ("initiator_user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
--> statement-breakpoint
ALTER TABLE "connection_pairings" ADD CONSTRAINT "connection_pairings_initiator_curated_person_id_curated_persons_id_fk" FOREIGN KEY ("initiator_curated_person_id") REFERENCES "public"."curated_persons"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
--> statement-breakpoint
ALTER TABLE "connection_pairings" ADD CONSTRAINT "connection_pairings_receiver_user_id_user_id_fk" FOREIGN KEY ("receiver_user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
--> statement-breakpoint
ALTER TABLE "connection_pairings" ADD CONSTRAINT "connection_pairings_receiver_curated_person_id_curated_persons_id_fk" FOREIGN KEY ("receiver_curated_person_id") REFERENCES "public"."curated_persons"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
--> statement-breakpoint
CREATE UNIQUE INDEX "connection_pairings_token_hash_unique" ON "connection_pairings" USING btree ("token_hash");
--> statement-breakpoint
CREATE INDEX "connection_pairings_initiator_character_index" ON "connection_pairings" USING btree ("initiator_curated_person_id");
