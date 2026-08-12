import type { ReactNode } from "react";

export function RetroPanel({
  title,
  children,
  className = "",
  contentClassName = "",
}: {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <div className={`rpg-panel ${className}`}>
      {title && (
        <div className="flex items-center justify-center gap-2 border-b-2 border-rpg-border px-3 py-2">
          <span className="text-rpg-accent">◆</span>
          <h2 className="font-pixel text-[11px] tracking-widest text-rpg-text">{title}</h2>
          <span className="text-rpg-accent">◆</span>
        </div>
      )}
      <div className={`p-3 ${contentClassName}`}>{children}</div>
    </div>
  );
}

export function RetroDivider() {
  return <div className="my-3 h-px w-full bg-rpg-border-dim" style={{
    backgroundImage: "repeating-linear-gradient(to right, var(--rpg-border-dim) 0 4px, transparent 4px 8px)",
    backgroundColor: "transparent",
  }} />;
}
