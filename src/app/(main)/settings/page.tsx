"use client";

import { useState } from "react";
import { RetroPanel, RetroDivider } from "@/components/ui/RetroPanel";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { PixelButton } from "@/components/ui/PixelButton";
import { useGameStore } from "@/lib/data/store";

export default function SettingsPage() {
  const resetDemo = useGameStore((s) => s.resetDemo);
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <ScreenHeader title="設定" />

      <RetroPanel title="アプリについて">
        <p className="text-[12px] leading-relaxed text-rpg-text-dim">
          人生クエストは、日々の行動を記録するとEXPを獲得し、キャラクターが成長していくライフログRPGです。
          記録データはこの端末内(localStorage)に保存されます。
        </p>
      </RetroPanel>

      <RetroPanel title="ホーム画面に追加">
        <p className="text-[12px] leading-relaxed text-rpg-text-dim">
          ブラウザの「共有」または「メニュー」から「ホーム画面に追加」を選ぶと、アプリのように起動できます。
        </p>
      </RetroPanel>

      <RetroPanel title="データ管理">
        {!confirming ? (
          <PixelButton className="w-full" onClick={() => setConfirming(true)}>
            デモデータに リセットする
          </PixelButton>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-center text-[12px] text-rpg-danger">
              すべての記録が消えて、はじめの状態にもどります。よろしいですか？
            </p>
            <RetroDivider />
            <div className="flex gap-2">
              <PixelButton variant="ghost" className="flex-1" onClick={() => setConfirming(false)}>
                キャンセル
              </PixelButton>
              <PixelButton
                className="flex-1"
                onClick={() => {
                  resetDemo();
                  setConfirming(false);
                }}
              >
                リセットする
              </PixelButton>
            </div>
          </div>
        )}
      </RetroPanel>
    </div>
  );
}
