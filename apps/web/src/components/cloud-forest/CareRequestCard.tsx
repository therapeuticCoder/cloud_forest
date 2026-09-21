import { HandHeart, HeartHandshake, Network } from "lucide-react";
import { useEffect, useRef } from "react";

import type {
  CareCompletionDecision,
  CarePersonId,
  ReceiveCareRequest,
} from "@/types/careRequest";
import { getMealGratitudeStatement } from "@/data/careGratitudeStatements";
import { careRequestCategoryName, careScheduleLabel } from "./carePresentation";

const formatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  day: "numeric",
});

export function CareRequestCard({
  claimed,
  canPass,
  minimized,
  onOfferHelp,
  onRecordCompleted,
  onRecordNotCompleted,
  onPass,
  onSetMinimized,
  onWithdraw,
  request,
  viewerId,
  viewerCompletion,
  viewerIsClaimer,
  otherParticipantCompleted,
}: {
  claimed: boolean;
  canPass: boolean;
  minimized: boolean;
  onOfferHelp: (request: ReceiveCareRequest) => void;
  onPass?: (request: ReceiveCareRequest) => void;
  onRecordCompleted?: (request: ReceiveCareRequest) => void;
  onRecordNotCompleted?: (request: ReceiveCareRequest) => void;
  onSetMinimized?: (requestId: string, minimized: boolean) => void;
  onWithdraw?: (requestId: string) => void;
  request: ReceiveCareRequest;
  viewerId: CarePersonId;
  viewerCompletion?: CareCompletionDecision;
  viewerIsClaimer: boolean;
  otherParticipantCompleted?: boolean;
}) {
  const isSelfAuthored = request.requester.id === viewerId;
  const durableViewerCompletion = isSelfAuthored
    ? request.requesterCompletedAt
    : request.claimant?.id === viewerId
      ? request.claimantCompletedAt
      : undefined;
  const durableOtherParticipantCompleted = isSelfAuthored
    ? request.claimantCompletedAt !== undefined
    : request.requesterCompletedAt !== undefined;
  const effectiveViewerCompletion =
    viewerCompletion ??
    (durableViewerCompletion !== undefined ? "completed" : undefined);
  const effectiveOtherParticipantCompleted =
    otherParticipantCompleted ?? durableOtherParticipantCompleted;
  const requesterFirstName = request.requester.displayName.split(" ")[0];
  const categoryName = careRequestCategoryName(request);
  const categoryLabel = categoryName.toLowerCase();
  const schedule = careScheduleLabel({
    days: request.days,
    times: request.times,
    timeNote: request.timeNote,
    fallback: request.helpfulWhen,
  });
  const requirements = request.requirements ?? request.foodWorks;
  const sensitivities = request.sensitivities ?? request.foodDoesNotWork;
  const location = request.location ?? request.handoffStyle;
  const presentationButtonRef = useRef<HTMLButtonElement>(null);
  const restorePresentationFocusRef = useRef(false);
  const articleLabel = isSelfAuthored
    ? claimed
      ? `Claimed ${categoryLabel} care request`
      : `Open ${categoryLabel} care request`
    : `Incoming ${categoryLabel} care request from ${request.requester.displayName}`;
  const statusLabel = claimed
    ? viewerIsClaimer
      ? "Committed"
      : "Help is on the way!"
    : isSelfAuthored
      ? "Open"
      : "Needs help";
  const setMinimized = (nextMinimized: boolean) => {
    if (!onSetMinimized) return;
    restorePresentationFocusRef.current = true;
    onSetMinimized(request.id, nextMinimized);
  };

  useEffect(() => {
    if (!restorePresentationFocusRef.current) return;
    restorePresentationFocusRef.current = false;
    requestAnimationFrame(() => presentationButtonRef.current?.focus());
  }, [minimized]);

  if (minimized) {
    return (
      <article
        aria-label={`${articleLabel}, minimized`}
        className={`care-request-card care-request-card--minimized${isSelfAuthored ? "" : " care-request-card--incoming"}`}
      >
        <div aria-hidden="true" className="care-request-card__mark">
          <HandHeart />
        </div>
        <div className="care-request-card__body care-request-card__body--minimized">
          <div>
            <span className="care-request-card__eyebrow">
              {categoryName} request
            </span>
            <h2>
              {isSelfAuthored
                ? `Your ${categoryLabel} request`
                : `${requesterFirstName} asked for ${categoryLabel} care`}
            </h2>
            <time dateTime={request.createdAt}>
              {formatter.format(new Date(request.createdAt))}
            </time>
          </div>
          <span className="care-request-card__status">{statusLabel}</span>
          {onSetMinimized ? (
            <button
              className="care-request-card__presentation"
              onClick={() => setMinimized(false)}
              ref={presentationButtonRef}
              type="button"
            >
              Show details
            </button>
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <article
      aria-label={articleLabel}
      className={`care-request-card${isSelfAuthored ? "" : " care-request-card--incoming"}`}
    >
      <div aria-hidden="true" className="care-request-card__mark">
        <HandHeart />
      </div>
      <div className="care-request-card__body">
        <div className="care-request-card__heading">
          <div>
            <span className="care-request-card__eyebrow">
              {categoryName} request
            </span>
            <h2>
              {isSelfAuthored
                ? `Your ${categoryLabel} request`
                : `${requesterFirstName} is asking for ${categoryLabel} care`}
            </h2>
          </div>
          <span className="care-request-card__status">{statusLabel}</span>
        </div>
        <dl>
          <div>
            <dt>Care</dt>
            <dd>{categoryName}</dd>
          </div>
          {request.subtype ? (
            <div>
              <dt>Type</dt>
              <dd>{request.subtype}</dd>
            </div>
          ) : null}
          <div>
            <dt>When</dt>
            <dd>{schedule}</dd>
          </div>
          {requirements ? (
            <div>
              <dt>Works well</dt>
              <dd>{requirements}</dd>
            </div>
          ) : null}
          {sensitivities ? (
            <div>
              <dt>Preferences</dt>
              <dd>{sensitivities}</dd>
            </div>
          ) : null}
          <div>
            <dt>Location</dt>
            <dd>{location}</dd>
          </div>
        </dl>
        <div className="care-request-card__footer">
          <span>
            {request.audience === "Party" ? (
              <HeartHandshake aria-hidden="true" />
            ) : (
              <Network aria-hidden="true" />
            )}
            {isSelfAuthored
              ? `Shared with: ${request.audience}`
              : `From your ${request.audience}`}
          </span>
          <time dateTime={request.createdAt}>
            {formatter.format(new Date(request.createdAt))}
          </time>
        </div>
        {onSetMinimized ? (
          <button
            className="care-request-card__presentation"
            onClick={() => setMinimized(true)}
            ref={presentationButtonRef}
            type="button"
          >
            I’ve seen this
          </button>
        ) : null}
        {isSelfAuthored && !claimed && onWithdraw ? (
          <button
            className="care-request-card__withdraw"
            onClick={() => onWithdraw(request.id)}
            type="button"
          >
            Withdraw request
          </button>
        ) : claimed ? (
          <div className="care-request-card__outcome">
            <p
              className="care-request-card__commitment"
              data-care-claim-status={request.id}
              tabIndex={-1}
            >
              {viewerIsClaimer
                ? `You’re helping ${requesterFirstName}.`
                : request.claimant
                  ? `${request.claimant.displayName} has offered this`
                  : "Someone is helping with this request."}
            </p>
            {effectiveViewerCompletion === "completed" ? (
              <p
                className="care-request-card__waiting"
                data-care-outcome-status={request.id}
                role="status"
                tabIndex={-1}
              >
                You marked this completed. Waiting for the other person.
              </p>
            ) : onRecordCompleted ? (
              <>
                {effectiveOtherParticipantCompleted ? (
                  <p
                    className="care-request-card__waiting"
                    data-care-outcome-status={request.id}
                    role="status"
                    tabIndex={-1}
                  >
                    The other person marked this completed. What happened for
                    you?
                  </p>
                ) : null}
                <div
                  className={`care-request-card__outcome-actions${onRecordNotCompleted ? "" : " care-request-card__outcome-actions--single"}`}
                >
                  <button
                    data-care-completed-action={request.id}
                    onClick={() => onRecordCompleted(request)}
                    type="button"
                  >
                    Mark done
                  </button>
                  {onRecordNotCompleted ? (
                    <button
                      data-care-outcome-action={request.id}
                      onClick={() => onRecordNotCompleted(request)}
                      type="button"
                    >
                      I can’t complete this Care
                    </button>
                  ) : null}
                </div>
              </>
            ) : null}
            {request.gratitude ? (
              <div className="care-request-card__gratitude">
                <span>Private gratitude</span>
                <p>
                  {getMealGratitudeStatement(request.gratitude.statementId)
                    ?.text ?? "Thank you for showing up with care."}
                </p>
                {request.gratitude.message ? (
                  <blockquote>{request.gratitude.message}</blockquote>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : !isSelfAuthored ? (
          <div className="care-request-card__actions">
            <button
              className="care-request-card__claim"
              data-care-claim-action={request.id}
              onClick={() => onOfferHelp(request)}
              type="button"
            >
              I can help
            </button>
            {canPass && onPass ? (
              <button
                className="care-request-card__pass"
                onClick={() => onPass(request)}
                type="button"
              >
                Pass this time
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
