import { AuthBoundary } from "@/components/auth/AuthBoundary";
import type {
  CareApiClient,
  CuratedPersonApiClient,
} from "@/app/DashboardShell";
import { restorePendingConnectionPairing } from "@/lib/pendingConnectionPairing";
import type { SessionClient } from "./sessionClient";

export function App({
  apiClient,
  careApiClient,
  sessionClient,
}: {
  apiClient?: CuratedPersonApiClient;
  careApiClient?: CareApiClient;
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
