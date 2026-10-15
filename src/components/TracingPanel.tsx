import TimelineBar from "./TimelineBar";
import { AlertTriangle } from "lucide-react";

interface TracingPanelProps {
  tracingDetected: boolean;
  requestTime: number | null;
  traceId: string | null;
  spanId: string | null;
  spans: Array<{ name: string; duration: number; offset: number; color: string }>;
}

const TracingPanel = ({ tracingDetected, requestTime, traceId, spanId, spans }: TracingPanelProps) => {
  const showTracing = requestTime !== null;
  const displaySpans = [
    {
      name: "Client Request",
      duration: requestTime ?? 0,
      offset: 0,
      color: "hsl(142, 60%, 45%)",
    },
    ...spans,
  ];

  return (
    <div className="bg-card rounded-2xl shadow-md overflow-hidden">
      <div className="bg-panel-header text-panel-header-foreground px-5 py-3 text-sm font-semibold">
        Tracing Panel
      </div>
      <div className="p-5">
        {showTracing ? (
          <>
            <div className="mb-4 flex flex-wrap gap-4 font-mono text-xs text-muted-foreground">
              <span>Trace ID: {traceId ?? "unavailable"}</span>
              <span>Span ID: {spanId ?? "unavailable"}</span>
            </div>
            {!tracingDetected && (
              <div className="rounded-xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                Only the client request timing is available. The API did not return trace spans or Server-Timing data.
              </div>
            )}
            <TimelineBar spans={displaySpans} totalDuration={Math.max(requestTime ?? 300, 300, 1)} />
          </>
        ) : (
          <div className="flex items-start gap-3 py-6 px-4 bg-muted/50 rounded-xl">
            <AlertTriangle className="h-5 w-5 text-status-warning mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground text-sm">Distributed tracing unavailable</p>
              <p className="text-sm text-muted-foreground mt-1">
                Distributed tracing is unavailable because this API did not expose trace spans. Instrument the API with OpenTelemetry and return trace data through the proxy.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TracingPanel;
