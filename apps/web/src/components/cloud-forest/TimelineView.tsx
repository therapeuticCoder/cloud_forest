import { TimelinePanel } from "./TimelinePanel";
import {
  carePerspectiveOptions,
  type CarePerspectiveOption,
} from "@/data/careLifecycleMockData";
import type {
  CarePersonId,
  GiveCareOffer,
  ReceiveCareRequest,
} from "@/types/careRequest";

import { CarePerspectiveSwitcher } from "./CarePerspectiveSwitcher";

const noClaimedRequestIds = new Set<string>();
const noMinimizedRequestIds = new Set<string>();
const noPassableRequestIds = new Set<string>();
const noCompletedRequestIds = new Set<string>();

export function TimelineView({
  careOffers = [],
  careRequests = [],
  claimedRequestIds = noClaimedRequestIds,
  minimizedRequestIds = noMinimizedRequestIds,
  onOfferHelp = () => undefined,
  onRecordCompleted = () => undefined,
  onRecordNotCompleted = () => undefined,
  onPass = () => undefined,
  onSetRequestMinimized = () => undefined,
  onWithdraw = () => undefined,
  onWithdrawOffer = () => undefined,
  passableRequestIds = noPassableRequestIds,
  passAnnouncement,
  perspectiveOptions = carePerspectiveOptions,
  viewerId = "you",
  viewerClaimedRequestIds = noClaimedRequestIds,
  viewerCompletedRequestIds = noCompletedRequestIds,
  otherParticipantCompletedRequestIds = noCompletedRequestIds,
  onViewerChange = () => undefined,
}: {
  careOffers?: GiveCareOffer[];
  careRequests?: ReceiveCareRequest[];
  claimedRequestIds?: Set<string>;
  minimizedRequestIds?: Set<string>;
  onOfferHelp?: (request: ReceiveCareRequest) => void;
  onRecordCompleted?: (request: ReceiveCareRequest) => void;
  onRecordNotCompleted?: (request: ReceiveCareRequest) => void;
  onPass?: (request: ReceiveCareRequest) => void;
  onSetRequestMinimized?: (requestId: string, minimized: boolean) => void;
  onWithdraw?: (requestId: string) => void;
  onWithdrawOffer?: (offerId: string) => void;
  passableRequestIds?: Set<string>;
  passAnnouncement?: string;
  perspectiveOptions?: CarePerspectiveOption[];
  viewerId?: CarePersonId;
  viewerClaimedRequestIds?: Set<string>;
  viewerCompletedRequestIds?: Set<string>;
  otherParticipantCompletedRequestIds?: Set<string>;
  onViewerChange?: (viewerId: CarePersonId) => void;
} = {}) {
  return (
    <section aria-label="Timeline view" className="timeline-view">
      <CarePerspectiveSwitcher
        onChange={onViewerChange}
        options={perspectiveOptions}
        viewerId={viewerId}
      />
      <TimelinePanel
        careOffers={careOffers}
        careRequests={careRequests}
        claimedRequestIds={claimedRequestIds}
        minimizedRequestIds={minimizedRequestIds}
        onOfferHelp={onOfferHelp}
        onRecordCompleted={onRecordCompleted}
        onRecordNotCompleted={onRecordNotCompleted}
        onPass={onPass}
        onSetRequestMinimized={onSetRequestMinimized}
        onWithdraw={onWithdraw}
        onWithdrawOffer={onWithdrawOffer}
        passableRequestIds={passableRequestIds}
        passAnnouncement={passAnnouncement}
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
