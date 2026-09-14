ALTER TABLE "connection_pairings" DROP CONSTRAINT "connection_pairings_initiator_curated_person_id_curated_persons_id_fk";
--> statement-breakpoint
ALTER TABLE "connection_pairings" ADD CONSTRAINT "connection_pairings_initiator_curated_person_id_curated_persons_id_fk" FOREIGN KEY ("initiator_curated_person_id") REFERENCES "public"."curated_persons"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
--> statement-breakpoint
ALTER TABLE "connection_pairings" DROP CONSTRAINT "connection_pairings_receiver_curated_person_id_curated_persons_id_fk";
--> statement-breakpoint
ALTER TABLE "connection_pairings" ADD CONSTRAINT "connection_pairings_receiver_curated_person_id_curated_persons_id_fk" FOREIGN KEY ("receiver_curated_person_id") REFERENCES "public"."curated_persons"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
