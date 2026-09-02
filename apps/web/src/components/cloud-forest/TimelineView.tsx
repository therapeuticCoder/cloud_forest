import { TimelinePanel } from "./TimelinePanel";
import type { ReceiveCareRequest } from "@/types/careRequest";

export function TimelineView({
  careRequests = [],
  onWithdraw = () => undefined,
}: {
  careRequests?: ReceiveCareRequest[];
  onWithdraw?: (requestId: string) => void;
} = {}) {
  return (
    <section aria-label="Timeline view" className="timeline-view">
      <TimelinePanel careRequests={careRequests} onWithdraw={onWithdraw} />
    </section>
  );
}
