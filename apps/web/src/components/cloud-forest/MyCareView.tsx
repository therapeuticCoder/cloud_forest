import { ArrowLeft, Check, Copy, HandHeart, LogOut, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type {
  CareLifecycleState,
  ReceiveCareRequest,
} from "@/types/careRequest";

import { CareRequestCard } from "./CareRequestCard";

type MyCareViewProps = {
  activeRequests: ReceiveCareRequest[];
  careLifecycle: CareLifecycleState;
  claimedRequests: ReceiveCareRequest[];
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
  signOutError?: string;
  signingOut: boolean;
  viewerId: string;
};

export function MyCareView({
  activeRequests,
  careLifecycle,
  claimedRequests,
  onBack,
  isAdmin,
  onCreateSignupCode,
  onSignOut,
  onSetRequestMinimized,
  onRecordCompleted,
  onRecordNotCompleted,
  onWithdraw,
  signOutError,
  signingOut,
  viewerId,
}: MyCareViewProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [signupLink, setSignupLink] = useState<string>();
  const [signupCodeError, setSignupCodeError] = useState<string>();
  const [creatingSignupCode, setCreatingSignupCode] = useState(false);
  const [signupLinkCopied, setSignupLinkCopied] = useState(false);

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

      <div className="my-care-view__content">
        <section
          aria-labelledby="requests-heading"
          className="my-care-view__section"
        >
          <div className="my-care-view__section-heading">
            <Send aria-hidden="true" />
            <h2 id="requests-heading">My requests</h2>
          </div>

          {activeRequests.length > 0 ? (
            activeRequests.map((request) => {
              const claim = careLifecycle.claims.find(
                (candidate) => candidate.requestId === request.id,
              );
              return (
                <CareRequestCard
                  canPass={false}
                  claimed={Boolean(claim)}
                  key={request.id}
                  minimized={false}
                  onOfferHelp={() => undefined}
                  onPass={() => undefined}
                  onSetMinimized={onSetRequestMinimized}
                  onWithdraw={onWithdraw}
                  request={request}
                  viewerId={viewerId}
                  viewerIsClaimer={claim?.claimerId === viewerId}
                />
              );
            })
          ) : (
            <p className="my-care-view__empty">
              You don’t have an active care request right now.
            </p>
          )}
        </section>

        <section
          aria-labelledby="helping-heading"
          className="my-care-view__section"
        >
          <div className="my-care-view__section-heading">
            <HandHeart aria-hidden="true" />
            <h2
              data-my-care-section="commitments"
              id="helping-heading"
              tabIndex={-1}
            >
              I’m helping
            </h2>
          </div>

          {claimedRequests.length > 0 ? (
            claimedRequests.map((request) => {
              const viewerCompletion = careLifecycle.completions.find(
                (completion) =>
                  completion.requestId === request.id &&
                  completion.participantId === viewerId,
              );
              const otherParticipantCompleted = careLifecycle.completions.some(
                (completion) =>
                  completion.requestId === request.id &&
                  completion.participantId !== viewerId &&
                  completion.decision === "completed",
              );
              return (
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
                  otherParticipantCompleted={otherParticipantCompleted}
                  request={request}
                  viewerCompletion={viewerCompletion?.decision}
                  viewerId={viewerId}
                  viewerIsClaimer
                />
              );
            })
          ) : (
            <p className="my-care-view__empty">
              You’re not helping with any care requests right now.
            </p>
          )}
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
    </section>
  );
}
