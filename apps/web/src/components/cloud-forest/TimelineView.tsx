import { TimelinePanel, type TimelineApiClient } from "./TimelinePanel";
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
  careRequestStatusMessage,
  careOfferStatusMessage,
  careGratitudeRequests = careRequests,
  claimedRequestIds = noClaimedRequestIds,
  minimizedRequestIds = noMinimizedRequestIds,
  onOfferHelp = () => undefined,
  onClaimOffer,
  onRecordCompleted,
  onRecordNotCompleted,
  onPass,
  onSetRequestMinimized,
  onWithdraw,
  onWithdrawOffer = () => undefined,
  onOfflineChange,
  passableRequestIds = noPassableRequestIds,
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
  careRequestStatusMessage?: string;
  careOfferStatusMessage?: string;
  claimedRequestIds?: Set<string>;
  minimizedRequestIds?: Set<string>;
  onOfferHelp?: (request: ReceiveCareRequest) => void;
  onClaimOffer?: (offerId: string) => void;
  onRecordCompleted?: (request: ReceiveCareRequest) => void;
  onRecordNotCompleted?: (request: ReceiveCareRequest) => void;
  onPass?: (request: ReceiveCareRequest) => void;
  onSetRequestMinimized?: (requestId: string, minimized: boolean) => void;
  onWithdraw?: (requestId: string) => void;
  onWithdrawOffer?: (offerId: string) => void;
  onOfflineChange?: (offline: boolean) => void;
  passableRequestIds?: Set<string>;
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
        careRequestStatusMessage={careRequestStatusMessage}
        careOfferStatusMessage={careOfferStatusMessage}
        claimedRequestIds={claimedRequestIds}
        minimizedRequestIds={minimizedRequestIds}
        onOfferHelp={onOfferHelp}
        onClaimOffer={onClaimOffer}
        onRecordCompleted={onRecordCompleted}
        onRecordNotCompleted={onRecordNotCompleted}
        onPass={onPass}
        onSetRequestMinimized={onSetRequestMinimized}
        onWithdraw={onWithdraw}
        onWithdrawOffer={onWithdrawOffer}
        onOfflineChange={onOfflineChange}
        offline={offline}
        apiClient={apiClient}
        passableRequestIds={passableRequestIds}
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
