CREATE TABLE "relationship_blocks" (
	"blocker_user_id" varchar(128) NOT NULL,
	"blocked_user_id" varchar(128) NOT NULL,
	"context_curated_person_id" varchar(128),
	"created_at" timestamp with time zone NOT NULL,
	CONSTRAINT "relationship_blocks_pkey" PRIMARY KEY("blocker_user_id","blocked_user_id"),
	CONSTRAINT "relationship_blocks_users_distinct" CHECK ("relationship_blocks"."blocker_user_id" <> "relationship_blocks"."blocked_user_id")
);
--> statement-breakpoint
ALTER TABLE "relationship_blocks" ADD CONSTRAINT "relationship_blocks_blocker_user_id_user_id_fk" FOREIGN KEY ("blocker_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE NO ACTION;
--> statement-breakpoint
ALTER TABLE "relationship_blocks" ADD CONSTRAINT "relationship_blocks_blocked_user_id_user_id_fk" FOREIGN KEY ("blocked_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE NO ACTION;
--> statement-breakpoint
ALTER TABLE "relationship_blocks" ADD CONSTRAINT "relationship_blocks_context_curated_person_id_curated_persons_id_fk" FOREIGN KEY ("context_curated_person_id") REFERENCES "public"."curated_persons"("id") ON DELETE set null ON UPDATE NO ACTION;
--> statement-breakpoint
CREATE INDEX "relationship_blocks_blocker_index" ON "relationship_blocks" USING btree ("blocker_user_id");
--> statement-breakpoint
CREATE INDEX "relationship_blocks_blocked_index" ON "relationship_blocks" USING btree ("blocked_user_id");
