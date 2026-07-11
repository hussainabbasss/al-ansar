type WeeklyLoadChartProps = {
  days: {
    day: string;
    /** Bar fill as 0–100 of the chart track. */
    height: number;
    highlight: false | "primary" | "secondary";
    /** Optional kcal for accessibility. */
    value?: number;
  }[];
};

export function WeeklyLoadChart({ days }: WeeklyLoadChartProps) {
  return (
    <div
      className="mt-4 flex h-36 justify-between gap-2"
      role="img"
      aria-label="Calories burned by day"
    >
      {days.map((d) => {
        const barClass =
          d.highlight === "primary"
            ? "bg-primary"
            : d.highlight === "secondary"
              ? "bg-secondary"
              : "bg-surface-variant";
        const labelClass =
          d.highlight === "primary"
            ? "text-primary"
            : d.highlight === "secondary"
              ? "text-secondary"
              : "text-on-surface-variant";

        const clamped = Math.min(100, Math.max(0, d.height));
        const valueLabel =
          typeof d.value === "number" ? `${d.value} kcal` : undefined;

        return (
          <div
            key={d.day}
            className="flex h-full min-w-0 flex-1 flex-col items-center gap-2"
          >
            <div className="flex w-full flex-1 items-end">
              <div
                className={`w-full rounded-t-sm ${barClass} transition-[height] duration-300 ease-out`}
                style={{ height: `${clamped}%` }}
                title={valueLabel}
                aria-label={
                  valueLabel ? `${d.day}: ${valueLabel}` : undefined
                }
              />
            </div>
            <span className={`font-label text-[10px] ${labelClass}`}>
              {d.day}
            </span>
          </div>
        );
      })}
    </div>
  );
}
