import type { Care } from "@/types/care";
import { careRole, isActiveCareStatus } from "@cloud-forest/domain";

// Presentation of already-authorized records; the API owns visibility and actions.
export function selectMyCare(cares: readonly Care[], viewerId: string) {
  const receive: Care[] = [];
  const receivedOffers: Care[] = [];
  const give: Care[] = [];
  const helping: Care[] = [];
  const history: {
    kind: "completed" | "not-completed" | "expired";
    care: Care;
    at: string;
  }[] = [];
  for (const care of cares) {
    const role = careRole(
      care.direction,
      care.originator.id,
      care.participant?.id,
      viewerId,
    );
    if (!role) continue;
    if (isActiveCareStatus(care.status)) {
      if (role === "receive") {
        if (care.originator.id === viewerId) receive.push(care);
        else receivedOffers.push(care);
      } else if (care.originator.id === viewerId) give.push(care);
      else helping.push(care);
    } else if (care.status === "completed") {
      history.push({
        kind: "completed",
        care,
        at: care.completedAt ?? care.createdAt,
      });
    } else if (care.status === "not_completed") {
      history.push({
        kind: "not-completed",
        care,
        at: care.notCompletedAt ?? care.createdAt,
      });
    } else if (care.status === "expired") {
      history.push({
        kind: "expired",
        care,
        at: care.expiredAt ?? care.createdAt,
      });
    }
  }
  history.sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  return { receive: [...receive, ...receivedOffers], give, helping, history };
}
