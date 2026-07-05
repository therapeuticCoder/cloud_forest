import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CuratorNeighborhood } from "@/types/curator";

type TribeLayerProps = {
  neighborhoods: CuratorNeighborhood[];
};

export function TribeLayer({ neighborhoods }: TribeLayerProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Tribe pages">
        {neighborhoods.map((neighborhood, index) => (
          <Badge
            key={neighborhood.id}
            className="shrink-0 border-cyan-200/25 bg-cyan-200/10 text-cyan-100"
            variant="outline"
          >
            {index + 1}. {neighborhood.name}
          </Badge>
        ))}
      </div>

      <div
        aria-label="Tribe neighborhoods"
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3"
      >
        {neighborhoods.map((neighborhood) => (
          <section
            key={neighborhood.id}
            aria-label={`${neighborhood.name} neighborhood`}
            className="min-w-full snap-start"
          >
            <Card className="border-white/10 bg-slate-900/60 text-slate-100">
              <CardHeader className="gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <CardTitle>{neighborhood.name}</CardTitle>
                    <CardDescription className="max-w-2xl text-slate-400">
                      {neighborhood.description}
                    </CardDescription>
                  </div>
                  <Badge
                    className="shrink-0 border-cyan-200/25 bg-cyan-200/10 text-cyan-100"
                    variant="outline"
                  >
                    {neighborhood.people.length} people
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6">
                  {neighborhood.people.map((person) => (
                    <Card
                      key={person.id}
                      aria-label={`${person.displayName} tribe card`}
                      className="min-h-20 gap-2 border-white/10 bg-slate-950/45 py-2 text-slate-100"
                      role="article"
                    >
                      <CardContent className="flex flex-col gap-2 px-2">
                        <div className="grid size-8 place-items-center rounded-md border border-cyan-200/20 bg-cyan-200/10 text-xs font-medium text-cyan-100">
                          {person.initials}
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="truncate text-xs font-medium text-slate-100">
                            {person.displayName}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {person.recentStatus}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        ))}
      </div>
    </div>
  );
}
