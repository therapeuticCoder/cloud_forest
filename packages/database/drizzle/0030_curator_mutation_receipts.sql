CREATE TABLE "curator_mutation_receipts" (
  "owner_user_id" varchar(128) NOT NULL,
  "mutation_id" varchar(128) NOT NULL,
  "fingerprint" text NOT NULL,
  "result" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "curator_mutation_receipts_owner_user_id_mutation_id_pk" PRIMARY KEY("owner_user_id", "mutation_id")
);
--> statement-breakpoint
ALTER TABLE "curator_mutation_receipts" ADD CONSTRAINT "curator_mutation_receipts_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
