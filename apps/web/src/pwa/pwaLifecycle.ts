type PwaNotice = "offline-ready" | "update-ready" | null;
const listeners = new Set<() => void>();
let currentNotice: PwaNotice = null;
let initialization: Promise<void> | undefined;
let workerRegistration: ServiceWorkerRegistration | undefined;
let reloadForUpdate = false;

export function getPwaNotice() {
  return currentNotice;
}

export function subscribeToPwaNotice(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setPwaNotice(notice: PwaNotice) {
  currentNotice = notice;
  listeners.forEach((listener) => listener());
}

export function dismissPwaNotice() {
  setPwaNotice(null);
}

export function activatePwaUpdate() {
  reloadForUpdate = true;
  workerRegistration?.waiting?.postMessage({ type: "SKIP_WAITING" });
}

async function unregisterDevelopmentWorkers() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations.map((registration) => registration.unregister()),
  );
}

async function registerProductionWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  const hadController = Boolean(navigator.serviceWorker.controller);
  const registration = await navigator.serviceWorker.register("/sw.js", {
    scope: "/",
    updateViaCache: "none",
  });
  workerRegistration = registration;

  const announceWaitingUpdate = () => {
    if (registration.waiting && navigator.serviceWorker.controller) {
      setPwaNotice("update-ready");
    }
  };

  announceWaitingUpdate();
  registration.addEventListener("updatefound", () => {
    registration.installing?.addEventListener("statechange", () => {
      announceWaitingUpdate();
    });
  });

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloadForUpdate) {
      window.location.reload();
    }
  });

  await navigator.serviceWorker.ready;
  if (!hadController) {
    setPwaNotice("offline-ready");
  }

  const checkForUpdate = () => {
    if (navigator.onLine) {
      void registration.update();
    }
  };

  window.setInterval(checkForUpdate, 60 * 60 * 1000);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      checkForUpdate();
    }
  });
}

export function initializePwa() {
  initialization ??= import.meta.env.PROD
    ? registerProductionWorker().catch((error: unknown) => {
        console.error(
          "Human Forest service worker registration failed.",
          error,
        );
      })
    : unregisterDevelopmentWorkers();

  return initialization;
}

export function setPwaNoticeForTest(notice: PwaNotice) {
  if (import.meta.env.MODE === "test") {
    setPwaNotice(notice);
  }
}
