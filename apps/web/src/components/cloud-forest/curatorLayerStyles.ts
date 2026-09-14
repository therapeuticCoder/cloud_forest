export type CuratorLayerLabel =
  | "Guilds"
  | "Holding"
  | "Party"
  | "Signals"
  | "Tribe";

export const layerBackgrounds: Record<CuratorLayerLabel, string> = {
  Guilds:
    "border-lime-100/20 bg-[radial-gradient(circle_at_18%_10%,rgba(190,242,100,0.2),transparent_28%),linear-gradient(180deg,#1d542d,#075985)] text-slate-100",
  Holding:
    "border-amber-100/15 bg-[radial-gradient(circle_at_85%_15%,rgba(120,53,15,0.28),transparent_26%),linear-gradient(180deg,#050403,#180b05_44%,#55260d)] text-stone-100",
  Party:
    "border-amber-100/20 bg-[radial-gradient(circle_at_82%_78%,rgba(74,130,58,0.5),transparent_36%),linear-gradient(180deg,#210d06,#4a210d_55%,#123a28)] text-stone-100",
  Signals:
    "border-slate-100/20 bg-[radial-gradient(circle_at_70%_18%,rgba(226,232,240,0.2),transparent_30%),linear-gradient(180deg,#475569,#0f172a)] text-slate-100",
  Tribe:
    "border-lime-100/15 bg-[radial-gradient(circle_at_82%_14%,rgba(163,230,53,0.2),transparent_26%),linear-gradient(180deg,#174c2d,#062e1d)] text-slate-100",
};

export const layerOuterBackgrounds: Record<CuratorLayerLabel, string> = {
  Guilds: "bg-[#0b5a68]",
  Holding: "bg-[#1b0c05]",
  Party: "bg-[#251006]",
  Signals: "bg-[#263b4a]",
  Tribe: "bg-[#0b3c25]",
};
