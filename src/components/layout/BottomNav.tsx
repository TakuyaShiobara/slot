"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/home", label: "ホーム", icon: "🏠" },
  { href: "/adventure", label: "ぼうけん", icon: "⚔" },
  { href: "/stats", label: "のうりょく", icon: "📊" },
  { href: "/skills", label: "スキル", icon: "✨" },
  { href: "/game", label: "ゲーム", icon: "🎮" },
  { href: "/menu", label: "メニュー", icon: "≡" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-rpg-border bg-black">
      <div className="mx-auto flex max-w-md">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-center ${
                active ? "text-rpg-accent" : "text-rpg-text-dim"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span className="font-pixel text-[8px] leading-none tracking-tight">{item.label}</span>
              <span className={`mt-0.5 h-0.5 w-4 ${active ? "bg-rpg-accent" : "bg-transparent"}`} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
