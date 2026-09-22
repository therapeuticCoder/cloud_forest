import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import type {
  CareCategoryId,
  CareDay,
  CareDirection,
  CareStatus,
  CareTime,
  CuratedPersonPlacement,
  TimelineAudience,
  TimelineItemLayer,
} from "@cloud-forest/domain";

export type { CareDirection, CareStatus } from "@cloud-forest/domain";

export type AccountRole = "admin" | "user";
export type ConnectionPairingStatus =
  | "pending"
  | "completed"
  | "cancelled"
  | "superseded";
export type CareAudience = "party" | "tribe";
export type {
  CareExpiration,
  CareGratitudeStatementId,
  CareWithdrawalStatementId,
} from "@cloud-forest/domain";
import type {
  CareGratitudeStatementId,
  CareWithdrawalStatementId,
} from "@cloud-forest/domain";

export const timelineItems = pgTable(
  "timeline_items",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    ownerUserId: varchar("owner_user_id", { length: 128 }).references(
      () => users.id,
      { onDelete: "cascade" },
    ),
    authorUserId: varchar("author_user_id", { length: 128 }).references(
      () => users.id,
      { onDelete: "cascade" },
    ),
    audience: varchar("audience", { length: 16 }).$type<TimelineAudience>(),
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
    index("timeline_items_owner_index").on(table.ownerUserId),
    index("timeline_items_author_published_index").on(
      table.authorUserId,
      table.publishedAt,
    ),
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
    check(
      "timeline_items_post_fields_together",
      sql`(${table.authorUserId} is null and ${table.audience} is null) or (${table.authorUserId} is not null and ${table.audience} in ('party', 'tribe'))`,
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
    username: varchar("username", { length: 30 }),
    role: varchar("role", { length: 16 })
      .$type<AccountRole>()
      .notNull()
      .default("user"),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    uniqueIndex("user_email_unique").on(table.email),
    uniqueIndex("user_username_unique").on(table.username),
    check("user_role_allowed", sql`${table.role} in ('admin', 'user')`),
  ],
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
    check("party_memberships_position_range", sql`${table.position} >= 0`),
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

export const curatedPersons = pgTable(
  "curated_persons",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    ownerUserId: varchar("owner_user_id", { length: 128 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    firstName: varchar("first_name", { length: 100 }).notNull().default(""),
    lastName: varchar("last_name", { length: 100 }).notNull().default(""),
    nickname: varchar("nickname", { length: 200 }).notNull(),
    relationshipShape: varchar("relationship_shape", {
      length: 200,
    }).notNull(),
    privateDescription: text("private_description").notNull().default(""),
    portraitUrl: text("portrait_url").notNull().default(""),
    placement: varchar("placement", { length: 16 })
      .$type<CuratedPersonPlacement>()
      .notNull(),
    linkedUserId: varchar("linked_user_id", { length: 128 }).references(
      () => users.id,
      { onDelete: "set null" },
    ),
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    index("curated_persons_owner_index").on(table.ownerUserId),
    check("curated_persons_id_length", sql`char_length(${table.id}) >= 1`),
    check(
      "curated_persons_nickname_length",
      sql`char_length(${table.nickname}) between 1 and 200`,
    ),
    check(
      "curated_persons_relationship_shape_length",
      sql`char_length(${table.relationshipShape}) between 1 and 200`,
    ),
    check(
      "curated_persons_private_description_length",
      sql`char_length(${table.privateDescription}) <= 10000`,
    ),
    check(
      "curated_persons_portrait_url_length",
      sql`char_length(${table.portraitUrl}) <= 2000000`,
    ),
    check(
      "curated_persons_placement_allowed",
      sql`${table.placement} in ('party', 'tribe', 'guild', 'signal', 'holding')`,
    ),
    check("curated_persons_version_positive", sql`${table.version} >= 1`),
  ],
);

export const connections = pgTable(
  "connections",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    firstUserId: varchar("first_user_id", { length: 128 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    secondUserId: varchar("second_user_id", { length: 128 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    uniqueIndex("connections_users_unique").on(
      table.firstUserId,
      table.secondUserId,
    ),
    check(
      "connections_users_ordered",
      sql`${table.firstUserId} < ${table.secondUserId}`,
    ),
  ],
);

export const cares = pgTable(
  "cares",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    originatorUserId: varchar("originator_user_id", { length: 128 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    participantUserId: varchar("participant_user_id", {
      length: 128,
    }).references(() => users.id, { onDelete: "cascade" }),
    direction: varchar("direction", { length: 8 })
      .$type<CareDirection>()
      .notNull(),
    category: varchar("category", { length: 32 })
      .$type<CareCategoryId>()
      .notNull()
      .default("food"),
    subtype: varchar("subtype", { length: 200 }).notNull().default(""),
    days: jsonb("days").$type<CareDay[]>().notNull().default([]),
    times: jsonb("times").$type<CareTime[]>().notNull().default([]),
    timeNote: varchar("time_note", { length: 500 }).notNull().default(""),
    location: varchar("location", { length: 500 })
      .notNull()
      .default("Not specified"),
    requirements: text("requirements").notNull().default(""),
    sensitivities: text("sensitivities").notNull().default(""),
    audience: varchar("audience", { length: 16 })
      .$type<CareAudience>()
      .notNull()
      .default("party"),
    status: varchar("status", { length: 16 })
      .$type<CareStatus>()
      .notNull()
      .default("open"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    claimedAt: timestamp("claimed_at", { withTimezone: true }),
    originatorCompletedAt: timestamp("originator_completed_at", {
      withTimezone: true,
    }),
    participantCompletedAt: timestamp("participant_completed_at", {
      withTimezone: true,
    }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    expiredAt: timestamp("expired_at", { withTimezone: true }),
    withdrawnByUserId: varchar("withdrawn_by_user_id", {
      length: 128,
    }).references(() => users.id, { onDelete: "cascade" }),
    notCompletedAt: timestamp("not_completed_at", { withTimezone: true }),
    withdrawalStatementId: varchar("withdrawal_statement_id", {
      length: 64,
    }).$type<CareWithdrawalStatementId>(),
    withdrawalMessage: text("withdrawal_message").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    index("cares_originator_index").on(table.originatorUserId),
    index("cares_participant_index").on(table.participantUserId),
    check("cares_id_length", sql`char_length(${table.id}) >= 1`),
    check(
      "cares_direction_allowed",
      sql`${table.direction} in ('give', 'receive')`,
    ),
    check(
      "cares_category_allowed",
      sql`${table.category} in ('transportation', 'food', 'pet-care', 'child-care', 'urgent-shelter', 'help-at-home', 'executive-function-support', 'get-out-of-the-house')`,
    ),
    check("cares_subtype_length", sql`char_length(${table.subtype}) <= 200`),
    check("cares_time_note_length", sql`char_length(${table.timeNote}) <= 500`),
    check(
      "cares_location_length",
      sql`char_length(${table.location}) between 1 and 500`,
    ),
    check(
      "cares_requirements_length",
      sql`char_length(${table.requirements}) <= 10000`,
    ),
    check(
      "cares_sensitivities_length",
      sql`char_length(${table.sensitivities}) <= 10000`,
    ),
    check(
      "cares_audience_allowed",
      sql`${table.audience} in ('party', 'tribe')`,
    ),
    check(
      "cares_status_allowed",
      sql`${table.status} in ('open', 'claimed', 'orphaned', 'completed', 'expired', 'not_completed')`,
    ),
    check(
      "cares_lifecycle_allowed",
      sql`(${table.status} = 'open' and ${table.participantUserId} is null and ${table.claimedAt} is null and ${table.originatorCompletedAt} is null and ${table.participantCompletedAt} is null and ${table.completedAt} is null and ${table.expiredAt} is null and ${table.withdrawnByUserId} is null and ${table.notCompletedAt} is null and ${table.withdrawalStatementId} is null) or (${table.status} in ('claimed', 'orphaned') and ${table.participantUserId} is not null and ${table.claimedAt} is not null and ${table.completedAt} is null and (${table.originatorCompletedAt} is null or ${table.participantCompletedAt} is null) and ${table.expiredAt} is null and ${table.withdrawnByUserId} is null and ${table.notCompletedAt} is null and ${table.withdrawalStatementId} is null) or (${table.status} = 'completed' and ${table.participantUserId} is not null and ${table.claimedAt} is not null and ${table.originatorCompletedAt} is not null and ${table.participantCompletedAt} is not null and ${table.completedAt} is not null and ${table.expiredAt} is null and ${table.withdrawnByUserId} is null and ${table.notCompletedAt} is null and ${table.withdrawalStatementId} is null) or (${table.status} = 'expired' and ${table.participantUserId} is null and ${table.claimedAt} is null and ${table.originatorCompletedAt} is null and ${table.participantCompletedAt} is null and ${table.completedAt} is null and ${table.expiredAt} is not null and ${table.withdrawnByUserId} is null and ${table.notCompletedAt} is null and ${table.withdrawalStatementId} is null) or (${table.status} = 'not_completed' and ${table.participantUserId} is not null and ${table.claimedAt} is not null and ${table.completedAt} is null and ${table.expiredAt} is null and ${table.withdrawnByUserId} is not null and ${table.notCompletedAt} is not null and ${table.withdrawalStatementId} is not null)`,
    ),
    check(
      "cares_withdrawal_statement_allowed",
      sql`${table.withdrawalStatementId} is null or ${table.withdrawalStatementId} in ('meal-sorry-cant-follow-through', 'meal-something-changed', 'meal-sorry-committed')`,
    ),
    check(
      "cares_withdrawal_message_length",
      sql`char_length(${table.withdrawalMessage}) <= 1000`,
    ),
    check(
      "cares_not_self_claimed",
      sql`${table.participantUserId} is null or ${table.originatorUserId} <> ${table.participantUserId}`,
    ),
  ],
);

export const careGratitudes = pgTable(
  "care_gratitudes",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    careId: varchar("care_id", { length: 128 })
      .notNull()
      .references(() => cares.id, { onDelete: "cascade" }),
    receiverUserId: varchar("receiver_user_id", { length: 128 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    giverUserId: varchar("giver_user_id", { length: 128 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    statementId: varchar("statement_id", { length: 64 })
      .$type<CareGratitudeStatementId>()
      .notNull(),
    message: text("message").notNull().default(""),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (table) => [
    uniqueIndex("care_gratitudes_care_unique").on(table.careId),
    index("care_gratitudes_receiver_index").on(table.receiverUserId),
    index("care_gratitudes_giver_index").on(table.giverUserId),
    check("care_gratitudes_id_length", sql`char_length(${table.id}) >= 1`),
    check(
      "care_gratitudes_statement_allowed",
      sql`${table.statementId} in ('meal-fed-when-needed', 'meal-care-felt-easy', 'meal-seen-and-supported')`,
    ),
    check(
      "care_gratitudes_message_length",
      sql`char_length(${table.message}) <= 1000`,
    ),
    check(
      "care_gratitudes_participants_distinct",
      sql`${table.receiverUserId} <> ${table.giverUserId}`,
    ),
  ],
);

export const carePasses = pgTable(
  "care_passes",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    careId: varchar("care_id", { length: 128 })
      .notNull()
      .references(() => cares.id, { onDelete: "cascade" }),
    originatorUserId: varchar("originator_user_id", { length: 128 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    viewerUserId: varchar("viewer_user_id", { length: 128 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    audience: varchar("audience", { length: 16 })
      .$type<CareAudience>()
      .notNull(),
    passedAt: timestamp("passed_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    uniqueIndex("care_passes_viewer_unique").on(
      table.careId,
      table.viewerUserId,
      table.audience,
    ),
    index("care_passes_originator_viewer_index").on(
      table.originatorUserId,
      table.viewerUserId,
    ),
    check(
      "care_passes_audience_allowed",
      sql`${table.audience} in ('party', 'tribe')`,
    ),
    check(
      "care_passes_viewer_distinct",
      sql`${table.originatorUserId} <> ${table.viewerUserId}`,
    ),
  ],
);

export const relationshipBlocks = pgTable(
  "relationship_blocks",
  {
    blockerUserId: varchar("blocker_user_id", { length: 128 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    blockedUserId: varchar("blocked_user_id", { length: 128 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    contextCuratedPersonId: varchar("context_curated_person_id", {
      length: 128,
    }).references(() => curatedPersons.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.blockerUserId, table.blockedUserId],
      name: "relationship_blocks_pkey",
    }),
    index("relationship_blocks_blocker_index").on(table.blockerUserId),
    index("relationship_blocks_blocked_index").on(table.blockedUserId),
    check(
      "relationship_blocks_users_distinct",
      sql`${table.blockerUserId} <> ${table.blockedUserId}`,
    ),
  ],
);

export const connectionPairings = pgTable(
  "connection_pairings",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    tokenHash: varchar("token_hash", { length: 128 }).notNull(),
    initiatorUserId: varchar("initiator_user_id", { length: 128 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    initiatorCuratedPersonId: varchar("initiator_curated_person_id", {
      length: 128,
    })
      .notNull()
      .references(() => curatedPersons.id, { onDelete: "cascade" }),
    receiverUserId: varchar("receiver_user_id", { length: 128 }).references(
      () => users.id,
      { onDelete: "cascade" },
    ),
    receiverCuratedPersonId: varchar("receiver_curated_person_id", {
      length: 128,
    }).references(() => curatedPersons.id, { onDelete: "cascade" }),
    initiatorConfirmedAt: timestamp("initiator_confirmed_at", {
      withTimezone: true,
    }),
    receiverConfirmedAt: timestamp("receiver_confirmed_at", {
      withTimezone: true,
    }),
    status: varchar("status", { length: 16 })
      .$type<ConnectionPairingStatus>()
      .notNull()
      .default("pending"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    supersededAt: timestamp("superseded_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    uniqueIndex("connection_pairings_token_hash_unique").on(table.tokenHash),
    index("connection_pairings_initiator_character_index").on(
      table.initiatorCuratedPersonId,
    ),
    check(
      "connection_pairings_status_allowed",
      sql`${table.status} in ('pending', 'completed', 'cancelled', 'superseded')`,
    ),
    check(
      "connection_pairings_receiver_resolution",
      sql`(${table.receiverUserId} is null) = (${table.receiverCuratedPersonId} is null)`,
    ),
  ],
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

export const signupCodes = pgTable(
  "signup_codes",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    code: varchar("code", { length: 256 }).notNull(),
    createdByUserId: varchar("created_by_user_id", { length: 128 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    connectionPairingId: varchar("connection_pairing_id", {
      length: 128,
    }).references(() => connectionPairings.id, { onDelete: "cascade" }),
    usedAt: timestamp("used_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    uniqueIndex("signup_codes_code_unique").on(table.code),
    index("signup_codes_creator_index").on(table.createdByUserId),
    index("signup_codes_pairing_index").on(table.connectionPairingId),
  ],
);

export type TimelineItemRow = typeof timelineItems.$inferSelect;
export type NewTimelineItemRow = typeof timelineItems.$inferInsert;
