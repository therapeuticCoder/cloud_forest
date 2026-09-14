import { AuthBoundary } from "@/components/auth/AuthBoundary";
import type { CuratedPersonApiClient } from "@/components/cloud-forest/DashboardShell";
import { restorePendingConnectionPairing } from "@/lib/pendingConnectionPairing";
import type { SessionClient } from "./sessionClient";

export function App({
  apiClient,
  sessionClient,
}: {
  apiClient?: CuratedPersonApiClient;
  sessionClient?: SessionClient;
} = {}) {
  restorePendingConnectionPairing();
  return <AuthBoundary apiClient={apiClient} sessionClient={sessionClient} />;
}
