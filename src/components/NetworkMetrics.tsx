interface NetworkMetricsProps {
  totalDuration: number;
}

const METRICS = [
  { name: "DNS", ratio: 0.05, color: "hsl(216, 85%, 50%)" },
  { name: "TCP", ratio: 0.1, color: "hsl(216, 85%, 50%)" },
  { name: "TLS", ratio: 0.15, color: "hsl(216, 85%, 50%)" },
  { name: "TTFB", ratio: 0.42, color: "hsl(216, 85%, 50%)" },
  { name: "Download", ratio: 0.22, color: "hsl(216, 85%, 50%)" },
];

const NetworkMetrics = ({ totalDuration }: NetworkMetricsProps) => {
  const duration = Math.max(totalDuration, 1);
  const values = METRICS.map((metric) => ({
    ...metric,
    value: Math.max(1, Math.round(duration * metric.ratio)),
  }));
  const maximum = Math.max(...values.map((metric) => metric.value), duration);

  return (
    <div className="bg-card rounded-2xl shadow-md overflow-hidden">
      <div className="bg-panel-header text-panel-header-foreground px-5 py-3 text-sm font-semibold">
        Network Metrics
      </div>
      <div className="p-5 space-y-2">
        {values.map((metric) => (
          <div key={metric.name} className="flex items-center gap-3 text-sm">
            <span className="w-16 text-muted-foreground">{metric.name}</span>
            <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(4, (metric.value / maximum) * 100)}%`,
                  backgroundColor: metric.color,
                }}
              />
            </div>
            <span className="w-14 text-right text-muted-foreground">{metric.value} ms</span>
          </div>
        ))}
        <div className="flex items-center gap-3 pt-1 text-sm font-semibold">
          <span className="w-16 text-foreground">Total</span>
          <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
            <div className="h-full w-full rounded-full bg-primary" />
          </div>
          <span className="w-14 text-right text-foreground">{Math.round(duration)} ms</span>
        </div>
      </div>
    </div>
  );
};

export default NetworkMetrics;
