import { Check, KeyRound, Sprout } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
  type RefObject,
} from "react";

import {
  DashboardShell,
  type CuratedPersonApiClient,
} from "@/components/cloud-forest/DashboardShell";
import { PwaNotice } from "@/components/pwa/PwaNotice";
import { defaultSessionClient, type SessionClient } from "@/app/sessionClient";

import "./auth-boundary.css";

type AuthBoundaryProps = {
  apiClient?: CuratedPersonApiClient;
  sessionClient?: SessionClient;
};

type BoundaryState =
  | { status: "checking" }
  | { status: "signed-out"; message?: string }
  | { status: "signed-in"; currentPersonId: string };

function CloudForestMark() {
  return (
    <div className="auth-boundary-brand" aria-label="Cloud Forest">
      <span className="auth-boundary-brand-mark" aria-hidden="true">
        <Sprout />
      </span>
      <span>Cloud Forest</span>
    </div>
  );
}

function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth-boundary-entry">
      <CloudForestMark />
      {children}
      <p className="auth-boundary-footnote">Cloud Forest is invitation only.</p>
    </main>
  );
}

function AuthCard({
  children,
  headingRef,
  icon,
  title,
}: {
  children: ReactNode;
  headingRef?: RefObject<HTMLHeadingElement | null>;
  icon: ReactNode;
  title: string;
}) {
  const titleId = useId();

  return (
    <section className="auth-boundary-card" aria-labelledby={titleId}>
      <span className="auth-boundary-card-icon" aria-hidden="true">
        {icon}
      </span>
      <h1 id={titleId} ref={headingRef} tabIndex={-1}>
        {title}
      </h1>
      {children}
    </section>
  );
}

function EntryScreen({
  message,
  onSignIn,
}: {
  message?: string;
  onSignIn: (
    email: string,
    password: string,
  ) => Promise<
    | {
        ok: true;
      }
    | { ok: false; message: string }
  >;
}) {
  const emailId = useId();
  const passwordId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const announcement = message;
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    headingRef.current?.focus();
  }, [message]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(undefined);

    const result = await onSignIn(email.trim(), password);
    if (!result.ok) setError(result.message);

    setPending(false);
  };

  return (
    <AuthLayout>
      <AuthCard
        headingRef={headingRef}
        icon={<KeyRound />}
        title="Enter Cloud Forest"
      >
        <p className="auth-boundary-lede">
          Use your invited Cloud Forest account email and password.
        </p>
        {announcement ? (
          <p className="auth-boundary-announcement" role="status">
            <Check aria-hidden="true" /> {announcement}
          </p>
        ) : null}
        {error ? (
          <p className="auth-boundary-error" role="alert">
            {error}
          </p>
        ) : null}
        <form className="auth-boundary-form" onSubmit={submit}>
          <label htmlFor={emailId}>Email</label>
          <input
            autoComplete="email"
            id={emailId}
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
          <label htmlFor={passwordId}>Password</label>
          <input
            autoComplete="current-password"
            id={passwordId}
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
          <button
            className="auth-boundary-primary"
            disabled={pending}
            type="submit"
          >
            {pending ? "Opening Cloud Forest…" : "Sign in"}
          </button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}

function LoadingScreen() {
  return (
    <AuthLayout>
      <AuthCard icon={<Sprout />} title="Opening Cloud Forest">
        <p>Checking your Cloud Forest session.</p>
      </AuthCard>
    </AuthLayout>
  );
}

function sessionErrorMessage(
  result: Exclude<
    Awaited<ReturnType<SessionClient["getCurrentSession"]>>,
    { ok: true }
  >,
) {
  if (result.kind === "network") {
    return "Cloud Forest couldn’t confirm your session. Try again when you’re ready.";
  }
  if (result.kind === "unexpected-response") {
    return "Cloud Forest couldn’t confirm your session. Enter your email and password again.";
  }
  return undefined;
}

export function AuthBoundary({
  apiClient,
  sessionClient = defaultSessionClient,
}: AuthBoundaryProps) {
  const [boundary, setBoundary] = useState<BoundaryState>({
    status: "checking",
  });
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string>();

  const checkSession = useCallback(async () => {
    const result = await sessionClient.getCurrentSession();
    if (result.ok) {
      setBoundary({
        status: "signed-in",
        currentPersonId: result.value.data.currentPersonId,
      });
    } else {
      setBoundary({
        status: "signed-out",
        message: sessionErrorMessage(result),
      });
    }
  }, [sessionClient]);

  useEffect(() => {
    const initialCheck = window.setTimeout(() => {
      void checkSession();
    }, 0);
    return () => window.clearTimeout(initialCheck);
  }, [checkSession]);

  useEffect(() => {
    const handleFocus = () => void checkSession();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") void checkSession();
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkSession]);

  const signIn = async (email: string, password: string) => {
    const result = await sessionClient.signIn(email, password);
    if (result.ok) await checkSession();
    return result;
  };

  const signOut = async () => {
    setSigningOut(true);
    setSignOutError(undefined);
    const result = await sessionClient.logout();
    if (result.ok || (result.kind === "http" && result.status === 401)) {
      setBoundary({ status: "signed-out", message: "You’re signed out." });
    } else {
      setSignOutError(
        "Cloud Forest couldn’t end this session. Please try signing out again.",
      );
    }
    setSigningOut(false);
  };

  if (boundary.status === "checking") return <LoadingScreen />;
  if (boundary.status === "signed-out") {
    return <EntryScreen message={boundary.message} onSignIn={signIn} />;
  }

  return (
    <>
      <DashboardShell
        apiClient={apiClient}
        onSignOut={() => void signOut()}
        signOutError={signOutError}
        signingOut={signingOut}
      />
      <PwaNotice />
    </>
  );
}
