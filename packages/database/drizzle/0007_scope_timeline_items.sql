ALTER TABLE "timeline_items" ADD COLUMN "owner_user_id" varchar(128);
--> statement-breakpoint
ALTER TABLE "timeline_items" ADD CONSTRAINT "timeline_items_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "timeline_items_owner_index" ON "timeline_items" USING btree ("owner_user_id");
