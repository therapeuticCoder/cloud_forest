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
import { getMealGratitudeStatement } from "@/data/careGratitudeStatements";
import type { GiveCareOffer, ReceiveCareRequest } from "@/types/careRequest";

import { CareOfferCard } from "./CareOfferCard";
import { CareRequestCard } from "./CareRequestCard";

type MyCareTab = "profile" | "receive" | "give" | "history";

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
  activeRequests: ReceiveCareRequest[];
  claimedRequests: ReceiveCareRequest[];
  completedRequests: ReceiveCareRequest[];
  offers: GiveCareOffer[];
  careOfferStatusMessage?: string;
  viewerDisplayName: string;
  onBack: () => void;
  isAdmin: boolean;
  onCreateSignupCode: () => Promise<
    { ok: true; link: string } | { ok: false; message: string }
  >;
  onSignOut: () => void;
  onSetRequestMinimized?: (requestId: string, minimized: boolean) => void;
  onRecordCompleted?: (request: ReceiveCareRequest) => void;
  onRecordNotCompleted?: (request: ReceiveCareRequest) => void;
  onWithdraw?: (requestId: string) => void;
  onWithdrawOffer?: (offerId: string) => void;
  signOutError?: string;
  signingOut: boolean;
  viewerId: string;
};

export function MyCareView({
  activeRequests,
  claimedRequests,
  completedRequests,
  offers,
  careOfferStatusMessage,
  viewerDisplayName,
  onBack,
  isAdmin,
  onCreateSignupCode,
  onSignOut,
  onSetRequestMinimized,
  onRecordCompleted,
  onRecordNotCompleted,
  onWithdraw,
  onWithdrawOffer = () => undefined,
  signOutError,
  signingOut,
  viewerId,
}: MyCareViewProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [signupLink, setSignupLink] = useState<string>();
  const [signupCodeError, setSignupCodeError] = useState<string>();
  const [creatingSignupCode, setCreatingSignupCode] = useState(false);
  const [signupLinkCopied, setSignupLinkCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<MyCareTab>("receive");

  useEffect(() => {
    requestAnimationFrame(() => headingRef.current?.focus());
  }, []);

  const copySignupLink = async (link: string) => {
    try {
      if (navigator.clipboard === undefined) {
        throw new Error("Clipboard unavailable");
      }
      await navigator.clipboard.writeText(link);
      setSignupLinkCopied(true);
    } catch {
      setSignupLinkCopied(false);
      setSignupCodeError(
        "The link is ready below, but Cloud Forest could not copy it automatically.",
      );
    }
  };

  const createSignupCode = async () => {
    setCreatingSignupCode(true);
    setSignupCodeError(undefined);
    setSignupLinkCopied(false);
    const result = await onCreateSignupCode();
    if (result.ok) {
      setSignupLink(result.link);
      const signupCode = new URL(result.link).searchParams.get("signup");
      if (signupCode) {
        const url = new URL(window.location.href);
        url.searchParams.set("signup", signupCode);
        window.history.replaceState(
          { ...window.history.state },
          "",
          `${url.pathname}${url.search}${url.hash}`,
        );
      }
      await copySignupLink(result.link);
    } else {
      setSignupCodeError(result.message);
    }
    setCreatingSignupCode(false);
  };

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
              {isAdmin ? (
                <div className="my-care-view__signup-code">
                  {signupLink ? (
                    <div className="my-care-view__signup-link">
                      <label htmlFor="signup-link">Signup link</label>
                      <input id="signup-link" readOnly value={signupLink} />
                      <button
                        aria-label="Copy signup link"
                        className="my-care-view__signup-link-copy"
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
                </div>
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
              <h2 id="receive-heading">My open requests</h2>
            </div>

            {activeRequests.length > 0 ? (
              activeRequests.map((request) => (
                <CareRequestCard
                  canPass={false}
                  claimed={request.status === "claimed"}
                  key={request.id}
                  minimized={false}
                  onOfferHelp={() => undefined}
                  onPass={() => undefined}
                  onRecordCompleted={onRecordCompleted}
                  onSetMinimized={onSetRequestMinimized}
                  onWithdraw={onWithdraw}
                  request={request}
                  viewerId={viewerId}
                  viewerIsClaimer={false}
                />
              ))
            ) : (
              <p className="my-care-view__empty">
                You don’t have an active care request right now.
              </p>
            )}
          </section>
        ) : null}

        {activeTab === "give" ? (
          <div
            aria-labelledby="give-heading"
            className="my-care-view__tab-panel"
            id="my-care-panel-give"
            role="tabpanel"
          >
            {careOfferStatusMessage ? (
              <div
                aria-live="polite"
                className="timeline-remote-state"
                role="status"
              >
                {careOfferStatusMessage}
              </div>
            ) : null}
            <section
              aria-labelledby="give-heading"
              className="my-care-view__section"
            >
              <div className="my-care-view__section-heading">
                <Gift aria-hidden="true" />
                <h2 id="give-heading">My open offers</h2>
              </div>
              {offers.length > 0 ? (
                offers.map((offer) => (
                  <CareOfferCard
                    key={offer.id}
                    offer={offer}
                    onWithdraw={onWithdrawOffer}
                    viewerId={viewerId}
                  />
                ))
              ) : (
                <p className="my-care-view__empty">
                  You don’t have an open Give offer right now.
                </p>
              )}
            </section>

            <section
              aria-labelledby="helping-heading"
              className="my-care-view__section"
            >
              <div className="my-care-view__section-heading">
                <HandHeart aria-hidden="true" />
                <h2 id="helping-heading">Requests I'm taking care of</h2>
              </div>

              {claimedRequests.length > 0 ? (
                claimedRequests.map((request) => (
                  <CareRequestCard
                    canPass={false}
                    claimed
                    key={request.id}
                    minimized={false}
                    onOfferHelp={() => undefined}
                    onPass={() => undefined}
                    onRecordCompleted={onRecordCompleted}
                    onRecordNotCompleted={onRecordNotCompleted}
                    onSetMinimized={onSetRequestMinimized}
                    onWithdraw={() => undefined}
                    request={request}
                    viewerId={viewerId}
                    viewerIsClaimer
                  />
                ))
              ) : (
                <p className="my-care-view__empty">
                  You’re not helping with any care requests right now.
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
              <h2 id="history-heading">Completed Care</h2>
            </div>

            {completedRequests.length > 0 ? (
              <ul className="my-care-history">
                {completedRequests.map((request) => {
                  const isRequester = request.requester.id === viewerId;
                  const completedAt =
                    request.completedAt ??
                    request.claimedAt ??
                    request.createdAt;
                  return (
                    <li key={request.id}>
                      <div>
                        <span>Completed</span>
                        <strong>
                          {isRequester
                            ? `You received help from ${request.claimant?.displayName ?? "your helper"}`
                            : `You helped ${request.requester.displayName}`}
                        </strong>
                        <p>
                          {request.need} · {request.helpfulWhen}
                        </p>
                        {request.gratitude ? (
                          <div className="my-care-history__gratitude">
                            <span>Private gratitude</span>
                            <p>
                              {getMealGratitudeStatement(
                                request.gratitude.statementId,
                              )?.text ?? "Thank you for showing up with care."}
                            </p>
                            {request.gratitude.message ? (
                              <blockquote>
                                {request.gratitude.message}
                              </blockquote>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                      <time dateTime={completedAt}>
                        {formatter.format(new Date(completedAt))}
                      </time>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="my-care-view__empty">
                No completed Care to remember yet.
              </p>
            )}
          </section>
        ) : null}
      </div>
    </section>
  );
}
