import { AuthBoundary } from "@/components/auth/AuthBoundary";
import type {
  CareRequestApiClient,
  CuratedPersonApiClient,
} from "@/components/cloud-forest/DashboardShell";
import { restorePendingConnectionPairing } from "@/lib/pendingConnectionPairing";
import type { SessionClient } from "./sessionClient";

export function App({
  apiClient,
  careApiClient,
  sessionClient,
}: {
  apiClient?: CuratedPersonApiClient;
  careApiClient?: CareRequestApiClient;
  sessionClient?: SessionClient;
} = {}) {
  restorePendingConnectionPairing();
  return (
    <AuthBoundary
      apiClient={apiClient}
      careApiClient={careApiClient}
      sessionClient={sessionClient}
    />
  );
}
