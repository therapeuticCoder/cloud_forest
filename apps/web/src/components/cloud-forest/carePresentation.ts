import {
  getCareCategory,
  type CareCategoryId,
  type CareDay,
  type CareTime,
} from "@cloud-forest/domain";

import type { CareDraft } from "./CareWizard";

const dayLabels: Record<CareDay, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const timeLabels: Record<CareTime, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

export function careCategoryName(
  category: CareCategoryId | undefined,
  fallback = "Care",
) {
  return category ? (getCareCategory(category)?.name ?? fallback) : fallback;
}

export function careDraftSchedule(
  draft: Pick<CareDraft, "days" | "times" | "timeNote">,
) {
  const parts = [
    ...draft.days.map((day) => dayLabels[day]),
    ...draft.times.map((time) => timeLabels[time]),
  ];
  return [parts.join(", "), draft.timeNote].filter(Boolean).join(" · ");
}

export function careScheduleLabel(input: {
  days?: CareDay[];
  times?: CareTime[];
  timeNote?: string;
  fallback: string;
}) {
  if (!input.days?.length && !input.times?.length && !input.timeNote?.trim()) {
    return input.fallback;
  }
  const parts = [
    ...(input.days?.map((day) => dayLabels[day]) ?? []),
    ...(input.times?.map((time) => timeLabels[time]) ?? []),
  ];
  const note = input.timeNote?.trim();
  return [parts.join(", "), note].filter(Boolean).join(" · ");
}
