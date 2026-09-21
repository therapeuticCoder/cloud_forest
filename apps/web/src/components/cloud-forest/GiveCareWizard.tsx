import { CareWizard, type CareDraft } from "./CareWizard";
import { careDraftDescription, careDraftSchedule } from "./carePresentation";

export type GiveCareDraft = CareDraft & {
  mealDescription: string;
  availableWhen: string;
  handoffStyle: string;
};

export function GiveCareWizard({
  onCancel,
  onComplete,
}: {
  onCancel: () => void;
  onComplete: (
    draft: GiveCareDraft,
  ) => Promise<{ ok: true } | { ok: false; message: string } | void>;
}) {
  const complete = async (draft: CareDraft) =>
    onComplete({
      ...draft,
      mealDescription: careDraftDescription(draft),
      availableWhen: careDraftSchedule(draft),
      handoffStyle: draft.location,
    });

  return (
    <CareWizard direction="give" onCancel={onCancel} onComplete={complete} />
  );
}
