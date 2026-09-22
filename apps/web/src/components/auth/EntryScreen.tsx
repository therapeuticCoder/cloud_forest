import { Check, Eye, EyeOff, KeyRound } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import type { SignUpInput } from "@/app/sessionClient";
import { AuthLayout, AuthCard } from "./AuthLayout";

type UsernameCheck = {
  username: string;
  status: "available" | "taken" | "error";
} | null;

export function EntryScreen({
  message,
  onSignIn,
  onSignUp,
  onCheckUsername,
  pairingToken,
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
  pairingToken?: string | null;
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
  const hasPairingIntent = Boolean(pairingToken);

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
        title={
          hasPairingIntent
            ? "Continue to your connection"
            : mode === "login"
              ? "Enter Cloud Forest"
              : "Join Cloud Forest"
        }
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
          {hasPairingIntent
            ? mode === "login"
              ? "Sign in to continue to your pending Cloud Forest connection."
              : "Use the signup code from your Cloud Forest invitation to continue to your pending connection."
            : mode === "login"
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
