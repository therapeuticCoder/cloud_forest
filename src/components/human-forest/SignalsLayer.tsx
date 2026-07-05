import {
  Building2,
  Clapperboard,
  FlaskConical,
  Music2,
  RadioTower,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { CuratorSignal, CuratorSignalCategory } from "@/types/curator";

type SignalsLayerProps = {
  signals: CuratorSignal[];
};

const categoryIcons: Record<CuratorSignalCategory, typeof Building2> = {
  art: RadioTower,
  film: Clapperboard,
  "local-civic": Building2,
  music: Music2,
  politics: Building2,
  science: FlaskConical,
  technology: RadioTower,
};

export function SignalsLayer({ signals }: SignalsLayerProps) {
  return (
    <Accordion
      aria-label="Signal rows"
      className="flex flex-col gap-3"
      collapsible
      defaultValue={signals[0]?.id}
      type="single"
    >
      {signals.map((signal) => {
        const SignalIcon = categoryIcons[signal.category];

        return (
          <Card
            key={signal.id}
            aria-label={`${signal.name} signal row`}
            className="border-white/10 bg-slate-900/45 px-4 py-0 text-slate-100"
            role="article"
          >
            <AccordionItem className="border-0" value={signal.id}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-amber-200/20 bg-amber-200/10 text-amber-100">
                    <SignalIcon aria-hidden="true" className="size-4" />
                  </div>
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="truncate text-sm font-medium text-slate-100">
                      {signal.name}
                    </span>
                    <span className="truncate text-xs text-slate-500">
                      {signal.recentActivity}
                    </span>
                  </div>
                </div>
                <Badge
                  className="ml-auto shrink-0 border-amber-200/20 bg-amber-200/10 text-amber-100"
                  variant="outline"
                >
                  {signal.domain}
                </Badge>
              </AccordionTrigger>
              <AccordionContent className="pl-12 text-sm leading-6 text-slate-400">
                <p>{signal.description}</p>
                <p className="mt-2 text-slate-500">{signal.recentActivity}</p>
              </AccordionContent>
            </AccordionItem>
          </Card>
        );
      })}
    </Accordion>
  );
}
