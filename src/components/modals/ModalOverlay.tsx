import type { ReactNode } from "react";

export function ModalOverlay({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4 rpg-flash-in">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
