CREATE TABLE "party_memberships" (
	"owner_person_id" varchar(128) NOT NULL,
	"member_person_id" varchar(128) NOT NULL,
	"position" integer NOT NULL,
	"relationship_label" varchar(200) NOT NULL,
	"private_note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "party_memberships_not_self" CHECK ("party_memberships"."owner_person_id" <> "party_memberships"."member_person_id"),
	CONSTRAINT "party_memberships_position_range" CHECK ("party_memberships"."position" between 0 and 4)
);
--> statement-breakpoint
CREATE TABLE "person_profiles" (
	"person_id" varchar(128) PRIMARY KEY NOT NULL,
	"display_name" varchar(200) NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "party_memberships" ADD CONSTRAINT "party_memberships_owner_person_id_people_id_fk" FOREIGN KEY ("owner_person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "party_memberships" ADD CONSTRAINT "party_memberships_member_person_id_people_id_fk" FOREIGN KEY ("member_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_profiles" ADD CONSTRAINT "person_profiles_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "party_memberships_owner_member_unique" ON "party_memberships" USING btree ("owner_person_id","member_person_id");--> statement-breakpoint
CREATE UNIQUE INDEX "party_memberships_owner_position_unique" ON "party_memberships" USING btree ("owner_person_id","position");--> statement-breakpoint
CREATE INDEX "party_memberships_owner_index" ON "party_memberships" USING btree ("owner_person_id");