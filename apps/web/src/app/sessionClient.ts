import {
  createApiClient,
  type CurrentSessionResult,
  type LogoutResult,
} from "@cloud-forest/api-client";

export type PasswordSignInResult =
  | { ok: true }
  | { ok: false; kind: "network" | "http"; message: string };

export interface SessionClient {
  getCurrentSession(): Promise<CurrentSessionResult>;
  signIn(email: string, password: string): Promise<PasswordSignInResult>;
  logout(): Promise<LogoutResult>;
}

const apiClient = createApiClient({
  baseUrl: "",
  fetch: (input, init) => globalThis.fetch(input, init),
});

export const defaultSessionClient: SessionClient = {
  getCurrentSession: () => apiClient.getCurrentSession(),
  logout: () => apiClient.logout(),
  async signIn(email, password) {
    try {
      const response = await globalThis.fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (response.ok) return { ok: true };

      return {
        ok: false,
        kind: "http",
        message: "That email and password combination wasn’t recognized.",
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
};
