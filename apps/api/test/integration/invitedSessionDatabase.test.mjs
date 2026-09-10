import assert from "node:assert/strict";
import process from "node:process";
import test from "node:test";

import { hashPassword } from "better-auth/crypto";
import {
  accountPeople,
  accounts,
  createDatabaseClient,
  createIdentityRepository,
  getTestDatabaseUrl,
  invitations,
  people,
  users,
} from "@cloud-forest/database";

import { createInvitedAuth } from "../../src/auth.ts";
import { buildApi } from "../../src/app.ts";
import { createSessionResolver } from "../../src/sessionResolver.ts";

const now = new Date("2026-09-06T18:00:00.000Z");
const password = "cloud-forest-local-password";
const ids = {
  account: "account-fictional-river",
  credentialAccount: "credential-account-fictional-river",
  person: "person-fictional-river",
  invitation: "invite-fictional-river",
};

test("an invited password account resolves its session and expires", async (t) => {
  const { database, pool } = createDatabaseClient(
    getTestDatabaseUrl(process.env),
  );
  const auth = createInvitedAuth(
    database,
    "fictional-test-secret-with-at-least-32-characters",
  );
  const server = buildApi({
    sessionResolver: createSessionResolver(
      auth.api,
      createIdentityRepository(database),
    ),
  });
  t.after(async () => {
    await server.close();
    await database.delete(invitations);
    await database.delete(accounts);
    await database.delete(accountPeople);
    await database.delete(users);
    await database.delete(people);
    await pool.end();
  });

  await database.delete(invitations);
  await database.delete(accounts);
  await database.delete(accountPeople);
  await database.delete(users);
  await database.delete(people);

  await database.insert(people).values({ id: ids.person, createdAt: now });
  await database.insert(users).values({
    id: ids.account,
    name: "River Tester",
    email: "river@example.test",
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
  });
  await database.insert(accounts).values({
    id: ids.credentialAccount,
    accountId: ids.account,
    providerId: "credential",
    userId: ids.account,
    password: await hashPassword(password),
    createdAt: now,
    updatedAt: now,
  });
  await database.insert(accountPeople).values({
    accountId: ids.account,
    personId: ids.person,
    createdAt: now,
  });
  await database.insert(invitations).values({
    id: ids.invitation,
    email: "river@example.test",
    personId: ids.person,
    createdAt: now,
    expiresAt: new Date("2030-01-01T00:00:00.000Z"),
  });

  const signIn = await auth.handler(
    new Request("http://127.0.0.1:3001/api/auth/sign-in/email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "river@example.test", password }),
    }),
  );
  assert.equal(signIn.status, 200);
  const sessionCookie = signIn.headers.get("set-cookie");
  assert.ok(sessionCookie);

  const active = await server.inject({
    method: "GET",
    url: "/api/v1/session",
    headers: { cookie: sessionCookie },
  });
  assert.equal(active.statusCode, 200);
  assert.deepEqual(active.json(), {
    apiVersion: "v1",
    data: {
      currentPersonId: ids.person,
      displayName: "River Tester",
      role: "user",
    },
  });

  const wrongPassword = await auth.handler(
    new Request("http://127.0.0.1:3001/api/auth/sign-in/email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "river@example.test",
        password: "not-the-password",
      }),
    }),
  );
  assert.equal(wrongPassword.status, 401);

  const expiredAuth = createInvitedAuth(
    database,
    "fictional-test-secret-with-at-least-32-characters",
    { sessionExpiresIn: -1 },
  );
  const expiredSignIn = await expiredAuth.handler(
    new Request("http://127.0.0.1:3001/api/auth/sign-in/email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "river@example.test", password }),
    }),
  );
  const expiredSessionCookie = expiredSignIn.headers.get("set-cookie");
  assert.ok(expiredSessionCookie);
  const expiredServer = buildApi({
    sessionResolver: createSessionResolver(
      expiredAuth.api,
      createIdentityRepository(database),
    ),
  });
  t.after(() => expiredServer.close());
  const expired = await expiredServer.inject({
    method: "GET",
    url: "/api/v1/session",
    headers: { cookie: expiredSessionCookie },
  });
  assert.equal(expired.statusCode, 401);
});

test("invitation consumption is atomic and rejects expiry, revocation, and reuse", async (t) => {
  const { database, pool } = createDatabaseClient(
    getTestDatabaseUrl(process.env),
  );
  const repository = createIdentityRepository(database);
  t.after(async () => {
    await database.delete(invitations);
    await database.delete(people);
    await pool.end();
  });
  await database.delete(invitations);
  await database.delete(people);
  await database.insert(people).values({ id: ids.person, createdAt: now });
  await database.insert(invitations).values({
    id: ids.invitation,
    email: "river@example.test",
    personId: ids.person,
    createdAt: now,
    expiresAt: new Date("2030-01-01T00:00:00.000Z"),
  });
  const results = await Promise.all([
    repository.consumeInvitation(ids.invitation, now),
    repository.consumeInvitation(ids.invitation, now),
  ]);
  assert.deepEqual(results.sort(), [false, true]);
  await database.insert(invitations).values([
    {
      id: "invite-fictional-expired",
      email: "expired@example.test",
      personId: ids.person,
      createdAt: now,
      expiresAt: new Date("2020-01-01T00:00:00.000Z"),
    },
    {
      id: "invite-fictional-revoked",
      email: "revoked@example.test",
      personId: ids.person,
      createdAt: now,
      expiresAt: new Date("2030-01-01T00:00:00.000Z"),
      revokedAt: now,
    },
  ]);
  assert.equal(
    await repository.consumeInvitation("invite-fictional-expired", now),
    false,
  );
  assert.equal(
    await repository.consumeInvitation("invite-fictional-revoked", now),
    false,
  );
});
