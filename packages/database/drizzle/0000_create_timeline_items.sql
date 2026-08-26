CREATE TABLE "timeline_items" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"actor_id" varchar(128) NOT NULL,
	"actor_display_name" varchar(200) NOT NULL,
	"actor_layer" varchar(16) NOT NULL,
	"actor_initials" varchar(8),
	"actor_avatar_url" varchar(2048),
	"content" text NOT NULL,
	"published_at" timestamp with time zone NOT NULL,
	CONSTRAINT "timeline_items_id_length" CHECK (char_length("timeline_items"."id") >= 1),
	CONSTRAINT "timeline_items_actor_id_length" CHECK (char_length("timeline_items"."actor_id") >= 1),
	CONSTRAINT "timeline_items_actor_display_name_length" CHECK (char_length("timeline_items"."actor_display_name") >= 1),
	CONSTRAINT "timeline_items_actor_layer_allowed" CHECK ("timeline_items"."actor_layer" in ('party', 'tribe', 'guild', 'signal')),
	CONSTRAINT "timeline_items_actor_initials_length" CHECK ("timeline_items"."actor_initials" is null or char_length("timeline_items"."actor_initials") >= 1),
	CONSTRAINT "timeline_items_actor_avatar_url_length" CHECK ("timeline_items"."actor_avatar_url" is null or char_length("timeline_items"."actor_avatar_url") >= 1),
	CONSTRAINT "timeline_items_content_length" CHECK (char_length("timeline_items"."content") between 1 and 10000)
);

