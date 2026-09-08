import { useSyncExternalStore } from "react";

import {
  activatePwaUpdate,
  dismissPwaNotice,
  getPwaNotice,
  installPwa,
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
  const installHelp = notice === "install-help";
  const installReady = notice === "install-ready";

  return (
    <section className="pwa-notice" aria-live="polite" aria-atomic="true">
      <p>
        {updateReady
          ? "A new Cloud Forest version is ready."
          : installReady
            ? "Install Cloud Forest for a faster, offline-ready experience."
            : installHelp
              ? "Open your browser’s ⋮ menu and choose Install app or Add to Home screen."
              : "Cloud Forest is ready for offline use."}
      </p>
      <div className="pwa-notice__actions">
        {updateReady ? (
          <button type="button" onClick={activatePwaUpdate}>
            Update now
          </button>
        ) : installReady ? (
          <button type="button" onClick={() => void installPwa()}>
            Install
          </button>
        ) : null}
        <button type="button" onClick={dismissPwaNotice}>
          {updateReady || installReady ? "Later" : "Dismiss"}
        </button>
      </div>
    </section>
  );
}
