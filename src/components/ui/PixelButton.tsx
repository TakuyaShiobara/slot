import type { ButtonHTMLAttributes, ReactNode } from "react";

export function PixelButton({
  children,
  variant = "default",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "default" | "accent" | "ghost";
}) {
  const base =
    "font-pixel text-[11px] tracking-wide px-3 py-2.5 border-2 transition-colors active:translate-y-px disabled:opacity-40 disabled:pointer-events-none";
  const variants: Record<string, string> = {
    default: "border-rpg-border bg-rpg-panel text-rpg-text hover:bg-rpg-panel-alt",
    accent: "border-rpg-accent bg-rpg-panel text-rpg-accent hover:bg-rpg-panel-alt",
    ghost: "border-rpg-border-dim bg-transparent text-rpg-text-dim hover:text-rpg-text hover:border-rpg-border",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function CommandRow({
  icon,
  label,
  sub,
  onClick,
  disabled,
}: {
  icon?: ReactNode;
  label: string;
  sub?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group flex w-full items-center gap-2 border-b border-rpg-border-dim/60 py-2.5 text-left last:border-b-0 disabled:opacity-40"
    >
      <span className="w-4 shrink-0 text-rpg-accent opacity-0 group-hover:opacity-100 group-active:opacity-100">
        ▶
      </span>
      {icon && <span className="shrink-0 text-base leading-none">{icon}</span>}
      <span className="flex-1 min-w-0">
        <span className="block text-[13px] text-rpg-text">{label}</span>
        {sub && <span className="block text-[11px] text-rpg-text-dim">{sub}</span>}
      </span>
    </button>
  );
}
