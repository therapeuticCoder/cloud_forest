CREATE TABLE "curated_persons" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"owner_user_id" varchar(128) NOT NULL,
	"nickname" varchar(200) NOT NULL,
	"relationship_shape" varchar(200) NOT NULL,
	"private_description" text DEFAULT '' NOT NULL,
	"placement" varchar(16) NOT NULL,
	"linked_user_id" varchar(128),
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "curated_persons_id_length" CHECK (char_length("curated_persons"."id") >= 1),
	CONSTRAINT "curated_persons_nickname_length" CHECK (char_length("curated_persons"."nickname") between 1 and 200),
	CONSTRAINT "curated_persons_relationship_shape_length" CHECK (char_length("curated_persons"."relationship_shape") between 1 and 200),
	CONSTRAINT "curated_persons_private_description_length" CHECK (char_length("curated_persons"."private_description") <= 10000),
	CONSTRAINT "curated_persons_placement_allowed" CHECK ("curated_persons"."placement" in ('party', 'tribe', 'guild', 'signal', 'holding')),
	CONSTRAINT "curated_persons_version_positive" CHECK ("curated_persons"."version" >= 1)
);
--> statement-breakpoint
ALTER TABLE "curated_persons" ADD CONSTRAINT "curated_persons_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curated_persons" ADD CONSTRAINT "curated_persons_linked_user_id_user_id_fk" FOREIGN KEY ("linked_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "curated_persons_owner_index" ON "curated_persons" USING btree ("owner_user_id");