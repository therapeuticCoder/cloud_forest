import { Sprout } from "lucide-react";

export function GuildsLayer() {
  return (
    <div
      aria-label="Guilds"
      className="grid h-full place-items-center px-6 text-center"
    >
      <p className="max-w-md text-slate-200">
        <Sprout aria-hidden="true" className="mx-auto mb-4 text-lime-200/70" />
        <strong className="block text-2xl font-medium text-lime-100">
          Coming soon
        </strong>
        <span className="mt-3 block leading-6">
          Guilds will bring people together around shared work, interests, and
          mutual support.
        </span>
      </p>
    </div>
  );
}
