import { ShieldAlert } from "lucide-react";
import { useEffect, useId, useRef } from "react";

import { Button } from "@/components/ui/button";

type RelationshipConfirmationDialogProps = {
  confirmLabel: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
  pending?: boolean;
  title: string;
};

export function RelationshipConfirmationDialog({
  confirmLabel,
  description,
  onCancel,
  onConfirm,
  open,
  pending = false,
  title,
}: RelationshipConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pending) onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel, open, pending]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/75 p-3 backdrop-blur-sm sm:items-center sm:justify-center">
      <div
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className="w-full max-w-md rounded-[1.75rem] border border-lime-100/20 bg-[#101c18] p-5 text-slate-100 shadow-2xl shadow-black/50 sm:p-6"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="flex items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-full border border-rose-200/25 bg-rose-950/50 text-rose-100">
            <ShieldAlert aria-hidden="true" size={21} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime-200/75">
              Relationship safety
            </p>
            <h2 className="mt-1 text-xl font-medium" id={titleId}>
              {title}
            </h2>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-300" id={descriptionId}>
          {description}
        </p>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <Button
            className="min-h-12 border border-lime-100/25 text-slate-100 hover:bg-lime-100/10"
            disabled={pending}
            onClick={onCancel}
            type="button"
            variant="ghost"
          >
            Not now
          </Button>
          <Button
            className="min-h-12 bg-rose-200 text-rose-950 hover:bg-rose-100"
            disabled={pending}
            onClick={onConfirm}
            type="button"
          >
            {pending ? "Working…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
