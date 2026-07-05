import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CuratorPerson } from "@/types/curator";

type PartyLayerProps = {
  people: CuratorPerson[];
};

export function PartyLayer({ people }: PartyLayerProps) {
  return (
    <div
      aria-label="Party people"
      className="grid grid-cols-2 gap-3 md:grid-cols-3"
    >
      {people.map((person) => (
        <Card
          key={person.id}
          aria-label={`${person.displayName} party card`}
          className="min-h-36 border-white/10 bg-slate-900/70 text-slate-100"
          role="article"
        >
          <CardHeader className="gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="grid size-12 shrink-0 place-items-center rounded-lg border border-emerald-200/25 bg-emerald-200/10 text-sm font-semibold text-emerald-100">
                {person.initials}
              </div>
              <Badge
                className="border-emerald-200/25 bg-emerald-200/10 text-emerald-100"
                variant="outline"
              >
                Party
              </Badge>
            </div>
            <div className="flex flex-col gap-1">
              <CardTitle>{person.displayName}</CardTitle>
              <CardDescription className="text-slate-400">
                {person.relationshipNote}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-slate-300">
              {person.recentStatus}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
