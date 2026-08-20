import { Sprout } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function CuratorPlaceholderView() {
  return (
    <section
      aria-label="Curator view"
      className="grid min-h-screen place-items-center p-4 sm:p-6"
    >
      <Card className="max-w-2xl border-white/10 bg-slate-950/55 text-slate-100">
        <CardHeader>
          <div className="mb-2 grid h-10 w-10 place-items-center rounded-lg border border-emerald-200/25 bg-emerald-200/10 text-emerald-100">
            <Sprout aria-hidden="true" className="h-5 w-5" />
          </div>
          <CardTitle>Curator</CardTitle>
          <CardDescription className="text-slate-400">
            A layered relationship view is next. This placeholder keeps the
            navigation ready without building the Curator stack early.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-slate-300">
            The full Curator view will organize Party, Tribe, Guilds, and
            Signals in separate vertical layers.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
