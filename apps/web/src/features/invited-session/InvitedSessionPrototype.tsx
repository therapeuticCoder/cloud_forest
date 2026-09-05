import {
  Check,
  ChevronRight,
  Clock3,
  HandHeart,
  LogOut,
  Mail,
  Sprout,
  UserRound,
  X,
} from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";

import { DashboardShell } from "@/components/cloud-forest/DashboardShell";

import "./invited-session-prototype.css";

type PrototypeState =
  | "invitation"
  | "sign-in"
  | "link-sent"
  | "invitation-expired"
  | "invitation-used"
  | "signed-in"
  | "session-expired";

const RILEY_EMAIL = "riley.morgan@example.test";

const reviewStates: Array<{ label: string; state: PrototypeState }> = [
  { label: "Invitation", state: "invitation" },
  { label: "Sign in", state: "sign-in" },
  { label: "Link sent", state: "link-sent" },
  { label: "Expired invite", state: "invitation-expired" },
  { label: "Reused invite", state: "invitation-used" },
  { label: "Current person", state: "signed-in" },
  { label: "Session expired", state: "session-expired" },
];

function CloudForestMark() {
  return (
    <div className="invited-session-brand" aria-label="Cloud Forest">
      <span className="invited-session-brand-mark" aria-hidden="true">
        <Sprout />
      </span>
      <span>Cloud Forest</span>
    </div>
  );
}

