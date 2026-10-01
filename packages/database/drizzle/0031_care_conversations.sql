CREATE TABLE "care_message_reads" (
	"care_id" varchar(128) NOT NULL,
	"reader_user_id" varchar(128) NOT NULL,
	"last_read_sequence" bigint DEFAULT 0 NOT NULL,
	CONSTRAINT "care_message_reads_care_id_reader_user_id_pk" PRIMARY KEY("care_id","reader_user_id")
);
--> statement-breakpoint
CREATE TABLE "care_messages" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"sequence" bigserial NOT NULL,
	"care_id" varchar(128) NOT NULL,
	"sender_user_id" varchar(128) NOT NULL,
	"text" text NOT NULL,
	"sent_at" timestamp with time zone NOT NULL,
	CONSTRAINT "care_messages_text_length" CHECK (char_length(btrim("care_messages"."text")) between 1 and 2000)
);
--> statement-breakpoint
ALTER TABLE "care_message_reads" ADD CONSTRAINT "care_message_reads_care_id_cares_id_fk" FOREIGN KEY ("care_id") REFERENCES "public"."cares"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_message_reads" ADD CONSTRAINT "care_message_reads_reader_user_id_user_id_fk" FOREIGN KEY ("reader_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_messages" ADD CONSTRAINT "care_messages_care_id_cares_id_fk" FOREIGN KEY ("care_id") REFERENCES "public"."cares"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_messages" ADD CONSTRAINT "care_messages_sender_user_id_user_id_fk" FOREIGN KEY ("sender_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "care_messages_care_sequence_index" ON "care_messages" USING btree ("care_id","sequence");
--> statement-breakpoint
CREATE FUNCTION delete_terminal_care_conversation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status IN ('completed', 'not_completed', 'expired', 'orphaned') THEN
    DELETE FROM care_messages WHERE care_id = NEW.id;
    DELETE FROM care_message_reads WHERE care_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER cares_delete_terminal_conversation
AFTER UPDATE OF status ON cares FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION delete_terminal_care_conversation();
