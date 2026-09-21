import {
  Baby,
  CalendarDays,
  Car,
  ClipboardList,
  Clock,
  DoorOpen,
  Gift,
  HandHeart,
  House,
  PawPrint,
  Shield,
  Utensils,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { getCareCategory } from "@cloud-forest/domain";

import { createInitials } from "@/data/cloudForest";
import type { Care, CarePersonId, CareStatus } from "@/types/care";
import { careCategoryName, careScheduleLabel } from "./carePresentation";
import "./careLeaf.css";

const categoryIcons = {
  transportation: Car,
  food: Utensils,
  "pet-care": PawPrint,
  "child-care": Baby,
  "urgent-shelter": Shield,
  "help-at-home": House,
  "executive-function-support": ClipboardList,
  "get-out-of-the-house": DoorOpen,
};

const stateLabels: Record<CareStatus, string> = {
  open: "",
  claimed: "Committed",
  orphaned: "Connection ended",
  completed: "Completed",
  expired: "Opportunity passed",
  not_completed: "Not completed",
};

// Seasonal presentation only; expiration and eligibility remain domain-owned.
const amberHours = 24;
const rustHours = 4;

function expirationPresentation(care: Care, now: number) {
  if (care.status !== "open") return { season: "green", label: "" };
  const remaining = care.expiresAt ? Date.parse(care.expiresAt) - now : NaN;
  if (!Number.isFinite(remaining)) return { season: "green", label: "" };
  const hours = remaining / 3_600_000;
  const season =
    hours > amberHours ? "green" : hours > rustHours ? "amber" : "rust";
  const days = Math.ceil(hours / 24);
  const roundedHours = Math.ceil(hours);
  const minutes = Math.max(1, Math.ceil(remaining / 60_000));
  const label =
    remaining <= 0
      ? "Expiration reached"
      : hours > 24
        ? `${days} days left`
        : hours > 1
          ? `${roundedHours} hours left`
          : `${minutes} ${minutes === 1 ? "minute" : "minutes"} left`;
  return { season, label };
}

export function CareLeaf({
  articleLabel,
  care,
  viewerId,
  minimized,
  onOpenDetails,
  actions,
  presentationControl,
}: {
  articleLabel: string;
  care: Care;
  viewerId: CarePersonId;
  minimized: boolean;
  onOpenDetails?: (care: Care) => void;
  actions: ReactNode;
  presentationControl: ReactNode;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (care.status !== "open" || !care.expiresAt) return;
    const expiresAt = Date.parse(care.expiresAt);
    if (!Number.isFinite(expiresAt)) return;
    let timer: number;
    const scheduleUpdate = () => {
      timer = window.setTimeout(
        update,
        Math.max(0, Math.min(60_000, expiresAt - Date.now())),
      );
    };
    const update = () => {
      window.clearTimeout(timer);
      const currentTime = Date.now();
      setNow(currentTime);
      if (currentTime < expiresAt) scheduleUpdate();
    };
    scheduleUpdate();
    window.addEventListener("focus", update);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", update);
    };
  }, [care.status, care.expiresAt]);

  const category = careCategoryName(care.category);
  const CategoryIcon = categoryIcons[care.category];
  const DirectionIcon = care.direction === "give" ? Gift : HandHeart;
  const expiration = expirationPresentation(care, now);
  const expirationReached =
    care.status === "open" &&
    care.expiresAt !== undefined &&
    Date.parse(care.expiresAt) <= now;
  const presentationStatus = expirationReached ? "expired" : care.status;
  const schedule = careScheduleLabel({
    days: care.days,
    times: care.times,
    abbreviatedDays: true,
    dayTimeSeparator: " | ",
    fallback: "Flexible",
  });
  const definition = getCareCategory(care.category);
  const categoryWording =
    care.direction === "give"
      ? definition?.giveWording
      : definition?.receiveWording;
  const what = care.subtype || categoryWording || category;

  return (
    <article
      aria-label={`${articleLabel}${minimized ? ", minimized" : ""}`}
      className={`care-leaf care-leaf--${care.direction} care-leaf--${presentationStatus} care-leaf--${expiration.season}${minimized ? " care-leaf--minimized" : ""}`}
    >
      {onOpenDetails ? (
        <button
          type="button"
          className="care-leaf__open"
          aria-label={`Details for ${category.toLowerCase()} Care`}
          data-care-detail-action={care.id}
          onClick={() => onOpenDetails(care)}
        />
      ) : null}
      <svg
        aria-hidden="true"
        className="care-leaf__branch"
        viewBox="0 0 70 240"
        preserveAspectRatio="none"
      >
        <path d="M18 226 C12 190 51 167 35 120 S16 60 23 16" />
        <path
          className="care-leaf__twig"
          d="M35 137 Q52 123 72 130 M30 91 Q40 66 65 62"
        />
        <path
          className="care-leaf__bud"
          d="M23 36 Q3 29 14 5 Q34 14 23 36 M33 116 Q6 117 5 96 Q30 93 33 116"
        />
      </svg>
      <svg
        aria-hidden="true"
        className="care-leaf__shape"
        viewBox="0 0 400 260"
        preserveAspectRatio="none"
      >
        <path
          className="care-leaf__blade"
          d={
            care.direction === "give"
              ? "M48 100 C67 4 169 0 257 33 Q334 62 396 14 C363 92 383 177 319 222 C229 285 81 255 68 181 Q71 139 48 100 Z"
              : "M47 106 C58 35 129 0 226 12 C339 21 398 107 390 233 C321 260 179 267 105 226 Q57 199 61 164 Q91 133 47 106 Z"
          }
        />
        <path
          className="care-leaf__vein"
          d={
            care.direction === "give"
              ? "M55 124 Q225 181 380 35 M144 146 Q129 85 155 35 M212 141 Q204 96 239 49 M284 110 Q289 85 322 71 M139 147 Q155 211 204 245 M214 145 Q245 201 286 226 M282 113 Q322 147 343 166"
              : "M59 145 Q246 137 382 228 M149 153 Q129 83 153 32 M229 171 Q227 89 250 34 M301 195 Q328 144 318 81 M146 154 Q140 202 185 241 M227 170 Q224 220 265 245"
          }
        />
      </svg>
      <span className="care-leaf__category-mark" aria-hidden="true">
        <CategoryIcon />
      </span>
      <div className="care-leaf__content">
        <div className="care-leaf__heading">
          <span className="care-leaf__category">{category}</span>
        </div>
        <h2 title={what}>{what}</h2>
        <p className="care-leaf__when" title={schedule}>
          <CalendarDays aria-hidden="true" />
          <span>{schedule}</span>
        </p>
        {care.timeNote.trim() ? (
          <p className="care-leaf__timing-note">{care.timeNote.trim()}</p>
        ) : null}
        {expiration.label && !expirationReached ? (
          <p className="care-leaf__time">
            <Clock aria-hidden="true" />
            <time dateTime={care.expiresAt}>{expiration.label}</time>
          </p>
        ) : null}
        {stateLabels[presentationStatus] ? (
          <p className="care-leaf__state">{stateLabels[presentationStatus]}</p>
        ) : null}
        {presentationStatus === "expired" ? null : actions}
        {presentationControl}
      </div>
      <div className="care-leaf__identity">
        <span
          className="care-leaf__initials"
          aria-label={care.originator.displayName}
        >
          {createInitials(care.originator.displayName)}
        </span>
        <DirectionIcon
          aria-label={care.direction === "give" ? "Give Care" : "Receive Care"}
        />
        <span className="care-leaf__relationship">
          {care.originator.id === viewerId
            ? `Shared with ${care.audience}`
            : `From your ${care.audience}`}
        </span>
      </div>
    </article>
  );
}
