import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";

import type { DatabaseClient } from "@cloud-forest/database";
import * as schema from "@cloud-forest/database/schema";

export interface InvitedAuthOptions {
  sessionExpiresIn?: number;
}

export function createInvitedAuth(
  database: DatabaseClient,
  secret: string,
  options: InvitedAuthOptions = {},
) {
  return betterAuth({
    database: drizzleAdapter(database, {
      provider: "pg",
      schema,
      usePlural: true,
    }),
    secret,
    baseURL: "http://127.0.0.1:3001",
    emailAndPassword: { enabled: true, disableSignUp: true },
    session: { expiresIn: options.sessionExpiresIn ?? 60 * 60 * 24 * 7 },
  });
}
