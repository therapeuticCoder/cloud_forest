import { createHash } from "node:crypto";

import type { TimelineItemRepository } from "@cloud-forest/database";

const publicAudience = "https://www.w3.org/ns/activitystreams#Public";
const activityPubAccept =
  'application/activity+json, application/ld+json; profile="https://www.w3.org/ns/activitystreams"';
const maximumImportedItems = 5;

type JsonObject = Record<string, unknown>;

type ActivityPubFetcher = (
  input: string | URL,
  init?: RequestInit,
) => Promise<Response>;

class HttpResponseError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Remote request failed with ${status}.`);
    this.name = "HttpResponseError";
    this.status = status;
  }
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function objectId(value: unknown): string | undefined {
  if (typeof value === "string") return stringValue(value);
  return isJsonObject(value) ? stringValue(value.id) : undefined;
}

function objectUrl(value: unknown): string | undefined {
  if (typeof value === "string") return stringValue(value);
  if (!isJsonObject(value)) return undefined;
  return stringValue(value.url) ?? stringValue(value.id);
}

function publicUrl(value: string, baseUrl: string): string {
  const resolved = new URL(value, baseUrl);
  if (resolved.protocol !== "http:" && resolved.protocol !== "https:") {
    throw new Error("ActivityPub source must use HTTP or HTTPS.");
  }
  return resolved.toString();
}

async function fetchJson(
  url: string,
  fetcher: ActivityPubFetcher,
): Promise<JsonObject> {
  const response = await fetcher(url, {
    headers: {
      accept: activityPubAccept,
      "user-agent": "Cloud Forest alpha Signal reader",
    },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new HttpResponseError(response.status);
  }

  const body: unknown = await response.json();
  if (!isJsonObject(body)) {
    throw new Error("ActivityPub response was not an object.");
  }
  return body;
}

function collectionItems(collection: JsonObject): unknown[] {
  const items = collection.orderedItems ?? collection.items;
  return Array.isArray(items) ? items : [];
}

function handleParts(source: string) {
  const match = /^@?([^@\s]+)@([^@\s]+)$/.exec(source.trim());
  return match === null ? undefined : { username: match[1], host: match[2] };
}

async function resolveSourceActor(
  source: string,
  fetcher: ActivityPubFetcher,
): Promise<string> {
  const normalizedSource = source.trim();
  if (/^https?:\/\//i.test(normalizedSource)) {
    return publicUrl(normalizedSource, normalizedSource);
  }

  const parts = handleParts(normalizedSource);
  if (parts === undefined) {
    throw new Error("SIGNAL_SOURCE_HANDLE must be a federated account handle.");
  }

  const webFingerUrl = new URL(`https://${parts.host}/.well-known/webfinger`);
  webFingerUrl.searchParams.set(
    "resource",
    `acct:${parts.username}@${parts.host}`,
  );
  const webFinger = await fetchJson(webFingerUrl.toString(), fetcher);
  const links = Array.isArray(webFinger.links) ? webFinger.links : [];
  const actorLink = links.find((link) => {
    if (!isJsonObject(link) || link.rel !== "self") return false;
    const type = stringValue(link.type);
    return (
      type === undefined ||
      type.includes("activity+json") ||
      type.includes("application/ld+json")
    );
  });
  const actorUrl = isJsonObject(actorLink)
    ? stringValue(actorLink.href)
    : undefined;

  if (actorUrl === undefined) {
    throw new Error("WebFinger did not return an ActivityPub actor.");
  }
  return publicUrl(actorUrl, webFingerUrl.toString());
}

function textFromHtml(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_, code: string) => {
      const point = Number(code);
      return Number.isInteger(point) && point >= 0 && point <= 0x10ffff
        ? String.fromCodePoint(point)
        : "";
    })
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function textValue(value: unknown): string | undefined {
  const text = stringValue(value);
  if (text === undefined) return undefined;
  const plainText = textFromHtml(text);
  return plainText === "" ? undefined : plainText;
}

function containsPublicAudience(value: unknown): boolean {
  if (typeof value === "string") return value === publicAudience;
  if (Array.isArray(value)) return value.some(containsPublicAudience);
  return isJsonObject(value) && containsPublicAudience(value.id);
}

