import { BottomNav } from "@/components/layout/BottomNav";
import { PendingResultModal } from "@/components/modals/PendingResultModal";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-rpg-bg rpg-scanlines">
      <main className="flex-1 overflow-y-auto px-3 pb-24 pt-3">{children}</main>
      <BottomNav />
      <PendingResultModal />
    </div>
  );
}
