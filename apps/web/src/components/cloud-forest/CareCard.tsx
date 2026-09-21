import { Gift, HandHeart, HeartHandshake, Network } from "lucide-react";
import { useEffect, useRef } from "react";

import type { Care, CarePersonId } from "@/types/care";
import { getMealGratitudeStatement } from "@/data/careGratitudeStatements";
import { careCategoryName, careScheduleLabel } from "./carePresentation";
import { CareLeaf } from "./CareLeaf";

const formatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  day: "numeric",
});

export function CareCard({
  canPass,
  presentation = "card",
  onOpenDetails,
  minimized,
  onCommitToCare,
  onClaim,
  onRecordCompleted,
  onRecordNotCompleted,
  onPass,
  onSetMinimized,
  onWithdraw,
  care,
  viewerId,
}: {
  canPass: boolean;
  presentation?: "card" | "leaf";
  onOpenDetails?: (care: Care) => void;
  minimized: boolean;
  onCommitToCare?: (care: Care) => void;
  onClaim?: (careId: string) => void;
  onPass?: (care: Care) => void;
  onRecordCompleted?: (care: Care) => void;
  onRecordNotCompleted?: (care: Care) => void;
  onSetMinimized?: (careId: string, minimized: boolean) => void;
  onWithdraw?: (careId: string) => void;
  care: Care;
  viewerId: CarePersonId;
}) {
  const isSelfAuthored = care.originator.id === viewerId;
  const isClaimed = care.status !== "open" && care.status !== "expired";
  const viewerCompleted = isSelfAuthored
    ? care.originatorCompletedAt !== undefined
    : care.participant?.id === viewerId &&
      care.participantCompletedAt !== undefined;
  const otherCompleted = isSelfAuthored
    ? care.participantCompletedAt !== undefined
    : care.originatorCompletedAt !== undefined;
  const categoryName = careCategoryName(care.category);
  const categoryLabel = categoryName.toLowerCase();
  const schedule = careScheduleLabel({
    days: care.days,
    times: care.times,
    timeNote: care.timeNote,
    fallback: "Flexible",
  });
  const presentationButtonRef = useRef<HTMLButtonElement>(null);
  const restorePresentationFocusRef = useRef(false);
  const articleLabel = isSelfAuthored
    ? `${isClaimed ? "Claimed" : "Open"} ${categoryLabel} Care`
    : `${care.originator.displayName} shared ${categoryLabel} Care`;
  const statusLabel = isClaimed
    ? care.participant?.id === viewerId
      ? "Committed"
      : "Help is on the way!"
    : care.status === "expired"
      ? "Opportunity passed"
      : isSelfAuthored
        ? "Open"
        : "Needs help";
  const setMinimized = (nextMinimized: boolean) => {
    if (!onSetMinimized) return;
    restorePresentationFocusRef.current = true;
    onSetMinimized(care.id, nextMinimized);
  };

  useEffect(() => {
    if (!restorePresentationFocusRef.current) return;
    restorePresentationFocusRef.current = false;
    requestAnimationFrame(() => presentationButtonRef.current?.focus());
  }, [minimized]);

  const otherPerson = care.participant ?? care.originator;
  const actionLabel =
    care.direction === "give"
      ? presentation === "leaf"
        ? "Receive"
        : "I will receive this"
      : "I can help";

  const actions =
    isSelfAuthored && !isClaimed && care.status !== "expired" && onWithdraw ? (
      <button
        className="care-card__withdraw"
        onClick={() => onWithdraw(care.id)}
        type="button"
      >
        {presentation === "leaf" ? "Withdraw" : "Withdraw Care"}
      </button>
    ) : isClaimed ? (
      <div className="care-card__outcome">
        <p
          className="care-card__commitment"
          data-care-claim-status={care.id}
          tabIndex={-1}
        >
          {care.participant?.id === viewerId
            ? care.direction === "give"
              ? `You’re receiving this Care from ${care.originator.displayName}.`
              : `You’re helping ${care.originator.displayName}.`
            : `${otherPerson.displayName} is part of this Care.`}
        </p>
        {viewerCompleted ? (
          <p
            className="care-card__waiting"
            data-care-outcome-status={care.id}
            role="status"
            tabIndex={-1}
          >
            You marked this completed. Waiting for the other person.
          </p>
        ) : onRecordCompleted ? (
          <>
            {otherCompleted ? (
              <p
                className="care-card__waiting"
                data-care-outcome-status={care.id}
                role="status"
                tabIndex={-1}
              >
                The other person marked this completed. What happened for you?
              </p>
            ) : null}
            <div
              className={`care-card__outcome-actions${onRecordNotCompleted ? "" : " care-card__outcome-actions--single"}`}
            >
              <button
                data-care-completed-action={care.id}
                onClick={() => onRecordCompleted(care)}
                type="button"
              >
                Mark done
              </button>
              {onRecordNotCompleted ? (
                <button
                  data-care-outcome-action={care.id}
                  onClick={() => onRecordNotCompleted(care)}
                  type="button"
                >
                  I can’t complete this Care
                </button>
              ) : null}
            </div>
          </>
        ) : null}
        {care.gratitude ? (
          <div className="care-card__gratitude">
            <span>Private gratitude</span>
            <p>
              {getMealGratitudeStatement(care.gratitude.statementId)?.text ??
                "Thank you for showing up with care."}
            </p>
            {care.gratitude.message ? (
              <blockquote>{care.gratitude.message}</blockquote>
            ) : null}
          </div>
        ) : null}
      </div>
    ) : !isSelfAuthored && (onCommitToCare || onClaim) ? (
      <div className="care-card__actions">
        <button
          className="care-card__claim"
          data-care-claim-action={care.id}
          onClick={() =>
            onCommitToCare ? onCommitToCare(care) : onClaim?.(care.id)
          }
          type="button"
        >
          {actionLabel}
        </button>
        {canPass && onPass ? (
          <button
            className="care-card__pass"
            onClick={() => onPass(care)}
            type="button"
          >
            {presentation === "leaf" ? "Pass" : "Pass this time"}
          </button>
        ) : null}
      </div>
    ) : null;

  if (presentation === "leaf") {
    return (
      <CareLeaf
        articleLabel={articleLabel}
        care={care}
        viewerId={viewerId}
        minimized={minimized}
        onOpenDetails={onOpenDetails}
        actions={minimized ? null : actions}
        presentationControl={
          onSetMinimized ? (
            <button
              className="care-card__presentation"
              onClick={() => setMinimized(!minimized)}
              ref={presentationButtonRef}
              type="button"
            >
              {minimized ? "Show details" : "I’ve seen this"}
            </button>
          ) : null
        }
      />
    );
  }

  if (minimized) {
    return (
      <article
        aria-label={`${articleLabel}, minimized`}
        className="care-card care-card--minimized"
      >
        <div aria-hidden="true" className="care-card__mark">
          {care.direction === "give" ? <Gift /> : <HandHeart />}
        </div>
        <div className="care-card__body care-card__body--minimized">
          <div>
            <span className="care-card__eyebrow">{categoryName} Care</span>
            <h2>
              {isSelfAuthored
                ? `Your ${categoryLabel} Care`
                : `${care.originator.displayName} shared ${categoryLabel} Care`}
            </h2>
            <time dateTime={care.createdAt}>
              {formatter.format(new Date(care.createdAt))}
            </time>
          </div>
          <span className="care-card__status">{statusLabel}</span>
          {onSetMinimized ? (
            <button
              className="care-card__presentation"
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
      className={`care-card${isSelfAuthored ? "" : " care-card--incoming"}`}
    >
      <div aria-hidden="true" className="care-card__mark">
        {care.direction === "give" ? <Gift /> : <HandHeart />}
      </div>
      <div className="care-card__body">
        <div className="care-card__heading">
          <div>
            <span className="care-card__eyebrow">{categoryName} Care</span>
            <h2>
              {isSelfAuthored
                ? `Your ${categoryLabel} Care`
                : `${care.originator.displayName} shared ${categoryLabel} Care`}
            </h2>
          </div>
          <span className="care-card__status">{statusLabel}</span>
        </div>
        <dl>
          <div>
            <dt>Care</dt>
            <dd>{categoryName}</dd>
          </div>
          {care.subtype ? (
            <div>
              <dt>Type</dt>
              <dd>{care.subtype}</dd>
            </div>
          ) : null}
          <div>
            <dt>When</dt>
            <dd>{schedule}</dd>
          </div>
          {care.requirements ? (
            <div>
              <dt>Works well</dt>
              <dd>{care.requirements}</dd>
            </div>
          ) : null}
          {care.sensitivities ? (
            <div>
              <dt>Preferences</dt>
              <dd>{care.sensitivities}</dd>
            </div>
          ) : null}
          <div>
            <dt>Location</dt>
            <dd>{care.location}</dd>
          </div>
        </dl>
        <div className="care-card__footer">
          <span>
            {care.audience === "Party" ? (
              <HeartHandshake aria-hidden="true" />
            ) : (
              <Network aria-hidden="true" />
            )}
            {isSelfAuthored
              ? `Shared with: ${care.audience}`
              : `From your ${care.audience}`}
          </span>
          <time dateTime={care.createdAt}>
            {formatter.format(new Date(care.createdAt))}
          </time>
        </div>
        {onSetMinimized ? (
          <button
            className="care-card__presentation"
            onClick={() => setMinimized(true)}
            ref={presentationButtonRef}
            type="button"
          >
            I’ve seen this
          </button>
        ) : null}
        {actions}
      </div>
    </article>
  );
}
