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
import { getMealApologyStatement } from "@/data/careApologyStatements";
import { getMealGratitudeStatement } from "@/data/careGratitudeStatements";
import type { GiveCareOffer, ReceiveCareRequest } from "@/types/careRequest";

import { CareOfferCard } from "./CareOfferCard";
import { CareRequestCard } from "./CareRequestCard";
import {
  careOfferCategoryName,
  careRequestCategoryName,
  careScheduleLabel,
} from "./carePresentation";

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
  activeRequests: ReceiveCareRequest[];
  claimedRequests: ReceiveCareRequest[];
  completedRequests: ReceiveCareRequest[];
  notCompletedRequests: ReceiveCareRequest[];
  expiredRequests: ReceiveCareRequest[];
  offers: GiveCareOffer[];
  expiredOffers: GiveCareOffer[];
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
  initialTab = "receive",
  activeRequests,
  claimedRequests,
  completedRequests,
  notCompletedRequests,
  expiredRequests,
  offers,
  expiredOffers,
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
  const [activeTab, setActiveTab] = useState<MyCareTab>(initialTab);

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

  const historyItems = [
    ...completedRequests.map((request) => ({
      kind: "completed" as const,
      request,
      recordedAt: request.completedAt ?? request.claimedAt ?? request.createdAt,
    })),
    ...notCompletedRequests.map((request) => ({
      kind: "not-completed" as const,
      request,
      recordedAt:
        request.notCompletedAt ?? request.claimedAt ?? request.createdAt,
    })),
    ...expiredRequests.map((request) => ({
      kind: "expired-request" as const,
      request,
      recordedAt: request.expiredAt ?? request.createdAt,
    })),
    ...expiredOffers.map((offer) => ({
      kind: "expired-offer" as const,
      offer,
      recordedAt: offer.expiredAt ?? offer.createdAt,
    })),
  ].sort(
    (first, second) =>
      new Date(second.recordedAt).getTime() -
      new Date(first.recordedAt).getTime(),
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
                  onRecordNotCompleted={onRecordNotCompleted}
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
              <h2 id="history-heading">Care history</h2>
            </div>

            {historyItems.length > 0 ? (
              <ul className="my-care-history">
                {historyItems.map((item) => {
                  if (item.kind === "completed") {
                    const { request } = item;
                    const isRequester = request.requester.id === viewerId;
                    return (
                      <li key={`completed-${request.id}`}>
                        <div>
                          <span>Completed</span>
                          <strong>
                            {isRequester
                              ? `You received help from ${request.claimant?.displayName ?? "your helper"}`
                              : `You helped ${request.requester.displayName}`}
                          </strong>
                          <p>
                            {careRequestCategoryName(request)} ·{" "}
                            {careScheduleLabel({
                              days: request.days,
                              times: request.times,
                              timeNote: request.timeNote,
                              fallback: request.helpfulWhen,
                            })}
                          </p>
                          {request.gratitude ? (
                            <div className="my-care-history__gratitude">
                              <span>Private gratitude</span>
                              <p>
                                {getMealGratitudeStatement(
                                  request.gratitude.statementId,
                                )?.text ??
                                  "Thank you for showing up with care."}
                              </p>
                              {request.gratitude.message ? (
                                <blockquote>
                                  {request.gratitude.message}
                                </blockquote>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                        <time dateTime={item.recordedAt}>
                          {formatter.format(new Date(item.recordedAt))}
                        </time>
                      </li>
                    );
                  }

                  if (item.kind === "not-completed") {
                    const { request } = item;
                    const isRequester = request.requester.id === viewerId;
                    return (
                      <li key={`not-completed-${request.id}`}>
                        <div>
                          <span>Not completed</span>
                          <strong>
                            {isRequester
                              ? request.direction === "give"
                                ? `You received an offer from ${request.claimant?.displayName ?? "your care partner"}`
                                : `You requested care from ${request.claimant?.displayName ?? "your care partner"}`
                              : `You committed to help ${request.requester.displayName}`}
                          </strong>
                          <p>
                            {careRequestCategoryName(request)} ·{" "}
                            {careScheduleLabel({
                              days: request.days,
                              times: request.times,
                              timeNote: request.timeNote,
                              fallback: request.helpfulWhen,
                            })}
                          </p>
                          {request.apology ? (
                            <div className="my-care-history__apology">
                              <span>Private apology</span>
                              <p>
                                {getMealApologyStatement(
                                  request.apology.statementId,
                                )?.text ??
                                  "I’m sorry, I couldn’t complete this."}
                              </p>
                              {request.apology.message ? (
                                <blockquote>
                                  {request.apology.message}
                                </blockquote>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                        <time dateTime={item.recordedAt}>
                          {formatter.format(new Date(item.recordedAt))}
                        </time>
                      </li>
                    );
                  }

                  const recordedAt = item.recordedAt;
                  return (
                    <li
                      key={`${item.kind}-${item.kind === "expired-request" ? item.request.id : item.offer.id}`}
                    >
                      <div>
                        <span>Care opportunity passed</span>
                        <p>
                          {item.kind === "expired-request"
                            ? `${careRequestCategoryName(item.request)} · ${careScheduleLabel({ days: item.request.days, times: item.request.times, timeNote: item.request.timeNote, fallback: item.request.helpfulWhen })}`
                            : `${careOfferCategoryName(item.offer)} · ${careScheduleLabel({ days: item.offer.days, times: item.offer.times, timeNote: item.offer.timeNote, fallback: item.offer.availableWhen })}`}
                        </p>
                      </div>
                      <time dateTime={recordedAt}>
                        {formatter.format(new Date(recordedAt))}
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
