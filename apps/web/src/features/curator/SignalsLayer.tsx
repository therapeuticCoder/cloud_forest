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
          Coming soon
        </strong>
        <span className="mt-3 block leading-6">
          Signals will offer a quieter layer for noticing broader cultural and
          civic context.
        </span>
      </p>
    </div>
  );
}
