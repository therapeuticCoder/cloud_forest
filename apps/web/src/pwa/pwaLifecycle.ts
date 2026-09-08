type PwaNotice =
  | "offline-ready"
  | "install-help"
  | "install-ready"
  | "update-ready"
  | null;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const listeners = new Set<() => void>();
let currentNotice: PwaNotice = null;
let initialization: Promise<void> | undefined;
let workerRegistration: ServiceWorkerRegistration | undefined;
let reloadForUpdate = false;
let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;

function isAndroidBrowser() {
  return /Android/i.test(navigator.userAgent);
}

function isStandaloneDisplayMode() {
  return window.matchMedia("(display-mode: standalone)").matches;
}

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

export function announceWaitingPwaUpdate(
  hasWaitingWorker: boolean,
  hasController: boolean,
) {
  if (hasWaitingWorker && hasController) {
    setPwaNotice("update-ready");
  }
}

export function dismissPwaNotice() {
  setPwaNotice(null);
}

export function activatePwaUpdate() {
  reloadForUpdate = true;
  workerRegistration?.waiting?.postMessage({ type: "SKIP_WAITING" });
}

export async function installPwa() {
  if (!deferredInstallPrompt) {
    setPwaNotice("install-help");
    return;
  }

  const prompt = deferredInstallPrompt;
  deferredInstallPrompt = null;
  dismissPwaNotice();
  try {
    await prompt.prompt();
    await prompt.userChoice;
  } catch {
    setPwaNotice("install-help");
  }
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

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event as BeforeInstallPromptEvent;
    if (currentNotice !== "update-ready") {
      setPwaNotice("install-ready");
    }
  });
  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    dismissPwaNotice();
  });

  const hadController = Boolean(navigator.serviceWorker.controller);
  const registration = await navigator.serviceWorker.register(
    "/serviceWorker.js",
    {
      scope: "/",
      updateViaCache: "none",
    },
  );
  workerRegistration = registration;

  const announceWaitingUpdate = () => {
    announceWaitingPwaUpdate(
      Boolean(registration.waiting),
      Boolean(navigator.serviceWorker.controller),
    );
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
  if (!hadController && currentNotice === null) {
    setPwaNotice("offline-ready");
  }
  if (
    isAndroidBrowser() &&
    !isStandaloneDisplayMode() &&
    !deferredInstallPrompt &&
    (currentNotice === null || currentNotice === "offline-ready")
  ) {
    setPwaNotice("install-help");
  }

  const checkForUpdate = () => {
    announceWaitingUpdate();

    if (navigator.onLine) {
      void registration.update().then(announceWaitingUpdate);
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
          "Cloud Forest service worker registration failed.",
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
