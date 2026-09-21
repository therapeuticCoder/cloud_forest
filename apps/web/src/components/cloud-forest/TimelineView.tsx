import type { Care, CarePersonId } from "@/types/care";

import {
  TimelinePanel,
  type TimelineApiClient,
  type TimelineError,
} from "./TimelinePanel";

const noCareIds = new Set<string>();

export function TimelineView({
  cares = [],
  careError,
  minimizedCareIds = noCareIds,
  onCommitToCare,
  onClaim,
  onRecordCompleted,
  onRecordNotCompleted,
  onPass,
  onSetCareMinimized,
  onWithdraw,
  onOfflineChange,
  passableCareIds = noCareIds,
  passAnnouncement,
  viewerId = "you",
  cacheOwnerId,
  apiClient,
  postComposerOpen = false,
  onClosePostComposer,
  offline = false,
}: {
  apiClient?: TimelineApiClient;
  cares?: Care[];
  careError?: TimelineError;
  minimizedCareIds?: Set<string>;
  onCommitToCare?: (care: Care) => void;
  onClaim?: (careId: string) => void;
  onRecordCompleted?: (care: Care) => void;
  onRecordNotCompleted?: (care: Care) => void;
  onPass?: (care: Care) => void;
  onSetCareMinimized?: (careId: string, minimized: boolean) => void;
  onWithdraw?: (careId: string) => void;
  onOfflineChange?: (offline: boolean) => void;
  passableCareIds?: Set<string>;
  passAnnouncement?: string;
  cacheOwnerId?: string;
  viewerId?: CarePersonId;
  offline?: boolean;
  postComposerOpen?: boolean;
  onClosePostComposer?: () => void;
} = {}) {
  return (
    <section aria-label="Timeline view" className="timeline-view">
      <TimelinePanel
        apiClient={apiClient}
        cacheOwnerId={cacheOwnerId}
        careError={careError}
        cares={cares}
        minimizedCareIds={minimizedCareIds}
        offline={offline}
        onClaim={onClaim}
        onClosePostComposer={onClosePostComposer}
        onCommitToCare={onCommitToCare}
        onOfflineChange={onOfflineChange}
        onPass={onPass}
        onRecordCompleted={onRecordCompleted}
        onRecordNotCompleted={onRecordNotCompleted}
        onSetCareMinimized={onSetCareMinimized}
        onWithdraw={onWithdraw}
        passAnnouncement={passAnnouncement}
        passableCareIds={passableCareIds}
        postComposerOpen={postComposerOpen}
        viewerId={viewerId}
      />
    </section>
  );
}
