import { selectMyCare } from "./careViews";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  Gift,
  HandHeart,
  LogOut,
  Send,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { getCareApologyStatement } from "@cloud-forest/domain";
import { getCareGratitudeStatement } from "@cloud-forest/domain";
import type { Care } from "@/types/care";

import { CareCard } from "./CareCard";
import { careCategoryName, careScheduleLabel } from "./carePresentation";

export type MyCareTab = "profile" | "receive" | "give" | "history";

const tabs: { id: MyCareTab; label: string; Icon: LucideIcon }[] = [
  { id: "profile", label: "Profile", Icon: UserRound },
  { id: "receive", label: "Receive", Icon: Send },
  { id: "give", label: "Give", Icon: Gift },
  { id: "history", label: "History", Icon: CheckCircle2 },
];

const formatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  day: "numeric",
  year: "numeric",
});

type MyCareViewProps = {
  initialTab?: MyCareTab;
  cares: Care[];
  viewerDisplayName: string;
  onBack: () => void;
  isAdmin: boolean;
  onCreateSignupCode: () => Promise<
    { ok: true; link: string } | { ok: false; message: string }
  >;
  onSignOut: () => void;
  onRecordCompleted?: (care: Care) => void;
  onRecordNotCompleted?: (care: Care) => void;
  onWithdraw?: (careId: string) => void;
  signOutError?: string;
  signingOut: boolean;
  viewerId: string;
};

