import { Layers3 } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { CuratorGuild } from "@/types/curator";

type GuildsLayerProps = {
  guilds: CuratorGuild[];
};

export function GuildsLayer({ guilds }: GuildsLayerProps) {
  return (
    <Accordion
      aria-label="Guild rows"
      className="flex flex-col gap-3"
      collapsible
      defaultValue={guilds[0]?.id}
      type="single"
    >
      {guilds.map((guild) => (
        <Card
          key={guild.id}
          aria-label={`${guild.name} guild row`}
          className="border-white/10 bg-slate-900/65 px-4 py-0 text-slate-100"
          role="article"
        >
          <AccordionItem className="border-0" value={guild.id}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-lg border border-violet-200/25 bg-violet-200/10 text-violet-100">
                  <Layers3 aria-hidden="true" className="size-4" />
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="truncate text-base font-medium text-slate-100">
                    {guild.name}
                  </span>
                  <span className="truncate text-xs text-slate-400">
                    {guild.recentActivity}
                  </span>
                </div>
              </div>
              <Badge
                className="ml-auto shrink-0 border-violet-200/25 bg-violet-200/10 text-violet-100"
                variant="outline"
              >
                {guild.memberCount} members
              </Badge>
            </AccordionTrigger>
            <AccordionContent className="pl-13 text-sm leading-6 text-slate-300">
              <p>{guild.description}</p>
              <p className="mt-2 text-slate-400">{guild.recentActivity}</p>
            </AccordionContent>
          </AccordionItem>
        </Card>
      ))}
    </Accordion>
  );
}
