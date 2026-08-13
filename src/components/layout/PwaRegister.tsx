"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const registerSw = () => {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
      navigator.serviceWorker.register(`${basePath}/sw.js`).catch(() => {
        // 登録失敗時もアプリ自体は動作させる
      });
    };

    // window の load イベントはこの effect が走るより先に発火している場合があるため、
    // 発火済みかどうかを readyState で確認してから登録する。
    if (document.readyState === "complete") {
      registerSw();
    } else {
      window.addEventListener("load", registerSw, { once: true });
      return () => window.removeEventListener("load", registerSw);
    }
  }, []);

  return null;
}
