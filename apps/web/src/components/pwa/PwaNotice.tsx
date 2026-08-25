import { useSyncExternalStore } from "react";

import {
  activatePwaUpdate,
  dismissPwaNotice,
  getPwaNotice,
  subscribeToPwaNotice,
} from "@/pwa/pwaLifecycle";

export function PwaNotice() {
  const notice = useSyncExternalStore(
    subscribeToPwaNotice,
    getPwaNotice,
    getPwaNotice,
  );

  if (!notice) {
    return null;
  }

  const updateReady = notice === "update-ready";

  return (
    <section className="pwa-notice" aria-live="polite" aria-atomic="true">
      <p>
        {updateReady
          ? "A new Cloud Forest version is ready."
          : "Cloud Forest is ready for offline use."}
      </p>
      <div className="pwa-notice__actions">
        {updateReady ? (
          <button type="button" onClick={activatePwaUpdate}>
            Update now
          </button>
        ) : null}
        <button type="button" onClick={dismissPwaNotice}>
          {updateReady ? "Later" : "Dismiss"}
        </button>
      </div>
    </section>
  );
}
