import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";

import type { DatabaseClient } from "@cloud-forest/database";
import * as schema from "@cloud-forest/database/schema";

const authAllowedHosts = (
  process.env.BETTER_AUTH_ALLOWED_HOSTS ??
  "scollinsstudio.tail7ad917.ts.net,127.0.0.1,localhost"
)
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);
const authFallbackUrl = process.env.BETTER_AUTH_URL ?? "http://127.0.0.1:3001";

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
    baseURL: {
      allowedHosts: authAllowedHosts,
      fallback: authFallbackUrl,
      protocol: "auto",
    },
    emailAndPassword: {
      enabled: true,
      disableSignUp: !(options.allowSignUp ?? false),
    },
    plugins: [username({ displayUsername: false })],
    session: { expiresIn: options.sessionExpiresIn ?? 60 * 60 * 24 * 7 },
  });
}
