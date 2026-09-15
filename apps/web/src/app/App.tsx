import { AuthBoundary } from "@/components/auth/AuthBoundary";
import type {
  CareOfferApiClient,
  CareRequestApiClient,
  CuratedPersonApiClient,
} from "@/components/cloud-forest/DashboardShell";
import { restorePendingConnectionPairing } from "@/lib/pendingConnectionPairing";
import type { SessionClient } from "./sessionClient";

export function App({
  apiClient,
  careApiClient,
  careOfferApiClient,
  sessionClient,
}: {
  apiClient?: CuratedPersonApiClient;
  careApiClient?: CareRequestApiClient;
  careOfferApiClient?: CareOfferApiClient;
  sessionClient?: SessionClient;
} = {}) {
  restorePendingConnectionPairing();
  return (
    <AuthBoundary
      apiClient={apiClient}
      careApiClient={careApiClient}
      careOfferApiClient={careOfferApiClient}
      sessionClient={sessionClient}
    />
  );
}
