export function ProgressBar({
  value,
  max,
  color,
  height = 10,
  showSegments = true,
}: {
  value: number;
  max: number;
  color: string;
  height?: number;
  showSegments?: boolean;
}) {
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  const segments = 20;
  const filledSegments = Math.round(pct * segments);

  return (
    <div
      className="rpg-panel-inset w-full overflow-hidden"
      style={{ height }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      {showSegments ? (
        <div className="flex h-full w-full gap-px p-px">
          {Array.from({ length: segments }).map((_, i) => (
            <div
              key={i}
              className="h-full flex-1"
              style={{ background: i < filledSegments ? color : "transparent" }}
            />
          ))}
        </div>
      ) : (
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${pct * 100}%`, background: color }}
        />
      )}
    </div>
  );
}
