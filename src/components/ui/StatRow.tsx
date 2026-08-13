import { STAT_LABEL_JA, type StatKey } from "@/lib/data/types";
import { ProgressBar } from "@/components/ui/ProgressBar";

const STAT_COLOR: Record<StatKey, string> = {
  str: "var(--rpg-str)",
  agi: "var(--rpg-agi)",
  vit: "var(--rpg-vit)",
  int: "var(--rpg-int)",
  tech: "var(--rpg-tech)",
  cha: "var(--rpg-cha)",
  luk: "var(--rpg-luk)",
};

export { STAT_COLOR };

export function StatRow({ stat, value, max = 60 }: { stat: StatKey; value: number; max?: number }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="w-[72px] shrink-0 text-[12px] text-rpg-text-dim">{STAT_LABEL_JA[stat]}</span>
      <span className="w-7 shrink-0 text-right font-pixel text-[11px] text-rpg-text">{value}</span>
      <ProgressBar value={value} max={max} color={STAT_COLOR[stat]} height={8} />
    </div>
  );
}