function ReviewControls({
  activeState,
  onChange,
  onOpenChange,
  open,
}: {
  activeState: PrototypeState;
  onChange: (state: PrototypeState) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  return (
    <details
      className="invited-session-review"
      onToggle={(event) => onOpenChange(event.currentTarget.open)}
      open={open}
    >
      <summary>Fictional review states</summary>
      <div className="invited-session-review-list">
        {reviewStates.map(({ label, state }) => (
          <button
            aria-pressed={activeState === state}
            key={state}
            onClick={() => onChange(state)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
    </details>
  );
}

function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="invited-session-auth">
      <CloudForestMark />
      {children}
      <p className="invited-session-fictional-note">
        Fictional prototype · no account or session is created
      </p>
    </main>
  );
}

function AuthCard({
  children,
  compact = false,
  icon,
  title,
}: {
  children: ReactNode;
  compact?: boolean;
  icon: ReactNode;
  title: string;
}) {
  return (
    <section
      className={`invited-session-card${compact ? " invited-session-card--compact" : ""}`}
      aria-labelledby="session-title"
    >
      <span className="invited-session-card-icon" aria-hidden="true">
        {icon}
      </span>
      <h1 id="session-title" tabIndex={-1}>
        {title}
      </h1>
      {children}
    </section>
  );
}

function Invitation({ onContinue }: { onContinue: () => void }) {
  return (
    <AuthLayout>
      <AuthCard icon={<HandHeart />} title="You’re invited to Cloud Forest">
        <p className="invited-session-lede">
          This invitation is for <strong>{RILEY_EMAIL}</strong>.
        </p>
        <p>Cloud Forest is a private place to tend the people who matter.</p>
        <button
          className="invited-session-primary"
          onClick={onContinue}
          type="button"
        >
          Continue <ChevronRight aria-hidden="true" />
        </button>
        <button
          className="invited-session-text-button"
          onClick={onContinue}
          type="button"
        >
          Already joined? Sign in
        </button>
      </AuthCard>
    </AuthLayout>
  );
}

function SignIn({
  announcement,
  onSubmit,
}: {
  announcement?: string;
  onSubmit: (email: string) => void;
}) {
  const emailId = useId();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    if (typeof email === "string") {
      onSubmit(email);
    }
  };

  return (
    <AuthLayout>
      <AuthCard icon={<UserRound />} title="Sign in to Cloud Forest">
        <p>Use the email address that received your invitation.</p>
        {announcement ? (
          <p className="invited-session-announcement" role="status">
            <Check aria-hidden="true" /> {announcement}
          </p>
        ) : null}
        <form className="invited-session-form" onSubmit={submit}>
          <label htmlFor={emailId}>Email</label>
          <input
            autoComplete="email"
            defaultValue={RILEY_EMAIL}
            id={emailId}
            name="email"
            required
            type="email"
          />
          <button className="invited-session-primary" type="submit">
            Email me a sign-in link
          </button>
        </form>
        <p className="invited-session-footnote">
          Cloud Forest is invitation only.
        </p>
      </AuthCard>
    </AuthLayout>
  );
}

function LinkSent({
  email,
  onOpenFictionalLink,
  onUseDifferentEmail,
}: {
  email: string;
  onOpenFictionalLink: () => void;
  onUseDifferentEmail: () => void;
}) {
  return (
    <AuthLayout>
      <AuthCard icon={<Mail />} title="Check your email">
        <p>
          We sent a sign-in link to <strong>{email}</strong>.
        </p>
        <p>The link is only for you and expires soon.</p>
        <button
          className="invited-session-text-button"
          onClick={onUseDifferentEmail}
          type="button"
        >
          Use a different email
        </button>
      </AuthCard>
      <aside
        className="invited-session-review-action"
        aria-label="Review control"
      >
        <span>Outside the product surface</span>
        <button onClick={onOpenFictionalLink} type="button">
          Open fictional sign-in link
        </button>
      </aside>
    </AuthLayout>
  );
}

function InvalidInvitation({
  kind,
  onRequestNewInvitation,
  onSignIn,
}: {
  kind: "expired" | "used";
  onRequestNewInvitation: () => void;
  onSignIn: () => void;
}) {
  const expired = kind === "expired";
  return (
    <AuthLayout>
      <AuthCard
        compact
        icon={expired ? <Clock3 /> : <Check />}
        title={
          expired
            ? "This invitation has expired"
            : "This invitation was already used"
        }
      >
        <p>
          {expired
            ? "Ask for a new invitation when you’re ready."
            : "Sign in with the email address that accepted it."}
        </p>
        <button
          className="invited-session-primary"
          onClick={onSignIn}
          type="button"
        >
          Go to sign in
        </button>
        {expired ? (
          <button
            className="invited-session-text-button"
            onClick={onRequestNewInvitation}
            type="button"
          >
            Ask for a new invitation
          </button>
        ) : null}
      </AuthCard>
    </AuthLayout>
  );
}

function AccountSheet({
  onClose,
  onLogout,
  triggerRef,
}: {
  onClose: () => void;
  onLogout: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trigger = triggerRef.current;
    closeRef.current?.focus();
    return () => trigger?.focus();
  }, [triggerRef]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== "Tab") return;
    const focusable = sheetRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="invited-session-sheet-layer">
      <button
        aria-label="Close current person"
        className="invited-session-scrim"
        onClick={onClose}
        tabIndex={-1}
        type="button"
      />
      <div
        aria-labelledby="current-person-title"
        aria-modal="true"
        className="invited-session-sheet"
        onKeyDown={handleKeyDown}
        ref={sheetRef}
        role="dialog"
      >
        <button
          aria-label="Dismiss current person"
          className="invited-session-sheet-close"
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" />
        </button>
        <div className="invited-session-person-mark" aria-hidden="true">
          RM
        </div>
        <h2 id="current-person-title">Riley Morgan</h2>
        <p>{RILEY_EMAIL}</p>
        <div className="invited-session-sheet-rule" />
        <button
          className="invited-session-logout"
          onClick={onLogout}
          type="button"
        >
          <LogOut aria-hidden="true" /> Log out
        </button>
        <button
          className="invited-session-sheet-dismiss"
          onClick={onClose}
          ref={closeRef}
          type="button"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function SessionExpired({ onSignIn }: { onSignIn: () => void }) {
  return (
    <AuthLayout>
      <AuthCard compact icon={<Clock3 />} title="Your session ended">
        <p>Sign in again to return to Cloud Forest.</p>
        <button
          className="invited-session-primary"
          onClick={onSignIn}
          type="button"
        >
          Sign in again
        </button>
      </AuthCard>
    </AuthLayout>
  );
}

export function InvitedSessionPrototype() {
  const [activeState, setActiveState] = useState<PrototypeState>("invitation");
  const [accountOpen, setAccountOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(true);
  const [submittedEmail, setSubmittedEmail] = useState(RILEY_EMAIL);
  const [signInAnnouncement, setSignInAnnouncement] = useState<string>();
  const currentPersonTriggerRef = useRef<HTMLButtonElement>(null);

  const changeState = (nextState: PrototypeState) => {
    setAccountOpen(false);
    setReviewOpen(nextState !== "signed-in");
    setSignInAnnouncement(undefined);
    setActiveState(nextState);
  };

  useEffect(() => {
    if (activeState === "signed-in") {
      currentPersonTriggerRef.current?.focus();
      return;
    }
    document.querySelector<HTMLElement>("#session-title")?.focus();
  }, [activeState]);

  const logout = () => {
    setAccountOpen(false);
    setSignInAnnouncement("You’re signed out.");
    setActiveState("sign-in");
  };

  let content: ReactNode;
  switch (activeState) {
    case "invitation":
      content = <Invitation onContinue={() => changeState("sign-in")} />;
      break;
    case "sign-in":
      content = (
        <SignIn
          announcement={signInAnnouncement}
          onSubmit={(email) => {
            setSubmittedEmail(email);
            changeState("link-sent");
          }}
        />
      );
      break;
    case "link-sent":
      content = (
        <LinkSent
          email={submittedEmail}
          onOpenFictionalLink={() => changeState("signed-in")}
          onUseDifferentEmail={() => changeState("sign-in")}
        />
      );
      break;
    case "invitation-expired":
      content = (
        <InvalidInvitation
          kind="expired"
          onRequestNewInvitation={() => changeState("invitation")}
          onSignIn={() => changeState("sign-in")}
        />
      );
      break;
    case "invitation-used":
      content = (
        <InvalidInvitation
          kind="used"
          onRequestNewInvitation={() => changeState("invitation")}
          onSignIn={() => changeState("sign-in")}
        />
      );
      break;
    case "session-expired":
      content = <SessionExpired onSignIn={() => changeState("sign-in")} />;
      break;
    case "signed-in":
      content = (
        <div className="invited-session-dashboard">
          <div aria-hidden={accountOpen} inert={accountOpen ? true : undefined}>
            <DashboardShell
              currentPersonControl={{
                ariaLabel: "Open current person",
                initials: "RM",
                onOpen: () => setAccountOpen(true),
                personId: "riley-morgan",
                triggerRef: currentPersonTriggerRef,
              }}
            />
          </div>
          {accountOpen ? (
            <AccountSheet
              onClose={() => setAccountOpen(false)}
              onLogout={logout}
              triggerRef={currentPersonTriggerRef}
            />
          ) : null}
        </div>
      );
      break;
  }

  return (
    <div
      className="invited-session-prototype"
      data-prototype-state={activeState}
    >
      {content}
      <ReviewControls
        activeState={activeState}
        onChange={changeState}
        onOpenChange={setReviewOpen}
        open={reviewOpen}
      />
    </div>
  );
}
