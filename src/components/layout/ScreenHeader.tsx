"use client";

import Link from "next/link";

export function ScreenHeader({ title, backHref = "/menu" }: { title: string; backHref?: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Link
        href={backHref}
        className="font-pixel text-[10px] text-rpg-text-dim hover:text-rpg-text px-2 py-1 border border-rpg-border-dim"
      >
        ◀ もどる
      </Link>
      <h1 className="flex-1 text-center font-pixel text-[12px] tracking-widest text-rpg-accent">
        ◆ {title} ◆
      </h1>
      <span className="w-[52px]" />
    </div>
  );
}
