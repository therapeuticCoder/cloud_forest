import { TimelinePanel } from "./TimelinePanel";
import type { GiveCareOffer, ReceiveCareRequest } from "@/types/careRequest";

const noClaimedRequestIds = new Set<string>();
const noMinimizedRequestIds = new Set<string>();

export function TimelineView({
  careOffers = [],
  careRequests = [],
  claimedRequestIds = noClaimedRequestIds,
  minimizedRequestIds = noMinimizedRequestIds,
  onOfferHelp = () => undefined,
  onSetRequestMinimized = () => undefined,
  onWithdraw = () => undefined,
  onWithdrawOffer = () => undefined,
}: {
  careOffers?: GiveCareOffer[];
  careRequests?: ReceiveCareRequest[];
  claimedRequestIds?: Set<string>;
  minimizedRequestIds?: Set<string>;
  onOfferHelp?: (request: ReceiveCareRequest) => void;
  onSetRequestMinimized?: (requestId: string, minimized: boolean) => void;
  onWithdraw?: (requestId: string) => void;
  onWithdrawOffer?: (offerId: string) => void;
} = {}) {
  return (
    <section aria-label="Timeline view" className="timeline-view">
      <TimelinePanel
        careOffers={careOffers}
        careRequests={careRequests}
        claimedRequestIds={claimedRequestIds}
        minimizedRequestIds={minimizedRequestIds}
        onOfferHelp={onOfferHelp}
        onSetRequestMinimized={onSetRequestMinimized}
        onWithdraw={onWithdraw}
        onWithdrawOffer={onWithdrawOffer}
      />
    </section>
  );
}
