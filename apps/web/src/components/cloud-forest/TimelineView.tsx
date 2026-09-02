import { TimelinePanel } from "./TimelinePanel";
import type { GiveCareOffer, ReceiveCareRequest } from "@/types/careRequest";

export function TimelineView({
  careOffers = [],
  careRequests = [],
  onWithdraw = () => undefined,
  onWithdrawOffer = () => undefined,
}: {
  careOffers?: GiveCareOffer[];
  careRequests?: ReceiveCareRequest[];
  onWithdraw?: (requestId: string) => void;
  onWithdrawOffer?: (offerId: string) => void;
} = {}) {
  return (
    <section aria-label="Timeline view" className="timeline-view">
      <TimelinePanel
        careOffers={careOffers}
        careRequests={careRequests}
        onWithdraw={onWithdraw}
        onWithdrawOffer={onWithdrawOffer}
      />
    </section>
  );
}
