import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import type { TimelineItemLayer } from "@cloud-forest/domain";

export const timelineItems = pgTable(
  "timeline_items",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    actorId: varchar("actor_id", { length: 128 }).notNull(),
    actorDisplayName: varchar("actor_display_name", { length: 200 }).notNull(),
    actorLayer: varchar("actor_layer", { length: 16 })
      .$type<TimelineItemLayer>()
      .notNull(),
    actorInitials: varchar("actor_initials", { length: 8 }),
    actorAvatarUrl: varchar("actor_avatar_url", { length: 2_048 }),
    content: text("content").notNull(),
    publishedAt: timestamp("published_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (table) => [
    check("timeline_items_id_length", sql`char_length(${table.id}) >= 1`),
    check(
      "timeline_items_actor_id_length",
      sql`char_length(${table.actorId}) >= 1`,
    ),
    check(
      "timeline_items_actor_display_name_length",
      sql`char_length(${table.actorDisplayName}) >= 1`,
    ),
    check(
      "timeline_items_actor_layer_allowed",
      sql`${table.actorLayer} in ('party', 'tribe', 'guild', 'signal')`,
    ),
    check(
      "timeline_items_actor_initials_length",
      sql`${table.actorInitials} is null or char_length(${table.actorInitials}) >= 1`,
    ),
    check(
      "timeline_items_actor_avatar_url_length",
      sql`${table.actorAvatarUrl} is null or char_length(${table.actorAvatarUrl}) >= 1`,
    ),
    check(
      "timeline_items_content_length",
      sql`char_length(${table.content}) between 1 and 10000`,
    ),
  ],
);

// Better Auth's standard tables stay server-only and deliberately use plural
// TypeScript names. The adapter receives `usePlural: true`.
export const users = pgTable(
  "user",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => [uniqueIndex("user_email_unique").on(table.email)],
);

export const sessions = pgTable(
  "session",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: varchar("token", { length: 512 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    ipAddress: varchar("ip_address", { length: 128 }),
    userAgent: text("user_agent"),
    userId: varchar("user_id", { length: 128 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("session_token_unique").on(table.token),
    index("session_user_id_index").on(table.userId),
  ],
);

export const accounts = pgTable(
  "account",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    accountId: varchar("account_id", { length: 320 }).notNull(),
    providerId: varchar("provider_id", { length: 128 }).notNull(),
    userId: varchar("user_id", { length: 128 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    uniqueIndex("account_provider_account_unique").on(
      table.providerId,
      table.accountId,
    ),
    index("account_user_id_index").on(table.userId),
  ],
);

export const verifications = pgTable(
  "verification",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    identifier: varchar("identifier", { length: 512 }).notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [index("verification_identifier_index").on(table.identifier)],
);

export const people = pgTable("people", {
  id: varchar("id", { length: 128 }).primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const personProfiles = pgTable("person_profiles", {
  personId: varchar("person_id", { length: 128 })
    .primaryKey()
    .references(() => people.id, { onDelete: "cascade" }),
  displayName: varchar("display_name", { length: 200 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const partyMemberships = pgTable(
  "party_memberships",
  {
    ownerPersonId: varchar("owner_person_id", { length: 128 })
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    memberPersonId: varchar("member_person_id", { length: 128 })
      .notNull()
      .references(() => people.id, { onDelete: "restrict" }),
    position: integer("position").notNull(),
    relationshipLabel: varchar("relationship_label", { length: 200 }).notNull(),
    privateNote: text("private_note").notNull().default(""),
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    uniqueIndex("party_memberships_owner_member_unique").on(
      table.ownerPersonId,
      table.memberPersonId,
    ),
    uniqueIndex("party_memberships_owner_position_unique").on(
      table.ownerPersonId,
      table.position,
    ),
    index("party_memberships_owner_index").on(table.ownerPersonId),
    check(
      "party_memberships_not_self",
      sql`${table.ownerPersonId} <> ${table.memberPersonId}`,
    ),
    check(
      "party_memberships_position_range",
      sql`${table.position} between 0 and 4`,
    ),
  ],
);

export const accountPeople = pgTable(
  "account_people",
  {
    accountId: varchar("account_id", { length: 128 })
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    personId: varchar("person_id", { length: 128 })
      .notNull()
      .references(() => people.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (table) => [uniqueIndex("account_people_person_unique").on(table.personId)],
);

export const invitations = pgTable(
  "invitations",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    email: varchar("email", { length: 320 }).notNull(),
    personId: varchar("person_id", { length: 128 })
      .notNull()
      .references(() => people.id, { onDelete: "restrict" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (table) => [index("invitations_person_id_index").on(table.personId)],
);

export type TimelineItemRow = typeof timelineItems.$inferSelect;
export type NewTimelineItemRow = typeof timelineItems.$inferInsert;