export function MyCareView({
  initialTab = "receive",
  cares,
  viewerDisplayName,
  onBack,
  isAdmin,
  onCreateSignupCode,
  onSignOut,
  onRecordCompleted,
  onRecordNotCompleted,
  onWithdraw,
  signOutError,
  signingOut,
  viewerId,
}: MyCareViewProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [activeTab, setActiveTab] = useState<MyCareTab>(initialTab);
  const [signupLink, setSignupLink] = useState<string>();
  const [signupLinkCopied, setSignupLinkCopied] = useState(false);
  const [signupCodeError, setSignupCodeError] = useState<string>();
  const [creatingSignupCode, setCreatingSignupCode] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => headingRef.current?.focus());
  }, []);

  const copySignupLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setSignupLinkCopied(true);
    } catch {
      setSignupLinkCopied(false);
      setSignupCodeError(
        "The link is ready below, but it could not be copied automatically.",
      );
    }
  };

  const createSignupCode = async () => {
    setCreatingSignupCode(true);
    setSignupCodeError(undefined);
    const result = await onCreateSignupCode();
    if (result.ok) {
      setSignupLink(result.link);
      await copySignupLink(result.link);
    } else setSignupCodeError(result.message);
    setCreatingSignupCode(false);
  };

  const {
    receive: receiveCares,
    give: giveCares,
    helping: claimedReceiveCares,
    history,
  } = selectMyCare(cares, viewerId);

  const renderCareCard = (care: Care) => (
    <CareCard
      key={care.id}
      canPass={false}
      care={care}
      minimized={false}
      onRecordCompleted={onRecordCompleted}
      onRecordNotCompleted={onRecordNotCompleted}
      onWithdraw={onWithdraw}
      viewerId={viewerId}
    />
  );

  return (
    <section aria-label="My Care" className="my-care-view care-destination">
      <header className="my-care-view__header">
        <Button
          aria-label="Back"
          className="party-wizard__icon-button"
          onClick={onBack}
          size="icon-lg"
          type="button"
          variant="ghost"
        >
          <ArrowLeft aria-hidden="true" />
        </Button>
        <div>
          <h1 ref={headingRef} tabIndex={-1}>
            My Care
          </h1>
        </div>
      </header>
      <nav
        aria-label="My Care sections"
        className="my-care-view__tabs"
        role="tablist"
      >
        {tabs.map(({ Icon, id, label }) => (
          <button
            aria-controls={`my-care-panel-${id}`}
            aria-selected={activeTab === id}
            id={`my-care-tab-${id}`}
            key={id}
            onClick={() => setActiveTab(id)}
            role="tab"
            type="button"
          >
            <Icon aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>
      <div className="my-care-view__content">
        {activeTab === "profile" ? (
          <div
            aria-labelledby="my-care-tab-profile"
            className="my-care-view__tab-panel"
            id="my-care-panel-profile"
            role="tabpanel"
          >
            <section
              aria-labelledby="profile-heading"
              className="my-care-view__section"
            >
              <div className="my-care-view__section-heading">
                <UserRound aria-hidden="true" />
                <h2 id="profile-heading">Profile</h2>
              </div>
              <div className="my-care-profile">
                <span aria-hidden="true" className="my-care-profile__initials">
                  {viewerDisplayName
                    .trim()
                    .split(/\s+/)
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 3)
                    .toUpperCase()}
                </span>
                <div>
                  <strong>{viewerDisplayName}</strong>
                  <p>Your Cloud Forest account</p>
                </div>
              </div>
            </section>
            <section
              aria-label="Session management"
              className="my-care-view__section my-care-view__session"
            >
              {signOutError ? (
                <p className="my-care-view__session-error" role="alert">
                  {signOutError}
                </p>
              ) : null}
              <div className="my-care-view__session-actions">
                {isAdmin ? (
                  <button
                    className="my-care-view__signup-code-create"
                    disabled={creatingSignupCode}
                    onClick={() => void createSignupCode()}
                    type="button"
                  >
                    {creatingSignupCode
                      ? "Creating signup code…"
                      : "Create signup code"}
                  </button>
                ) : null}
                <button
                  className="my-care-view__signout"
                  disabled={signingOut}
                  onClick={onSignOut}
                  type="button"
                >
                  <LogOut aria-hidden="true" />
                  {signingOut ? "Signing out…" : "Sign out of Cloud Forest"}
                </button>
              </div>
              {isAdmin && signupLink ? (
                <div className="my-care-view__signup-link">
                  <label htmlFor="signup-link">Signup link</label>
                  <input id="signup-link" readOnly value={signupLink} />
                  <button
                    aria-label="Copy signup link"
                    onClick={() => void copySignupLink(signupLink)}
                    type="button"
                  >
                    {signupLinkCopied ? (
                      <Check aria-hidden="true" />
                    ) : (
                      <Copy aria-hidden="true" />
                    )}
                    {signupLinkCopied ? "Copied" : "Copy link"}
                  </button>
                </div>
              ) : null}
              {signupCodeError ? (
                <p className="my-care-view__session-error" role="alert">
                  {signupCodeError}
                </p>
              ) : null}
            </section>
          </div>
        ) : null}
        {activeTab === "receive" ? (
          <section
            aria-labelledby="receive-heading"
            className="my-care-view__section my-care-view__tab-panel"
            id="my-care-panel-receive"
            role="tabpanel"
          >
            <div className="my-care-view__section-heading">
              <Send aria-hidden="true" />
              <h2 id="receive-heading">My open Care to receive</h2>
            </div>
            {receiveCares.map(renderCareCard)}
            {receiveCares.length === 0 ? (
              <p className="my-care-view__empty">
                You don’t have active Care to receive right now.
              </p>
            ) : null}
          </section>
        ) : null}
        {activeTab === "give" ? (
          <div
            aria-labelledby="give-heading"
            className="my-care-view__tab-panel"
            id="my-care-panel-give"
            role="tabpanel"
          >
            <section
              aria-labelledby="give-heading"
              className="my-care-view__section"
            >
              <div className="my-care-view__section-heading">
                <Gift aria-hidden="true" />
                <h2 id="give-heading">My open Give Care</h2>
              </div>
              {giveCares.length > 0 ? (
                giveCares.map(renderCareCard)
              ) : (
                <p className="my-care-view__empty">
                  You don’t have an open Give Care right now.
                </p>
              )}
            </section>
            <section
              aria-labelledby="helping-heading"
              className="my-care-view__section"
            >
              <div className="my-care-view__section-heading">
                <HandHeart aria-hidden="true" />
                <h2 id="helping-heading">Care I’m part of</h2>
              </div>
              {claimedReceiveCares.length > 0 ? (
                claimedReceiveCares.map(renderCareCard)
              ) : (
                <p className="my-care-view__empty">
                  You’re not part of any active Care right now.
                </p>
              )}
            </section>
          </div>
        ) : null}
        {activeTab === "history" ? (
          <section
            aria-label="Private history"
            aria-labelledby="history-heading"
            className="my-care-view__section my-care-view__tab-panel"
            id="my-care-panel-history"
            role="tabpanel"
          >
            <div className="my-care-view__section-heading">
              <CheckCircle2 aria-hidden="true" />
              <h2 id="history-heading">Care history</h2>
            </div>
            {history.length > 0 ? (
              <ul className="my-care-history">
                {history.map(({ care, kind, at }) => {
                  const isOriginator = care.originator.id === viewerId;
                  return (
                    <li key={`${kind}-${care.id}`}>
                      <div>
                        <span>
                          {kind === "completed"
                            ? "Completed"
                            : kind === "not-completed"
                              ? "Not completed"
                              : "Care opportunity passed"}
                        </span>
                        <strong>
                          {isOriginator
                            ? care.direction === "give"
                              ? "You offered Care"
                              : "You requested Care"
                            : care.direction === "give"
                              ? `You received Care from ${care.originator.displayName}`
                              : `You helped ${care.originator.displayName}`}
                        </strong>
                        <p>
                          {careCategoryName(care.category)} ·{" "}
                          {careScheduleLabel({
                            days: care.days,
                            times: care.times,
                            timeNote: care.timeNote,
                            fallback: "Flexible",
                          })}
                        </p>
                        {care.gratitude ? (
                          <div className="my-care-history__gratitude">
                            <span>Private gratitude</span>
                            <p>
                              {getCareGratitudeStatement(
                                care.gratitude.statementId,
                              )?.text ?? "Thank you for showing up with care."}
                            </p>
                            {care.gratitude.message ? (
                              <blockquote>{care.gratitude.message}</blockquote>
                            ) : null}
                          </div>
                        ) : null}
                        {care.apology ? (
                          <div className="my-care-history__apology">
                            <span>Private apology</span>
                            <p>
                              {getCareApologyStatement(care.apology.statementId)
                                ?.text ??
                                "I’m sorry, I couldn’t complete this."}
                            </p>
                            {care.apology.message ? (
                              <blockquote>{care.apology.message}</blockquote>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                      <time dateTime={at}>
                        {formatter.format(new Date(at))}
                      </time>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="my-care-view__empty">
                No Care history to remember yet.
              </p>
            )}
          </section>
        ) : null}
      </div>
    </section>
  );
}
