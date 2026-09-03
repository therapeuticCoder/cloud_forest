import { TimelinePanel } from "./TimelinePanel";
import type { GiveCareOffer, ReceiveCareRequest } from "@/types/careRequest";

const noClaimedRequestIds = new Set<string>();

export function TimelineView({
  careOffers = [],
  careRequests = [],
  claimedRequestIds = noClaimedRequestIds,
  onOfferHelp = () => undefined,
  onWithdraw = () => undefined,
  onWithdrawOffer = () => undefined,
}: {
  careOffers?: GiveCareOffer[];
  careRequests?: ReceiveCareRequest[];
  claimedRequestIds?: Set<string>;
  onOfferHelp?: (request: ReceiveCareRequest) => void;
  onWithdraw?: (requestId: string) => void;
  onWithdrawOffer?: (offerId: string) => void;
} = {}) {
  return (
    <section aria-label="Timeline view" className="timeline-view">
      <TimelinePanel
        careOffers={careOffers}
        careRequests={careRequests}
        claimedRequestIds={claimedRequestIds}
        onOfferHelp={onOfferHelp}
        onWithdraw={onWithdraw}
        onWithdrawOffer={onWithdrawOffer}
      />
    </section>
  );
}
