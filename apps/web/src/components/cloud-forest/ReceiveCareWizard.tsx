import { CareWizard, type CareDraft } from "./CareWizard";
import { careDraftDescription, careDraftSchedule } from "./carePresentation";

export type ReceiveCareDraft = CareDraft & {
  helpfulWhen: string;
  foodWorks: string;
  foodDoesNotWork: string;
  handoffStyle: string;
};

export function ReceiveCareWizard({
  onCancel,
  onComplete,
}: {
  onCancel: () => void;
  onComplete: (
    draft: ReceiveCareDraft,
  ) => Promise<{ ok: true } | { ok: false; message: string } | void>;
}) {
  const complete = async (draft: CareDraft) =>
    onComplete({
      ...draft,
      helpfulWhen: careDraftSchedule(draft),
      foodWorks: careDraftDescription(draft),
      foodDoesNotWork: draft.sensitivities,
      handoffStyle: draft.location,
    });

  return (
    <CareWizard direction="receive" onCancel={onCancel} onComplete={complete} />
  );
}