function stableId(prefix: string, value: string): string {
  const digest = createHash("sha256").update(value).digest("hex");
  return `${prefix}-${digest.slice(0, 40)}`;
}

function actorInitials(displayName: string): string {
  return displayName
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

function actorImageUrl(actor: JsonObject, actorUrl: string): string | undefined {
  const imageUrl = objectUrl(actor.icon);
  if (imageUrl === undefined) return undefined;
  const resolved = publicUrl(imageUrl, actorUrl);
  return resolved.length <= 2_048 ? resolved : undefined;
}

function profileImageUrl(profile: JsonObject, profileUrl: string): string | undefined {
  const imageUrl = objectUrl(profile.icon) ?? stringValue(profile.avatar);
  if (imageUrl === undefined) return undefined;
  const resolved = publicUrl(imageUrl, profileUrl);
  return resolved.length <= 2_048 ? resolved : undefined;
}

function parseSignalItem(
  value: unknown,
  actor: JsonObject,
  actorUrl: string,
  actorId: string,
) {
  if (!isJsonObject(value)) return undefined;

  const object = isJsonObject(value.object) ? value.object : value;
  const objectType = stringValue(object.type);
  if (value !== object && stringValue(value.type) !== "Create") return undefined;
  if (
    objectType !== undefined &&
    objectType !== "Note" &&
    objectType !== "Article" &&
    objectType !== "Question"
  ) {
    return undefined;
  }

  const attributedTo = objectId(object.attributedTo) ?? objectId(value.actor);
  if (attributedTo !== undefined && attributedTo !== actorId) return undefined;

  const isPublic =
    containsPublicAudience(object.to) ||
    containsPublicAudience(object.cc) ||
    containsPublicAudience(object.audience);
  if (!isPublic) return undefined;

  const externalId = objectId(object.id) ?? objectId(value.id);
  const content = textValue(object.content) ?? textValue(object.summary);
  const publishedAt =
    stringValue(object.published) ?? stringValue(object.updated);
  if (
    externalId === undefined ||
    content === undefined ||
    publishedAt === undefined
  ) {
    return undefined;
  }
  if (content.length === 0 || content.length > 10_000) return undefined;

  const publishedDate = new Date(publishedAt);
  if (Number.isNaN(publishedDate.getTime())) return undefined;

  const displayName =
    textValue(actor.name) ??
    stringValue(actor.preferredUsername) ??
    new URL(actorUrl).hostname;

  return {
    id: stableId("timeline-signal", externalId),
    actorId: stableId("signal-source", actorId),
    actorDisplayName: displayName.slice(0, 200),
    actorInitials: actorInitials(displayName),
    actorAvatarUrl: actorImageUrl(actor, actorUrl),
    content,
    publishedAt: publishedDate,
  };
}

function parseMastodonStatus(
  value: unknown,
  account: JsonObject,
  actorUrl: string,
  actorId: string,
) {
  if (!isJsonObject(value)) return undefined;
  if (stringValue(value.visibility) !== "public") return undefined;
  if (isJsonObject(value.reblog)) return undefined;

  const externalId = stringValue(value.id);
  const content = textValue(value.content) ?? textValue(value.spoiler_text);
  const publishedAt =
    stringValue(value.created_at) ?? stringValue(value.edited_at);
  if (
    externalId === undefined ||
    content === undefined ||
    publishedAt === undefined
  ) {
    return undefined;
  }
  if (content.length === 0 || content.length > 10_000) return undefined;

  const publishedDate = new Date(publishedAt);
  if (Number.isNaN(publishedDate.getTime())) return undefined;

  const displayName =
    textValue(account.display_name) ??
    stringValue(account.username) ??
    new URL(actorUrl).hostname;

  return {
    id: stableId("timeline-signal", externalId),
    actorId: stableId("signal-source", actorId),
    actorDisplayName: displayName.slice(0, 200),
    actorInitials: actorInitials(displayName),
    actorAvatarUrl: profileImageUrl(account, actorUrl),
    content,
    publishedAt: publishedDate,
  };
}

async function fetchMastodonJson(
  url: string,
  fetcher: ActivityPubFetcher,
): Promise<unknown> {
  const response = await fetcher(url, {
    headers: {
      accept: "application/json",
      "user-agent": "Cloud Forest alpha Signal reader",
    },
    redirect: "follow",
  });

  if (!response.ok) throw new HttpResponseError(response.status);
  return response.json();
}

async function readMastodonStatuses(
  source: string,
  fetcher: ActivityPubFetcher,
) {
  const parts = handleParts(source);
  if (parts === undefined) {
    throw new Error(
      "Mastodon Signal fallback requires a federated account handle.",
    );
  }

  const lookupUrl = new URL(`https://${parts.host}/api/v1/accounts/lookup`);
  lookupUrl.searchParams.set("acct", parts.username);
  const accountValue = await fetchMastodonJson(lookupUrl.toString(), fetcher);
  if (!isJsonObject(accountValue)) {
    throw new Error("Mastodon account lookup did not return an account.");
  }

  const accountId = stringValue(accountValue.id);
  if (accountId === undefined) {
    throw new Error("Mastodon account lookup did not return an account id.");
  }

  const actorId = stringValue(accountValue.uri) ?? accountId;
  const actorUrl =
    stringValue(accountValue.url) ?? `https://${parts.host}/@${parts.username}`;
  const statusesUrl = new URL(
    `https://${parts.host}/api/v1/accounts/${encodeURIComponent(accountId)}/statuses`,
  );
  statusesUrl.searchParams.set("limit", String(maximumImportedItems));
  statusesUrl.searchParams.set("exclude_replies", "true");
  statusesUrl.searchParams.set("exclude_reblogs", "true");

  const statusesValue = await fetchMastodonJson(
    statusesUrl.toString(),
    fetcher,
  );
  if (!Array.isArray(statusesValue)) {
    throw new Error("Mastodon statuses response was not an array.");
  }

  return statusesValue
    .map((status) =>
      parseMastodonStatus(status, accountValue, actorUrl, actorId),
    )
    .filter((item): item is NonNullable<typeof item> => item !== undefined)
    .sort(
      (first, second) =>
        second.publishedAt.getTime() - first.publishedAt.getTime(),
    )
    .slice(0, maximumImportedItems);
}

async function readOutboxPage(
  actor: JsonObject,
  actorUrl: string,
  fetcher: ActivityPubFetcher,
): Promise<JsonObject> {
  const outboxUrl = objectUrl(actor.outbox);
  if (outboxUrl === undefined) {
    throw new Error("ActivityPub actor did not provide an outbox.");
  }

  const outbox = await fetchJson(publicUrl(outboxUrl, actorUrl), fetcher);
  if (collectionItems(outbox).length > 0) return outbox;

  if (isJsonObject(outbox.first) && collectionItems(outbox.first).length > 0) {
    return outbox.first;
  }

  const firstPageUrl = objectUrl(outbox.first);
  if (firstPageUrl === undefined) return outbox;
  return fetchJson(publicUrl(firstPageUrl, actorUrl), fetcher);
}

export function createActivityPubSignalImporter({
  source,
  repository,
  fetcher = globalThis.fetch,
}: {
  source?: string;
  repository: TimelineItemRepository;
  fetcher?: ActivityPubFetcher;
}) {
  return {
    async sync(): Promise<void> {
      if (source === undefined || source.trim() === "") return;

      try {
        const actorUrl = await resolveSourceActor(source, fetcher);
        let actor: JsonObject;
        try {
          actor = await fetchJson(actorUrl, fetcher);
        } catch (error) {
          if (error instanceof HttpResponseError && error.status === 401) {
            // Some Mastodon instances require signed federation reads even for
            // public local accounts; their public read API is enough for alpha.
            const displayItems = await readMastodonStatuses(source, fetcher);
            await repository.insertSignalItems(displayItems);
            return;
          }
          throw error;
        }
        const actorId = objectId(actor.id) ?? actorUrl;
        const page = await readOutboxPage(actor, actorUrl, fetcher);
        const displayItems = collectionItems(page)
          .map((item) => parseSignalItem(item, actor, actorUrl, actorId))
          .filter((item): item is NonNullable<typeof item> => item !== undefined)
          .sort(
            (first, second) =>
              second.publishedAt.getTime() - first.publishedAt.getTime(),
          )
          .slice(0, maximumImportedItems);

        await repository.insertSignalItems(displayItems);
      } catch {
        // A failed refresh leaves already-imported Signal rows available.
      }
    },
  };
}
