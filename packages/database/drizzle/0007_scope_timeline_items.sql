ALTER TABLE "timeline_items" ADD COLUMN "owner_user_id" varchar(128);
--> statement-breakpoint
ALTER TABLE "timeline_items" ADD CONSTRAINT "timeline_items_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
UPDATE "timeline_items" AS timeline_item
SET "owner_user_id" = invited_user."id"
FROM "user" AS invited_user
WHERE timeline_item."id" = 'timeline-item-mira-soup-001'
  AND timeline_item."owner_user_id" IS NULL
  AND invited_user."email" = 'river@example.test';
--> statement-breakpoint
CREATE INDEX "timeline_items_owner_index" ON "timeline_items" USING btree ("owner_user_id");
