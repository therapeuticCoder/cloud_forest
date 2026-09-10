import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";

import type { DatabaseClient } from "@cloud-forest/database";
import * as schema from "@cloud-forest/database/schema";

export interface InvitedAuthOptions {
  sessionExpiresIn?: number;
  allowSignUp?: boolean;
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
    emailAndPassword: {
      enabled: true,
      disableSignUp: !(options.allowSignUp ?? false),
    },
    plugins: [username({ displayUsername: false })],
    session: { expiresIn: options.sessionExpiresIn ?? 60 * 60 * 24 * 7 },
  });
}
