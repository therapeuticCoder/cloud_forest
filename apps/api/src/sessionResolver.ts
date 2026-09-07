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

export function createSessionResolver(
  authApi: SessionApi,
  identityRepository: IdentityRepository,
) {
  return {
    async resolve(request: FastifyRequest): Promise<CurrentPerson | null> {
      const session = await authApi.getSession({
        headers: fromNodeHeaders(request.headers),
      });
      if (session === null) return null;

      const personId = await identityRepository.findPersonIdForAccount(
        session.user.id,
      );
      return personId === null ? null : { userId: session.user.id, personId };
    },
    async logout(request: FastifyRequest): Promise<void> {
      await authApi.signOut({ headers: fromNodeHeaders(request.headers) });
    },
  };
}
