import type { Care, CarePersonId } from "@/types/care";

import {
  TimelinePanel,
  TimelinePanelContent,
  type TimelineApiClient,
  type TimelineError,
} from "./TimelinePanel";
import type { useTimelineItems } from "./useTimelineItems";

const noCareIds = new Set<string>();

export function TimelineView({
  cares = [],
  careError,
  minimizedCareIds = noCareIds,
  onOpenCareDetails,
  onCommitToCare,
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
  timelineItems,
  postComposerOpen = false,
  onClosePostComposer,
  offline = false,
}: {
  apiClient?: TimelineApiClient;
  timelineItems?: ReturnType<typeof useTimelineItems>;
  cares?: Care[];
  careError?: TimelineError;
  minimizedCareIds?: Set<string>;
  onOpenCareDetails?: (care: Care) => void;
  onCommitToCare?: (care: Care) => void;
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
  const panelProps = {
    apiClient,
    cacheOwnerId,
    careError,
    cares,
    minimizedCareIds,
    offline,
    onClosePostComposer,
    onOpenCareDetails,
    onCommitToCare,
    onOfflineChange,
    onPass,
    onRecordCompleted,
    onRecordNotCompleted,
    onSetCareMinimized,
    onWithdraw,
    passAnnouncement,
    passableCareIds,
    postComposerOpen,
    viewerId,
  };
  return (
    <section aria-label="Timeline view" className="timeline-view">
      {timelineItems ? (
        <TimelinePanelContent {...panelProps} timelineItems={timelineItems} />
      ) : (
        <TimelinePanel {...panelProps} />
      )}
    </section>
  );
}
