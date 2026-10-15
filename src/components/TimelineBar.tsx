interface Span {
  name: string;
  duration: number;
  offset: number;
  color: string;
}

interface TimelineBarProps {
  spans: Span[];
  totalDuration: number;
}

const TimelineBar = ({ spans, totalDuration }: TimelineBarProps) => {
  const ticks = [0, 100, 200, 300].filter((t) => t <= totalDuration + 50);

  return (
    <div className="mt-4">
      {/* Timeline header */}
      <div className="flex items-end mb-2">
        <div className="w-52 text-sm font-semibold text-foreground">API Trace Overview</div>
        <div className="flex-1 relative h-6">
          {ticks.map((tick) => (
            <span
              key={tick}
              className="absolute text-xs text-muted-foreground"
              style={{ left: `${(tick / (totalDuration + 50)) * 100}%` }}
            >
              {tick} ms
            </span>
          ))}
        </div>
      </div>

      {/* Spans */}
      <div className="space-y-2">
        {spans.map((span, i) => (
          <div key={i} className="flex items-center">
            <div className="w-52 text-sm text-foreground truncate">
              <span className="flex items-center gap-1">
                <span className="text-muted-foreground">▶</span> {span.name}: <span className="font-medium">{span.duration} ms</span>
              </span>
            </div>
            <div className="flex-1 relative h-7">
              <div
                className="absolute h-full rounded-md flex items-center justify-end pr-2 text-xs font-semibold shadow-sm"
                style={{
                  left: `${(span.offset / (totalDuration + 50)) * 100}%`,
                  width: `${(span.duration / (totalDuration + 50)) * 100}%`,
                  backgroundColor: span.color,
                  color: "white",
                }}
              >
                {span.duration} ms
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-1">
        {spans.map((span, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-foreground">
            <span className="text-muted-foreground">▶</span>
            <span>{span.name}</span>
            <span className="text-muted-foreground">{span.duration} ms</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineBar;
