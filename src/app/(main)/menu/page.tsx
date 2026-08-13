"use client";

import Link from "next/link";
import { RetroPanel } from "@/components/ui/RetroPanel";
import { CommandRow } from "@/components/ui/PixelButton";
import { useCharacter, useCurrentTitle, useJob } from "@/hooks/useGame";

const MENU_ITEMS = [
  { href: "/quests", icon: "📜", label: "クエスト", sub: "デイリー・ウィークリーの目標" },
  { href: "/journal", icon: "📖", label: "冒険日誌", sub: "過去の行動記録をふりかえる" },
  { href: "/titles", icon: "🏅", label: "称号", sub: "獲得した称号の一覧" },
  { href: "/job", icon: "🛡", label: "職業", sub: "現在の職業とランク" },
  { href: "/game/equipment", icon: "🗡", label: "そうび", sub: "ゲーム内の装備を管理する" },
  { href: "/game/items", icon: "🎒", label: "どうぐ", sub: "所持アイテムとゴールド" },
  { href: "/settings", icon: "⚙", label: "設定", sub: "データの管理など" },
] as const;

export default function MenuPage() {
  const character = useCharacter();
  const job = useJob();
  const title = useCurrentTitle();

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-center font-pixel text-[12px] tracking-widest text-rpg-accent">◆ メニュー ◆</h1>

      <RetroPanel>
        <p className="text-center font-pixel text-sm text-rpg-text">{character.name}</p>
        <p className="mt-1 text-center text-[11px] text-rpg-accent">
          Lv.{character.level}　{title.name}
        </p>
        <p className="text-center text-[11px] text-rpg-text-dim">{job.name}</p>
      </RetroPanel>

      <RetroPanel contentClassName="p-0">
        <div className="px-3">
          {MENU_ITEMS.map((item) => (
            <Link key={item.href} href={item.href}>
              <CommandRow icon={item.icon} label={item.label} sub={item.sub} />
            </Link>
          ))}
        </div>
      </RetroPanel>
    </div>
  );
}
