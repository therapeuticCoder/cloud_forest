import { useCallback, useEffect, useState } from "react";
import { EntryScreen } from "./EntryScreen";
import { LoadingScreen } from "./AuthLayout";

import {
  DashboardShell,
  type CareApiClient,
  type CuratedPersonApiClient,
} from "@/app/DashboardShell";
import { clearCuratedPeopleSnapshot } from "@/lib/curatedPeopleStorage";
import { clearTimelineItemSnapshot } from "@/lib/timelineItemStorage";
import {
  clearSessionSnapshot,
  loadSessionSnapshot,
  saveSessionSnapshot,
} from "@/lib/sessionSnapshotStorage";
import { PwaNotice } from "@/components/pwa/PwaNotice";
import {
  defaultSessionClient,
  type SessionClient,
  type SignUpInput,
} from "@/app/sessionClient";
import { rememberPendingConnectionPairing } from "@/lib/pendingConnectionPairing";

import "./auth-boundary.css";

type AuthBoundaryProps = {
  apiClient?: CuratedPersonApiClient;
  careApiClient?: CareApiClient;
  sessionClient?: SessionClient;
};

type BoundaryState =
  | { status: "checking" }
  | { status: "signed-out"; message?: string }
  | {
      status: "signed-in";
      currentPersonId: string;
      displayName: string;
      role: "admin" | "user";
      connection: "live" | "offline";
    };

function sessionErrorMessage(
  result: Exclude<
    Awaited<ReturnType<SessionClient["getCurrentSession"]>>,
    { ok: true }
  >,
  hasPairingIntent = false,
) {
  if (hasPairingIntent && result.kind === "http" && result.status === 401) {
    return undefined;
  }
  if (result.kind === "network") {
    return "Cloud Forest couldn’t confirm your session. Try again when you’re ready.";
  }
  if (result.status === 401) {
    return "Your Cloud Forest session has ended. Please sign in again.";
  }
  if (result.kind === "unexpected-response") {
    return "Cloud Forest is temporarily unavailable. Try again when you’re ready.";
  }
  return undefined;
}

