import { useState } from "react";

interface BeforeAfterSliderProps {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export const BeforeAfterSlider = ({ before, after, beforeLabel = "Antes", afterLabel = "Después" }: BeforeAfterSliderProps) => {
  const [position, setPosition] = useState(55);

  return (
    <div className="space-y-4">
      <div className="relative w-full overflow-hidden rounded-xl border border-border bg-background/80 shadow-inner aspect-[4/5]">
        <img src={after} alt={afterLabel} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
          <img src={before} alt={beforeLabel} className="h-full w-full object-cover" />
        </div>

        <div
          className="absolute top-0 bottom-0 w-[3px] bg-primary/80"
          style={{ left: `calc(${position}% - 1.5px)` }}
          aria-hidden="true"
        />
        <div
          className="absolute top-1/2 h-10 w-10 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-primary bg-background/80 shadow flex items-center justify-center text-xs font-semibold text-primary"
          style={{ left: `${position}%` }}
        >
          ↔
        </div>

        <span className="absolute left-4 top-4 rounded-full bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {beforeLabel}
        </span>
        <span className="absolute right-4 bottom-4 rounded-full bg-primary/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground">
          {afterLabel}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
        className="w-full cursor-pointer accent-primary"
        aria-label="Comparar resultado antes y después"
      />
    </div>
  );
};

