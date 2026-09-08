import {
  DashboardShell,
  type CuratedPersonApiClient,
} from "@/components/cloud-forest/DashboardShell";
import { PwaNotice } from "@/components/pwa/PwaNotice";

export function App({
  apiClient,
}: {
  apiClient?: CuratedPersonApiClient;
} = {}) {
  return (
    <>
      <DashboardShell apiClient={apiClient} />
      <PwaNotice />
    </>
  );
}
