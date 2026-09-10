import {
  createApiClient,
  type CurrentSessionResult,
  type LogoutResult,
} from "@cloud-forest/api-client";

export type PasswordSignInResult =
  | { ok: true }
  | { ok: false; kind: "network" | "http"; message: string };

export type UsernameAvailabilityResult =
  | { ok: true; available: boolean }
  | { ok: false; kind: "network" | "http"; message: string };

export type SignUpResult =
  | { ok: true }
  | { ok: false; kind: "network" | "http"; message: string };

export type CreateSignupCodeResult =
  | { ok: true; link: string }
  | { ok: false; kind: "network" | "http"; message: string };

export interface SessionClient {
  getCurrentSession(): Promise<CurrentSessionResult>;
  signIn(identifier: string, password: string): Promise<PasswordSignInResult>;
  checkUsername?(username: string): Promise<UsernameAvailabilityResult>;
  signUp?(
    code: string,
    username: string,
    password: string,
  ): Promise<SignUpResult>;
  createSignupCode?(): Promise<CreateSignupCodeResult>;
  logout(): Promise<LogoutResult>;
}

const apiClient = createApiClient({
  baseUrl: "",
  fetch: (input, init) => globalThis.fetch(input, init),
});

export const defaultSessionClient: SessionClient = {
  getCurrentSession: () => apiClient.getCurrentSession(),
  logout: () => apiClient.logout(),
  async signIn(identifier, password) {
    try {
      const isEmail = identifier.includes("@");
      const response = await globalThis.fetch(
        isEmail ? "/api/auth/sign-in/email" : "/api/auth/sign-in/username",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            ...(isEmail ? { email: identifier } : { username: identifier }),
            password,
          }),
        },
      );

      if (response.ok) return { ok: true };

      return {
        ok: false,
        kind: "http",
        message:
          "That username or email and password combination wasn’t recognized.",
      };
    } catch {
      return {
        ok: false,
        kind: "network",
        message:
          "Cloud Forest couldn’t reach the sign-in service. Try again when you’re ready.",
      };
    }
  },
  async checkUsername(username) {
    try {
      const response = await globalThis.fetch(
        "/api/auth/is-username-available",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ username }),
        },
      );
      const body = (await response.json().catch(() => null)) as {
        available?: unknown;
      } | null;
      if (response.ok && typeof body?.available === "boolean") {
        return { ok: true, available: body.available };
      }
      return {
        ok: false,
        kind: "http",
        message: "Cloud Forest couldn’t check that username right now.",
      };
    } catch {
      return {
        ok: false,
        kind: "network",
        message:
          "Cloud Forest couldn’t reach the username check. Try again when you’re ready.",
      };
    }
  },
  async signUp(code, username, password) {
    try {
      const response = await globalThis.fetch("/api/v1/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code, username, password }),
      });
      if (response.ok) return { ok: true };
      const body = (await response.json().catch(() => null)) as {
        error?: { message?: unknown };
        message?: unknown;
      } | null;
      const message =
        typeof body?.error?.message === "string"
          ? body.error.message
          : typeof body?.message === "string"
            ? body.message
            : response.status === 409 || response.status === 422
              ? "That username is already taken. Choose another one."
              : "Cloud Forest couldn’t create that account. Check your signup code and try again.";
      return { ok: false, kind: "http", message };
    } catch {
      return {
        ok: false,
        kind: "network",
        message:
          "Cloud Forest couldn’t reach the signup service. Try again when you’re ready.",
      };
    }
  },
  async createSignupCode() {
    try {
      const response = await globalThis.fetch("/api/v1/signup-codes", {
        method: "POST",
        headers: {
          accept: "application/json",
          "x-cloud-forest-app-origin": window.location.origin,
        },
        credentials: "include",
      });
      const body = (await response.json().catch(() => null)) as {
        data?: { link?: unknown };
        error?: { message?: unknown };
      } | null;
      if (response.ok && typeof body?.data?.link === "string") {
        return { ok: true, link: body.data.link };
      }
      return {
        ok: false,
        kind: "http",
        message:
          typeof body?.error?.message === "string"
            ? body.error.message
            : "Cloud Forest couldn’t create a signup code.",
      };
    } catch {
      return {
        ok: false,
        kind: "network",
        message:
          "Cloud Forest couldn’t reach the signup-code service. Try again when you’re ready.",
      };
    }
  },
};
