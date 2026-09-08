import { fromNodeHeaders } from "better-auth/node";
import type { FastifyRequest } from "fastify";

import type { IdentityRepository } from "@cloud-forest/database";

export type CurrentPerson = {
  readonly userId: string;
  readonly personId: string;
};

export interface SessionApi {
  getSession(input: {
    headers: Headers;
  }): Promise<{ user: { id: string } } | null>;
  signOut(input: { headers: Headers }): Promise<unknown>;
}

export interface SessionResolver {
  resolve(request: FastifyRequest): Promise<CurrentPerson | null>;
  logout(request: FastifyRequest): Promise<void>;
}

export type SessionResolverOptions = {
  readonly developmentSession?: CurrentPerson;
};

export function createSessionResolver(
  authApi: SessionApi,
  identityRepository: IdentityRepository,
  options: SessionResolverOptions = {},
) {
  return {
    async resolve(request: FastifyRequest): Promise<CurrentPerson | null> {
      const session = await authApi.getSession({
        headers: fromNodeHeaders(request.headers),
      });
      if (session === null) return options.developmentSession ?? null;

      const personId = await identityRepository.findPersonIdForAccount(
        session.user.id,
      );
      return personId === null ? null : { userId: session.user.id, personId };
    },
    async logout(request: FastifyRequest): Promise<void> {
      const headers = fromNodeHeaders(request.headers);
      const session = await authApi.getSession({ headers });
      if (session === null && options.developmentSession !== undefined) return;
      await authApi.signOut({ headers });
    },
  };
}
