import { useEffect, useRef, useState } from "react";
import { careRole } from "@cloud-forest/domain";
import type { Care } from "@/types/care";
import {
  careErrorMessage,
  careGratitudeErrorMessage,
  useCares,
  type CareApiClient,
} from "./useCares";
import type {
  CareGratitudeDraft,
  CareGratitudeResult,
} from "./CareGratitudeWizard";
import type {
  CareWithdrawalDraft,
  CareWithdrawalResult,
} from "./CareWithdrawalWizard";

export function useCareActions(
  careApiClient: CareApiClient | undefined,
  careViewerId: string,
  refreshKey: string,
) {
  const {
    claim: claimCare,
    complete: completeCare,
    create: createCare,
    pass: passCare,
    recordGratitude: recordCareGratitude,
    state: caresState,
    withdraw: withdrawCare,
  } = useCares(careApiClient, refreshKey);
  const [careGratitude, setCareGratitude] = useState<Care | null>(null);
  const [careWithdrawal, setCareWithdrawal] = useState<Care | null>(null);
  const [carePassAnnouncement, setCarePassAnnouncement] = useState<string>();
  const carePassAnnouncementTimeoutRef = useRef<number | undefined>(undefined);
  useEffect(
    () => () => {
      if (carePassAnnouncementTimeoutRef.current !== undefined) {
        window.clearTimeout(carePassAnnouncementTimeoutRef.current);
      }
    },
    [],
  );
  const announceCarePass = () => {
    setCarePassAnnouncement(
      "Passed privately. This Care won’t appear again unless your relationship layer changes.",
    );
    if (carePassAnnouncementTimeoutRef.current !== undefined) {
      window.clearTimeout(carePassAnnouncementTimeoutRef.current);
    }
    carePassAnnouncementTimeoutRef.current = window.setTimeout(() => {
      setCarePassAnnouncement(undefined);
      carePassAnnouncementTimeoutRef.current = undefined;
    }, 5_000);
  };
  const handlePassCare = async (care: Care) => {
    const result = await passCare(care.id);
    if (result.ok) {
      announceCarePass();
    }
  };
  const recordCareCompleted = async (care: Care) => {
    const result = await completeCare(care.id);
    if (
      result.ok &&
      careRole(
        care.direction,
        care.originator.id,
        care.participant?.id,
        careViewerId,
      ) === "receive" &&
      care.gratitude === undefined
    ) {
      setCareGratitude(care);
    }
  };

  const skipCareGratitude = () => {
    setCareGratitude(null);
  };

  const saveCareGratitude = async (
    draft: CareGratitudeDraft,
  ): Promise<CareGratitudeResult> => {
    if (!careGratitude) {
      return { ok: false, message: "Care is no longer available." };
    }
    const result = await recordCareGratitude(careGratitude.id, draft);
    if (!result.ok) {
      return { ok: false, message: careGratitudeErrorMessage(result) };
    }
    setCareGratitude(null);
    return { ok: true };
  };

  const saveCareWithdrawal = async (
    draft: CareWithdrawalDraft,
  ): Promise<CareWithdrawalResult> => {
    if (!careWithdrawal) {
      return { ok: false, message: "Care is no longer available." };
    }
    const result = await withdrawCare(careWithdrawal.id, draft);
    if (!result.ok) {
      return { ok: false, message: careErrorMessage(result) };
    }
    setCareWithdrawal(null);
    return { ok: true };
  };

  return {
    caresState,
    claimCare,
    createCare,
    withdrawCare,
    careGratitude,
    careWithdrawal,
    setCareWithdrawal,
    carePassAnnouncement,
    handlePassCare,
    recordCareCompleted,
    skipCareGratitude,
    saveCareGratitude,
    saveCareWithdrawal,
  };
}
