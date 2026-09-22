import {
  getCareCategory,
  type CareCategoryId,
  type CareDay,
  type CareTime,
} from "@cloud-forest/domain";

import type { CareDraft } from "@/types/care";

export const dayLabels: Record<CareDay, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export const timeLabels: Record<CareTime, string> = {
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
  abbreviatedDays?: boolean;
  dayTimeSeparator?: string;
}) {
  if (!input.days?.length && !input.times?.length && !input.timeNote?.trim()) {
    return input.fallback;
  }
  const days = (input.days ?? [])
    .map((day) =>
      input.abbreviatedDays ? dayLabels[day].slice(0, 3) : dayLabels[day],
    )
    .join(", ");
  const times = (input.times ?? []).map((time) => timeLabels[time]).join(", ");
  const schedule = [days, times]
    .filter(Boolean)
    .join(input.dayTimeSeparator ?? ", ");
  const note = input.timeNote?.trim();
  return [schedule, note].filter(Boolean).join(" · ");
}
