import { DashboardShell } from "@/components/cloud-forest/DashboardShell";
import { InvitedSessionPrototype } from "@/features/invited-session/InvitedSessionPrototype";
import { PwaNotice } from "@/components/pwa/PwaNotice";

export function App() {
  const isInvitedSessionReview =
    new URLSearchParams(window.location.search).get("prototype") ===
    "invited-session";

  if (isInvitedSessionReview) {
    return <InvitedSessionPrototype />;
  }

  return (
    <>
      <DashboardShell />
      <PwaNotice />
    </>
  );
}
