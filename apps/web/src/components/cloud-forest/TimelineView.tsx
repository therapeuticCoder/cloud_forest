import { TimelinePanel } from "./TimelinePanel";
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
  careGratitudeRequests = careRequests,
  claimedRequestIds = noClaimedRequestIds,
  minimizedRequestIds = noMinimizedRequestIds,
  onOfferHelp = () => undefined,
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
}: {
  careOffers?: GiveCareOffer[];
  careGratitudes?: CareGratitude[];
  careGratitudeRequests?: ReceiveCareRequest[];
  careRequests?: ReceiveCareRequest[];
  careRequestStatusMessage?: string;
  claimedRequestIds?: Set<string>;
  minimizedRequestIds?: Set<string>;
  onOfferHelp?: (request: ReceiveCareRequest) => void;
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
} = {}) {
  return (
    <section aria-label="Timeline view" className="timeline-view">
      <TimelinePanel
        careGratitudes={careGratitudes}
        careGratitudeRequests={careGratitudeRequests}
        careOffers={careOffers}
        careRequests={careRequests}
        careRequestStatusMessage={careRequestStatusMessage}
        claimedRequestIds={claimedRequestIds}
        minimizedRequestIds={minimizedRequestIds}
        onOfferHelp={onOfferHelp}
        onRecordCompleted={onRecordCompleted}
        onRecordNotCompleted={onRecordNotCompleted}
        onPass={onPass}
        onSetRequestMinimized={onSetRequestMinimized}
        onWithdraw={onWithdraw}
        onWithdrawOffer={onWithdrawOffer}
        onOfflineChange={onOfflineChange}
        passableRequestIds={passableRequestIds}
        passAnnouncement={passAnnouncement}
        cacheOwnerId={cacheOwnerId}
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
