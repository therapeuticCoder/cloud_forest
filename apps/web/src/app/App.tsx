import {
  DashboardShell,
  type CuratedPersonApiClient,
} from "@/components/cloud-forest/DashboardShell";
import { CareAudienceReview } from "@/components/review-prototypes/care-audience-review/CareAudienceReview";
import { PwaNotice } from "@/components/pwa/PwaNotice";

export function App({
  apiClient,
}: {
  apiClient?: CuratedPersonApiClient;
} = {}) {
  if (
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("review") === "t-044"
  ) {
    return <CareAudienceReview />;
  }

  return (
    <>
      <DashboardShell apiClient={apiClient} />
      <PwaNotice />
    </>
  );
}
