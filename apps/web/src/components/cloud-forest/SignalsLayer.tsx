import { Sprout } from "lucide-react";

export function SignalsLayer() {
  return (
    <div
      aria-label="Signals"
      className="grid h-full place-items-center px-6 text-center"
    >
      <p className="max-w-md text-slate-200">
        <Sprout aria-hidden="true" className="mx-auto mb-4 text-slate-200/70" />
        <strong className="block text-2xl font-medium text-slate-100">
          Signals live in Timeline
        </strong>
        <span className="mt-3 block leading-6">
          Public updates from the configured external source appear there
          quietly, ready to reveal when you choose.
        </span>
      </p>
    </div>
  );
}
