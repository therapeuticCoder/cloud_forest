ALTER TABLE "timeline_items" ADD COLUMN "author_user_id" varchar(128);
--> statement-breakpoint
ALTER TABLE "timeline_items" ADD COLUMN "audience" varchar(16);
--> statement-breakpoint
ALTER TABLE "timeline_items" ADD CONSTRAINT "timeline_items_author_user_id_user_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "timeline_items" ADD CONSTRAINT "timeline_items_post_fields_together" CHECK (("timeline_items"."author_user_id" is null and "timeline_items"."audience" is null) or ("timeline_items"."author_user_id" is not null and "timeline_items"."audience" in ('party', 'tribe')));
--> statement-breakpoint
CREATE INDEX "timeline_items_author_published_index" ON "timeline_items" USING btree ("author_user_id", "published_at");
