import {
  TimelinePanel,
  type TimelineApiClient,
  type TimelineError,
} from "./TimelinePanel";
import type {
  CareGratitude,
  CarePersonId,
  GiveCareOffer,
  ReceiveCareRequest,
} from "@/types/careRequest";

const noClaimedRequestIds = new Set<string>();
const noMinimizedRequestIds = new Set<string>();
const noPassableRequestIds = new Set<string>();
const noCompletedRequestIds = new Set<string>();

export function TimelineView({
  careGratitudes = [],
  careOffers = [],
  careRequests = [],
  careError,
  careGratitudeRequests = careRequests,
  claimedRequestIds = noClaimedRequestIds,
  minimizedRequestIds = noMinimizedRequestIds,
  onOfferHelp = () => undefined,
  onClaimOffer,
  onRecordCompleted,
  onRecordNotCompleted,
  onPass,
  onPassOffer,
  onSetRequestMinimized,
  onWithdraw,
  onWithdrawOffer = () => undefined,
  onOfflineChange,
  passableRequestIds = noPassableRequestIds,
  passableOfferIds = noPassableRequestIds,
  passAnnouncement,
  viewerId = "you",
  viewerClaimedRequestIds = noClaimedRequestIds,
  viewerCompletedRequestIds = noCompletedRequestIds,
  otherParticipantCompletedRequestIds = noCompletedRequestIds,
  cacheOwnerId,
  apiClient,
  postComposerOpen = false,
  onClosePostComposer,
  offline = false,
}: {
  apiClient?: TimelineApiClient;
  careOffers?: GiveCareOffer[];
  careGratitudes?: CareGratitude[];
  careGratitudeRequests?: ReceiveCareRequest[];
  careRequests?: ReceiveCareRequest[];
  careError?: TimelineError;
  claimedRequestIds?: Set<string>;
  minimizedRequestIds?: Set<string>;
  onOfferHelp?: (request: ReceiveCareRequest) => void;
  onClaimOffer?: (offerId: string) => void;
  onPassOffer?: (offer: GiveCareOffer) => void;
  onRecordCompleted?: (request: ReceiveCareRequest) => void;
  onRecordNotCompleted?: (request: ReceiveCareRequest) => void;
  onPass?: (request: ReceiveCareRequest) => void;
  onSetRequestMinimized?: (requestId: string, minimized: boolean) => void;
  onWithdraw?: (requestId: string) => void;
  onWithdrawOffer?: (offerId: string) => void;
  onOfflineChange?: (offline: boolean) => void;
  passableRequestIds?: Set<string>;
  passableOfferIds?: Set<string>;
  passAnnouncement?: string;
  cacheOwnerId?: string;
  viewerId?: CarePersonId;
  viewerClaimedRequestIds?: Set<string>;
  viewerCompletedRequestIds?: Set<string>;
  otherParticipantCompletedRequestIds?: Set<string>;
  offline?: boolean;
  postComposerOpen?: boolean;
  onClosePostComposer?: () => void;
} = {}) {
  return (
    <section aria-label="Timeline view" className="timeline-view">
      <TimelinePanel
        careGratitudes={careGratitudes}
        careGratitudeRequests={careGratitudeRequests}
        careOffers={careOffers}
        careRequests={careRequests}
        careError={careError}
        claimedRequestIds={claimedRequestIds}
        minimizedRequestIds={minimizedRequestIds}
        onOfferHelp={onOfferHelp}
        onClaimOffer={onClaimOffer}
        onRecordCompleted={onRecordCompleted}
        onRecordNotCompleted={onRecordNotCompleted}
        onPass={onPass}
        onPassOffer={onPassOffer}
        onSetRequestMinimized={onSetRequestMinimized}
        onWithdraw={onWithdraw}
        onWithdrawOffer={onWithdrawOffer}
        onOfflineChange={onOfflineChange}
        offline={offline}
        apiClient={apiClient}
        passableRequestIds={passableRequestIds}
        passableOfferIds={passableOfferIds}
        passAnnouncement={passAnnouncement}
        cacheOwnerId={cacheOwnerId}
        postComposerOpen={postComposerOpen}
        onClosePostComposer={onClosePostComposer}
        viewerClaimedRequestIds={viewerClaimedRequestIds}
        viewerCompletedRequestIds={viewerCompletedRequestIds}
        otherParticipantCompletedRequestIds={
          otherParticipantCompletedRequestIds
        }
        viewerId={viewerId}
      />
    </section>
  );
}
