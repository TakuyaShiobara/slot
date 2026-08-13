"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// output: "export" では next/navigation の redirect() をサーバー側で解決できないため、
// クライアント側でホームへ遷移させる。
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/home");
  }, [router]);

  return null;
}
