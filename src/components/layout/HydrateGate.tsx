"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/lib/data/store";

export function HydrateGate({ children }: { children: React.ReactNode }) {
  const hasHydrated = useGameStore((s) => s.hasHydrated);
  const [dots, setDots] = useState(1);

  useEffect(() => {
    useGameStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (hasHydrated) return;
    const t = setInterval(() => setDots((d) => (d % 3) + 1), 400);
    return () => clearInterval(t);
  }, [hasHydrated]);

  if (!hasHydrated) {
    return (
      <div className="flex h-full min-h-dvh w-full flex-col items-center justify-center gap-6 bg-rpg-bg px-8">
        <div className="font-pixel text-xs tracking-widest text-rpg-accent">人生クエスト</div>
        <div className="h-24 w-24 rpg-panel flex items-center justify-center text-3xl">✦</div>
        <div className="font-pixel text-[10px] text-rpg-text-dim">
          NOW LOADING{".".repeat(dots)}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
