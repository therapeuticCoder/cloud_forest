import { randomBytes, randomUUID } from "node:crypto";

import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import Type from "typebox";

import { unauthorizedResponseSchema } from "@cloud-forest/api-contracts";
import type { IdentityRepository } from "@cloud-forest/database";

import type { AuthHandler } from "./auth.ts";
import type { SessionResolver } from "../sessionResolver.ts";

const signupCodeBody = Type.Object({
  code: Type.String({ minLength: 1, maxLength: 256 }),
  firstName: Type.String({ minLength: 1, maxLength: 100 }),
  lastName: Type.String({ minLength: 1, maxLength: 100 }),
  username: Type.String({ minLength: 3, maxLength: 30 }),
  password: Type.String({ minLength: 8, maxLength: 200 }),
});

const signupErrorSchema = Type.Object({
  apiVersion: Type.Literal("v1"),
  error: Type.Object({
    code: Type.Literal("SIGNUP_FAILED"),
    message: Type.String(),
  }),
});

const signupError = (message: string) => ({
  apiVersion: "v1" as const,
  error: { code: "SIGNUP_FAILED" as const, message },
});

const unauthorized = {
  apiVersion: "v1" as const,
  error: {
    code: "UNAUTHORIZED" as const,
    message: "A valid invited session is required." as const,
  },
};

const forbiddenResponseSchema = Type.Object({
  apiVersion: Type.Literal("v1"),
  error: Type.Object({
    code: Type.Literal("FORBIDDEN"),
    message: Type.String(),
  }),
});

const forbidden = {
  apiVersion: "v1" as const,
  error: {
    code: "FORBIDDEN" as const,
    message: "Only an admin can create signup codes." as const,
  },
};

class SignupCodeUnavailableError extends Error {
  constructor() {
    super("Signup code is unavailable.");
    this.name = "SignupCodeUnavailableError";
  }
}

function accountIdFromSignupResponse(body: string): string | null {
  try {
    const parsed: unknown = JSON.parse(body);
    if (typeof parsed !== "object" || parsed === null) return null;
    const user = (parsed as { user?: unknown }).user;
    if (typeof user !== "object" || user === null) return null;
    const id = (user as { id?: unknown }).id;
    return typeof id === "string" && id.length > 0 ? id : null;
  } catch {
    return null;
  }
}

export const signupRoutes: FastifyPluginAsyncTypebox<{
  authHandler: AuthHandler;
  identityRepository: IdentityRepository;
  sessionResolver: SessionResolver;
}> = async (server, options) => {
  server.post("/api/v1/signup", {
    schema: {
      operationId: "signupV1",
      tags: ["Signup"],
      body: signupCodeBody,
      response: {
        400: Type.Union([signupErrorSchema, Type.String()]),
        500: signupErrorSchema,
        200: Type.Unknown(),
      },
    },
    handler: async (request, reply) => {
      const firstName = request.body.firstName.trim();
      const lastName = request.body.lastName.trim();
      const displayName = `${firstName} ${lastName}`;
      if (!firstName || !lastName || displayName.length > 200) {
        return reply
          .status(400)
          .send(
            signupError(
              displayName.length > 200
                ? "Choose shorter first and last names."
                : "Enter your first and last name.",
            ),
          );
      }
      const username = request.body.username.trim().toLowerCase();
      const now = new Date();
      const personId = `person-${randomUUID()}`;
      let accountId: string | null = null;
      let accountCreated = false;

      try {
        const authHeaders = new Headers({
          "content-type": "application/json",
        });
        if (request.headers.cookie !== undefined) {
          authHeaders.set("cookie", request.headers.cookie);
        }
        if (request.headers.origin !== undefined) {
          authHeaders.set("origin", request.headers.origin);
        }
        if (request.headers.referer !== undefined) {
          authHeaders.set("referer", request.headers.referer);
        }
        const authResponse = await options.authHandler(
          new Request("http://127.0.0.1:3001/api/auth/sign-up/email", {
            method: "POST",
            headers: authHeaders,
            body: JSON.stringify({
              name: displayName,
              username,
              email: `${username}@cloudforest.local`,
              password: request.body.password,
            }),
          }),
        );
        const body = await authResponse.text();
        if (!authResponse.ok) return reply.status(400).send(body);
        accountCreated = true;

        accountId =
          accountIdFromSignupResponse(body) ??
          (await options.identityRepository.findAccountIdByUsername(username));
        if (accountId === null) {
          throw new Error(
            "Signup created an account without returning its id.",
          );
        }
        await options.identityRepository.createPersonForAccount({
          accountId,
          personId,
          displayName,
          now,
        });
        const consumed = await options.identityRepository.consumeSignupCode(
          request.body.code.trim(),
          now,
        );
        if (!consumed) throw new SignupCodeUnavailableError();

        authResponse.headers.forEach((value, key) => reply.header(key, value));
        return reply.status(200).send(body);
      } catch (error) {
        if (accountCreated) {
          try {
            await options.identityRepository.deleteAccountForSignup({
              accountId,
              personId,
              username,
            });
          } catch (cleanupError) {
            request.log.error(
              { err: cleanupError, accountId },
              "Signup cleanup failed",
            );
          }
        }
        if (error instanceof SignupCodeUnavailableError) {
          return reply
            .status(400)
            .send(
              signupError(
                "That signup code is invalid or has already been used.",
              ),
            );
        }
        request.log.error(
          { err: error },
          "Signup failed after account creation",
        );
        return reply
          .status(500)
          .send(
            signupError("Cloud Forest could not finish creating your account."),
          );
      }
    },
  });

  server.post("/api/v1/signup-codes", {
    schema: {
      operationId: "createSignupCodeV1",
      tags: ["Signup"],
      response: {
        401: unauthorizedResponseSchema,
        403: forbiddenResponseSchema,
        201: Type.Object({
          apiVersion: Type.Literal("v1"),
          data: Type.Object({ link: Type.String({ minLength: 1 }) }),
        }),
      },
    },
    handler: async (request, reply) => {
      const currentPerson = await options.sessionResolver.resolve(request);
      if (currentPerson === null) return reply.status(401).send(unauthorized);
      if (currentPerson.role !== "admin")
        return reply.status(403).send(forbidden);

      const code = randomBytes(18).toString("base64url");
      await options.identityRepository.createSignupCode({
        id: `signup-code-${randomUUID()}`,
        code,
        createdByUserId: currentPerson.userId,
        now: new Date(),
      });

      const requestOrigin = request.headers["x-cloud-forest-app-origin"];
      const origin =
        typeof requestOrigin === "string"
          ? requestOrigin
          : `http://${request.headers.host ?? "127.0.0.1:3001"}`;
      const link = new URL(origin);
      link.pathname = "/";
      link.search = new URLSearchParams({ signup: code }).toString();
      return reply.status(201).send({
        apiVersion: "v1" as const,
        data: { link: link.toString() },
      });
    },
  });
};
