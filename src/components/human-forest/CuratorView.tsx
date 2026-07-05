import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { curatorPartyPeople } from "@/data/humanForest";
import { cn } from "@/lib/utils";

import { PartyLayer } from "./PartyLayer";

type CuratorLayer = {
  title: string;
  label: string;
  description: string;
  placeholder: string;
  accentClassName: string;
};

const curatorLayers: CuratorLayer[] = [
  {
    title: "Party",
    label: "Closest",
    description: "The innermost layer for the people who should feel spacious.",
    placeholder: "Six large person cards will live here.",
    accentClassName: "border-emerald-200/25 bg-emerald-200/10 text-emerald-100",
  },
  {
    title: "Tribe",
    label: "Nearby",
    description: "Neighborhoods of relationships that can be browsed sideways.",
    placeholder: "Five horizontal neighborhood pages will live here.",
    accentClassName: "border-cyan-200/25 bg-cyan-200/10 text-cyan-100",
  },
  {
    title: "Guilds",
    label: "Containers",
    description:
      "Communities, contexts, and recurring groups without portraits.",
    placeholder: "Five expandable guild rows will live here.",
    accentClassName: "border-violet-200/25 bg-violet-200/10 text-violet-100",
  },
  {
    title: "Signals",
    label: "Ambient",
    description:
      "Outer-world domains that matter without taking over the view.",
    placeholder: "Five low-priority signal rows will live here.",
    accentClassName: "border-amber-200/25 bg-amber-200/10 text-amber-100",
  },
];

export function CuratorView() {
  return (
    <section
      aria-label="Curator view"
      className="h-screen snap-y snap-mandatory overflow-y-auto bg-slate-950"
    >
      {curatorLayers.map((layer) => (
        <article
          key={layer.title}
          className="flex h-[100svh] snap-start snap-always items-center px-4 py-24 sm:px-6 lg:px-10"
        >
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
            <div className="flex flex-col gap-3">
              <Badge
                className={cn("w-fit border", layer.accentClassName)}
                variant="outline"
              >
                {layer.label}
              </Badge>
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-semibold text-white sm:text-5xl">
                  {layer.title}
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                  {layer.description}
                </p>
              </div>
            </div>

            {layer.title === "Party" ? (
              <PartyLayer people={curatorPartyPeople} />
            ) : (
              <Card className="border-white/10 bg-slate-900/70 text-slate-100">
                <CardHeader>
                  <CardTitle>{layer.title} layer</CardTitle>
                  <CardDescription className="text-slate-400">
                    Fixed viewport slice with vertical scroll snap.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={cn(
                      "rounded-lg border p-5 text-sm leading-6",
                      layer.accentClassName,
                    )}
                  >
                    {layer.placeholder}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </article>
      ))}
    </section>
  );
}
