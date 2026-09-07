import {
  DashboardShell,
  type CuratedPersonApiClient,
} from "@/components/cloud-forest/DashboardShell";
import { InvitedSessionPrototype } from "@/features/invited-session/InvitedSessionPrototype";
import { PartyStatePrototype } from "@/features/party-state-review/PartyStatePrototype";
import { PwaNotice } from "@/components/pwa/PwaNotice";

export function App({
  apiClient,
}: {
  apiClient?: CuratedPersonApiClient;
} = {}) {
  const prototype = new URLSearchParams(window.location.search).get(
    "prototype",
  );

  if (prototype === "invited-session") {
    return <InvitedSessionPrototype />;
  }

  if (prototype === "party-states") {
    return <PartyStatePrototype />;
  }

  return (
    <>
      <DashboardShell apiClient={apiClient} />
      <PwaNotice />
    </>
  );
}