export function AuthBoundary({
  apiClient,
  careApiClient,
  sessionClient = defaultSessionClient,
}: AuthBoundaryProps) {
  const pairingToken =
    typeof window === "undefined"
      ? null
      : new URL(window.location.href).searchParams.get("pairing");
  const [boundary, setBoundary] = useState<BoundaryState>({
    status: "checking",
  });
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string>();

  const checkSession = useCallback(async () => {
    const result = await sessionClient.getCurrentSession();
    if (result.ok) {
      const session = {
        currentPersonId: result.value.data.currentPersonId,
        displayName: result.value.data.displayName,
        role: result.value.data.role ?? "user",
      } as const;
      const previousSession = loadSessionSnapshot();
      if (
        previousSession &&
        previousSession.currentPersonId !== session.currentPersonId
      ) {
        clearCuratedPeopleSnapshot(previousSession.currentPersonId);
        clearTimelineItemSnapshot(previousSession.currentPersonId);
      }
      saveSessionSnapshot(session);
      setBoundary({
        status: "signed-in",
        ...session,
        connection: "live",
      });
      return;
    }

    if (
      result.kind === "network" ||
      (result.kind === "unexpected-response" && result.status >= 500)
    ) {
      const cachedSession = loadSessionSnapshot();
      if (cachedSession) {
        setBoundary({
          status: "signed-in",
          ...cachedSession,
          connection: "offline",
        });
        return;
      }

      setBoundary((current) =>
        current.status === "signed-in"
          ? { ...current, connection: "offline" }
          : {
              status: "signed-out",
              message: sessionErrorMessage(result, Boolean(pairingToken)),
            },
      );
      return;
    }

    const cachedSession = loadSessionSnapshot();
    if (cachedSession) {
      clearCuratedPeopleSnapshot(cachedSession.currentPersonId);
      clearTimelineItemSnapshot(cachedSession.currentPersonId);
    }
    clearSessionSnapshot();
    setBoundary({
      status: "signed-out",
      message: sessionErrorMessage(result, Boolean(pairingToken)),
    });
  }, [pairingToken, sessionClient]);

  useEffect(() => {
    const initialCheck = window.setTimeout(() => {
      void checkSession();
    }, 0);
    return () => window.clearTimeout(initialCheck);
  }, [checkSession]);

  useEffect(() => {
    const handleFocus = () => void checkSession();
    const handleOnline = () => void checkSession();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") void checkSession();
    };
    window.addEventListener("focus", handleFocus);
    window.addEventListener("online", handleOnline);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("online", handleOnline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkSession]);

  const signIn = async (email: string, password: string) => {
    const result = await sessionClient.signIn(email, password);
    if (result.ok) {
      const url = new URL(window.location.href);
      url.searchParams.delete("view");
      if (pairingToken) url.searchParams.delete("signup");
      window.history.replaceState(
        {},
        "",
        `${url.pathname}${url.search}${url.hash}`,
      );
      if (pairingToken) rememberPendingConnectionPairing(pairingToken, null);
      await checkSession();
    }
    return result;
  };

  const signUp = async (input: SignUpInput) => {
    if (sessionClient.signUp === undefined) {
      return {
        ok: false as const,
        message: "Signup is unavailable right now.",
      };
    }
    const result = await sessionClient.signUp(input);
    if (result.ok) {
      if (pairingToken) {
        const url = new URL(window.location.href);
        url.searchParams.delete("signup");
        window.history.replaceState(
          { ...window.history.state },
          "",
          `${url.pathname}${url.search}${url.hash}`,
        );
        rememberPendingConnectionPairing(pairingToken, null);
      }
      await checkSession();
    }
    return result;
  };

  const checkUsername = useCallback(
    async (username: string) => {
      if (sessionClient.checkUsername === undefined) {
        return {
          ok: false as const,
          message: "Username checking is unavailable right now.",
        };
      }
      return sessionClient.checkUsername(username);
    },
    [sessionClient],
  );

  const createSignupCode = useCallback(async () => {
    if (sessionClient.createSignupCode === undefined) {
      return {
        ok: false as const,
        message: "Signup codes are unavailable right now.",
      };
    }
    return sessionClient.createSignupCode();
  }, [sessionClient]);

  const signOut = async () => {
    setSigningOut(true);
    setSignOutError(undefined);
    const result = await sessionClient.logout();
    const clearLocalAccess = () => {
      if (boundary.status === "signed-in") {
        clearCuratedPeopleSnapshot(boundary.currentPersonId);
        clearTimelineItemSnapshot(boundary.currentPersonId);
      }
      clearSessionSnapshot();
    };

    if (result.ok || (result.kind === "http" && result.status === 401)) {
      clearLocalAccess();
      setBoundary({ status: "signed-out", message: "You’re signed out." });
    } else if (result.kind === "network") {
      clearLocalAccess();
      setBoundary({
        status: "signed-out",
        message:
          "You’re signed out on this device. Reconnect when you’re ready to end the server session.",
      });
    } else {
      setSignOutError(
        "Cloud Forest couldn’t end this session. Please try signing out again.",
      );
    }
    setSigningOut(false);
  };

  if (boundary.status === "checking") return <LoadingScreen />;
  if (boundary.status === "signed-out") {
    return (
      <>
        <EntryScreen
          message={boundary.message}
          onCheckUsername={checkUsername}
          onSignIn={signIn}
          onSignUp={signUp}
          pairingToken={pairingToken}
        />
        {pairingToken ? <PwaNotice /> : null}
      </>
    );
  }

  return (
    <>
      <DashboardShell
        key={boundary.currentPersonId}
        apiClient={apiClient}
        careApiClient={careApiClient}
        currentPersonId={boundary.currentPersonId}
        displayName={boundary.displayName}
        role={boundary.role}
        sessionOffline={boundary.connection === "offline"}
        onCreateSignupCode={createSignupCode}
        onSignOut={() => void signOut()}
        signOutError={signOutError}
        signingOut={signingOut}
      />
      <PwaNotice />
    </>
  );
}
