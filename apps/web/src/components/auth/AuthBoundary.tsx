import { Check, Eye, EyeOff, KeyRound, Sprout } from "lucide-react";
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
import {
  defaultSessionClient,
  type SessionClient,
  type SignUpInput,
} from "@/app/sessionClient";

import "./auth-boundary.css";

type AuthBoundaryProps = {
  apiClient?: CuratedPersonApiClient;
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
    };

type UsernameCheck = {
  username: string;
  status: "available" | "taken" | "error";
} | null;

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
  onSignUp,
  onCheckUsername,
}: {
  message?: string;
  onSignIn: (
    identifier: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  onSignUp: (
    input: SignUpInput,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  onCheckUsername: (
    username: string,
  ) => Promise<
    { ok: true; available: boolean } | { ok: false; message: string }
  >;
}) {
  const codeId = useId();
  const firstNameId = useId();
  const lastNameId = useId();
  const identifierId = useId();
  const usernameId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const initialSignupCode =
    typeof window === "undefined"
      ? ""
      : (new URLSearchParams(window.location.search).get("signup") ?? "");
  const [mode, setMode] = useState<"login" | "signup">(
    initialSignupCode ? "signup" : "login",
  );
  const [code, setCode] = useState(initialSignupCode);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameCheck, setUsernameCheck] = useState<UsernameCheck>(null);
  const announcement = message;
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const normalizedUsername = username.trim();
  const usernameStatus =
    mode !== "signup" || normalizedUsername.length < 3
      ? "idle"
      : usernameCheck?.username === normalizedUsername
        ? usernameCheck.status
        : "checking";

  useEffect(() => {
    headingRef.current?.focus();
  }, [message]);

  useEffect(() => {
    if (mode !== "signup") return;
    if (normalizedUsername.length < 3) {
      return;
    }
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      void onCheckUsername(normalizedUsername).then((result) => {
        if (cancelled) return;
        setUsernameCheck({
          username: normalizedUsername,
          status: result.ok
            ? result.available
              ? "available"
              : "taken"
            : "error",
        });
        if (!result.ok) setError(result.message);
      });
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [mode, normalizedUsername, onCheckUsername]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(undefined);

    const result =
      mode === "login"
        ? await onSignIn(identifier.trim(), password)
        : usernameStatus !== "available"
          ? {
              ok: false as const,
              message:
                "Choose an available username before creating your account.",
            }
          : password !== confirmPassword
            ? {
                ok: false as const,
                message: "Your passwords do not match.",
              }
            : !firstName.trim() || !lastName.trim()
              ? {
                  ok: false as const,
                  message: "Enter your first and last name.",
                }
              : await onSignUp({
                  code: code.trim(),
                  firstName: firstName.trim(),
                  lastName: lastName.trim(),
                  username: username.trim(),
                  password,
                });
    if (!result.ok) setError(result.message);

    setPending(false);
  };

  return (
    <AuthLayout>
      <AuthCard
        headingRef={headingRef}
        icon={<KeyRound />}
        title={mode === "login" ? "Enter Cloud Forest" : "Join Cloud Forest"}
      >
        <div
          className="auth-boundary-tabs"
          role="tablist"
          aria-label="Account access"
        >
          <button
            aria-selected={mode === "login"}
            className="auth-boundary-tab"
            onClick={() => {
              setMode("login");
              setError(undefined);
            }}
            role="tab"
            type="button"
          >
            Log in
          </button>
          <button
            aria-selected={mode === "signup"}
            className="auth-boundary-tab"
            onClick={() => {
              setMode("signup");
              setError(undefined);
            }}
            role="tab"
            type="button"
          >
            Sign Up
          </button>
        </div>
        <p className="auth-boundary-lede">
          {mode === "login"
            ? "Use your invited Cloud Forest username or email and password."
            : "Use the signup code from your Cloud Forest invitation."}
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
          {mode === "signup" ? (
            <>
              <label htmlFor={codeId}>Signup code</label>
              <input
                autoComplete="off"
                id={codeId}
                name="signup-code"
                onChange={(event) => setCode(event.target.value)}
                required
                type="text"
                value={code}
              />
              <label htmlFor={firstNameId}>First name</label>
              <input
                autoComplete="given-name"
                id={firstNameId}
                name="first-name"
                onChange={(event) => setFirstName(event.target.value)}
                required
                type="text"
                value={firstName}
              />
              <label htmlFor={lastNameId}>Last name</label>
              <input
                autoComplete="family-name"
                id={lastNameId}
                name="last-name"
                onChange={(event) => setLastName(event.target.value)}
                required
                type="text"
                value={lastName}
              />
              <label htmlFor={usernameId}>Username</label>
              <input
                autoComplete="username"
                id={usernameId}
                name="username"
                onChange={(event) => setUsername(event.target.value)}
                required
                type="text"
                value={username}
              />
              {usernameStatus === "checking" ? (
                <p className="auth-boundary-field-status" role="status">
                  Checking username…
                </p>
              ) : usernameStatus === "available" ? (
                <p
                  className="auth-boundary-field-status auth-boundary-field-status--available"
                  role="status"
                >
                  Username is available.
                </p>
              ) : usernameStatus === "taken" ? (
                <p
                  className="auth-boundary-field-status auth-boundary-field-status--taken"
                  role="status"
                >
                  That username is already taken.
                </p>
              ) : null}
            </>
          ) : null}
          {mode === "login" ? (
            <>
              <label htmlFor={identifierId}>Email</label>
              <p className="auth-boundary-field-hint">
                Your username works here too.
              </p>
              <input
                autoComplete="username"
                id={identifierId}
                name="identifier"
                onChange={(event) => setIdentifier(event.target.value)}
                required
                type="text"
                value={identifier}
              />
            </>
          ) : null}
          <label htmlFor={passwordId}>Password</label>
          <div className="auth-boundary-password-field">
            <input
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              id={passwordId}
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type={showPassword ? "text" : "password"}
              value={password}
            />
            <button
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="auth-boundary-visibility-toggle"
              onClick={() => setShowPassword((shown) => !shown)}
              type="button"
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" />
              ) : (
                <Eye aria-hidden="true" />
              )}
            </button>
          </div>
          {mode === "signup" ? (
            <>
              <label htmlFor={confirmPasswordId}>Confirm password</label>
              <div className="auth-boundary-password-field">
                <input
                  autoComplete="new-password"
                  id={confirmPasswordId}
                  name="confirm-password"
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                />
                <button
                  aria-label={
                    showConfirmPassword
                      ? "Hide password confirmation"
                      : "Show password confirmation"
                  }
                  className="auth-boundary-visibility-toggle"
                  onClick={() => setShowConfirmPassword((shown) => !shown)}
                  type="button"
                >
                  {showConfirmPassword ? (
                    <EyeOff aria-hidden="true" />
                  ) : (
                    <Eye aria-hidden="true" />
                  )}
                </button>
              </div>
            </>
          ) : null}
          <button
            className="auth-boundary-primary"
            disabled={pending}
            type="submit"
          >
            {pending
              ? mode === "login"
                ? "Opening Cloud Forest…"
                : "Creating account…"
              : mode === "login"
                ? "Sign in"
                : "Create account"}
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
        displayName: result.value.data.displayName,
        role: result.value.data.role ?? "user",
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
    if (result.ok) {
      const url = new URL(window.location.href);
      url.searchParams.delete("view");
      window.history.replaceState(
        {},
        "",
        `${url.pathname}${url.search}${url.hash}`,
      );
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
    if (result.ok) await checkSession();
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
    return (
      <EntryScreen
        message={boundary.message}
        onCheckUsername={checkUsername}
        onSignIn={signIn}
        onSignUp={signUp}
      />
    );
  }

  return (
    <>
      <DashboardShell
        apiClient={apiClient}
        currentPersonId={boundary.currentPersonId}
        displayName={boundary.displayName}
        role={boundary.role}
        onCreateSignupCode={createSignupCode}
        onSignOut={() => void signOut()}
        signOutError={signOutError}
        signingOut={signingOut}
      />
      <PwaNotice />
    </>
  );
}
