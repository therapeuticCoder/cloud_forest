import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";

import type { DatabaseClient } from "@cloud-forest/database";
import * as schema from "@cloud-forest/database/schema";

export interface LocalMagicLinkDelivery {
  deliver(link: {
    email: string;
    token: string;
    url: string;
  }): Promise<void> | void;
}

export interface InvitedAuthOptions {
  sessionExpiresIn?: number;
}

export function createInvitedAuth(
  database: DatabaseClient,
  secret: string,
  delivery?: LocalMagicLinkDelivery,
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
    plugins: [
      magicLink({
        disableSignUp: true,
        expiresIn: 300,
        storeToken: "hashed",
        // Production delivery is intentionally absent. Local/test callers use
        // the server API with a deterministic test delivery seam.
        async sendMagicLink(link) {
          await delivery?.deliver(link);
        },
      }),
    ],
    session: { expiresIn: options.sessionExpiresIn ?? 60 * 60 * 24 * 7 },
  });
}
