import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import HeadersEditor from "./HeadersEditor";
import ResponseViewer from "./ResponseViewer";
import TracingPanel from "./TracingPanel";
import NetworkMetrics from "./NetworkMetrics";
import { Loader2, Send, Save } from "lucide-react";

interface Header {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

interface ResponseData {
  status: number;
  statusText: string;
  body: string;
  headers: Record<string, string>;
  time: number;
  size: number;
}

interface TraceSpan {
  name: string;
  duration: number;
  offset: number;
  color: string;
}

const METHODS = ["GET", "POST", "PUT", "DELETE"] as const;
const REQUEST_TABS = ["Params", "Headers", "Body", "Auth", "Tests"] as const;

function generateTraceId() {
  const hex = (n: number) =>
    Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  return { traceId: hex(32), spanId: hex(16) };
}

const RequestPanel = () => {
  const [method, setMethod] = useState<(typeof METHODS)[number]>("GET");
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/users/1");
  const [headers, setHeaders] = useState<Header[]>([
    { id: "1", key: "Authorization", value: "Bearer abc123", enabled: true },
    { id: "2", key: "Content-Type", value: "application/json", enabled: true },
  ]);
  const [activeTab, setActiveTab] = useState<(typeof REQUEST_TABS)[number]>("Headers");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [tracingDetected, setTracingDetected] = useState(false);
  const [hasSent, setHasSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [traceContext, setTraceContext] = useState<{ traceId: string; spanId: string } | null>(null);
  const [traceSpans, setTraceSpans] = useState<TraceSpan[]>([]);

  const sendRequest = async () => {
    setLoading(true);
    setError(null);
    setHasSent(true);

    let requestUrl: URL;
    try {
      requestUrl = new URL(url.trim());
      if (!["http:", "https:"].includes(requestUrl.protocol)) {
        throw new Error("Only HTTP and HTTPS URLs are supported.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Enter a valid request URL.";
      setTracingDetected(false);
      setResponse({
        status: 0,
        statusText: "Invalid URL",
        body: message,
        headers: {},
        time: 0,
        size: 0,
      });
      setError(message);
      setLoading(false);
      return;
    }

    const { traceId, spanId } = generateTraceId();
    const traceparent = `00-${traceId}-${spanId}-01`;
    setTraceContext({ traceId, spanId });
    setTraceSpans([]);

    const reqHeaders: Record<string, string> = {};
    headers.forEach((h) => {
      const key = h.key.trim();
      if (h.enabled && key) reqHeaders[key] = h.value;
    });
    reqHeaders["traceparent"] = traceparent;

    const startTime = performance.now();

    try {
      const fetchOptions: RequestInit = {
        method,
        headers: reqHeaders,
      };
      if (method !== "GET" && body) {
        fetchOptions.body = body;
      }

      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: requestUrl.toString(),
          method,
          headers: reqHeaders,
          body: fetchOptions.body,
        }),
      });
      const endTime = performance.now();
      const proxyText = await res.text();
      let proxyResponse: {
        status?: number;
        statusText?: string;
        body?: string;
        headers?: Record<string, string>;
        error?: string;
      };
      try {
        proxyResponse = JSON.parse(proxyText);
      } catch {
        throw new Error(`The local proxy returned an invalid response (HTTP ${res.status}).`);
      }
      if (!res.ok || proxyResponse.error || proxyResponse.status === undefined) {
        throw new Error(proxyResponse.error || `The proxy could not complete the request for ${requestUrl.hostname}.`);
      }
      const responseBody = proxyResponse.body ?? "";
      const resHeaders = proxyResponse.headers ?? {};
      const responseTraceparent = resHeaders["traceparent"];
      const traceparentParts = responseTraceparent?.split("-");
      if (traceparentParts?.length === 4 && traceparentParts[1] && traceparentParts[2]) {
        setTraceContext({ traceId: traceparentParts[1], spanId: traceparentParts[2] });
      }
      const serverTiming = resHeaders["server-timing"] ?? "";
      const parsedSpans: TraceSpan[] = serverTiming
        .split(",")
        .map((entry) => {
          const [namePart, ...parameters] = entry.trim().split(";");
          const durationParameter = parameters.find((parameter) => parameter.trim().startsWith("dur="));
          const duration = Number(durationParameter?.trim().slice(4));
          return {
            name: namePart.trim(),
            duration: Number.isFinite(duration) ? duration : 0,
            offset: 0,
            color: "hsl(216, 85%, 50%)",
          };
        })
        .filter((span) => span.name && span.duration > 0);
      setTraceSpans(parsedSpans);

      const hasTracing =
        !!resHeaders["traceparent"] ||
        parsedSpans.length > 0 ||
        !!resHeaders["traceresponse"];

      setTracingDetected(hasTracing);
      setResponse({
        status: proxyResponse.status,
        statusText: proxyResponse.statusText || "OK",
        body: responseBody,
        headers: resHeaders,
        time: Math.round(endTime - startTime),
        size: new Blob([responseBody]).size,
      });
    } catch (err) {
      const endTime = performance.now();
      const message =
        err instanceof TypeError && err.message === "Failed to fetch"
          ? "The local API proxy is unavailable. Restart the app with `npm run dev` and try again."
          : err instanceof Error
          ? err.message
          : "Failed to fetch";
      setTracingDetected(false);
      setResponse({
        status: 0,
        statusText: "Request Failed",
        body: message,
        headers: {},
        time: Math.round(endTime - startTime),
        size: 0,
      });
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const methodColors: Record<string, string> = {
    GET: "text-status-success",
    POST: "text-primary",
    PUT: "text-status-warning",
    DELETE: "text-status-error",
  };

  return (
    <div className="space-y-6">
      {/* Request Panel */}
      <div className="bg-card rounded-2xl shadow-md overflow-hidden">
        <div className="bg-panel-header text-panel-header-foreground px-5 py-3 text-sm font-semibold">
          Request Panel
        </div>

        <div className="p-5">
          {/* URL Bar */}
          <div className="flex gap-2 mb-4">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className={`px-3 py-2 bg-muted rounded-lg font-semibold text-sm border border-border ${methodColors[method]}`}
            >
              {METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter request URL"
              className="flex-1 font-mono text-sm"
            />
            <Button
              onClick={sendRequest}
              disabled={loading}
              className="px-6 font-semibold"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4 mr-2" /> Send</>}
            </Button>
            <Button variant="outline" className="px-6 font-semibold">
              <Save className="h-4 w-4 mr-2" /> Save
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex border-b mb-4">
            {REQUEST_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}{tab === "Headers" ? ` (${headers.length})` : ""}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "Headers" && (
            <HeadersEditor headers={headers} onChange={setHeaders} />
          )}
          {activeTab === "Params" && (
            <p className="text-sm text-muted-foreground py-4">Query parameters will be appended to the URL.</p>
          )}
          {activeTab === "Body" && (
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder='{"key": "value"}'
              className="w-full h-32 font-mono text-sm p-3 bg-muted rounded-lg border border-border resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          )}
          {activeTab === "Auth" && (
            <p className="text-sm text-muted-foreground py-4">Configure authentication via the Headers tab.</p>
          )}
          {activeTab === "Tests" && (
            <p className="text-sm text-muted-foreground py-4">Write test scripts to validate responses (coming soon).</p>
          )}
        </div>
      </div>

      {/* Response Panel */}
      {hasSent && (
        <div className="bg-card rounded-2xl shadow-md overflow-hidden">
          <div className="flex items-center justify-between bg-panel-header text-panel-header-foreground px-5 py-3">
            <span className="text-sm font-semibold">Response</span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {error && (
                <div className="mx-5 mt-4 rounded-lg border border-status-error/30 bg-status-error/10 px-3 py-2 text-sm text-status-error">
                  {error}
                </div>
              )}
              <ResponseViewer response={response} />
            </>
          )}
        </div>
      )}

      {/* Tracing Panel */}
      {hasSent && !loading && (
        <>
          {response && response.status > 0 && <NetworkMetrics totalDuration={response.time} />}
          <TracingPanel
            tracingDetected={tracingDetected}
            requestTime={response && response.status > 0 ? response.time : null}
            traceId={traceContext?.traceId ?? null}
            spanId={traceContext?.spanId ?? null}
            spans={traceSpans}
          />
        </>
      )}

      {/* Empty State */}
      {!hasSent && (
        <div className="bg-card rounded-2xl shadow-md p-12 text-center">
          <h3 className="text-lg font-semibold text-foreground">Ready to test</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Enter a URL and click Send to make your first request
          </p>
        </div>
      )}
    </div>
  );
};

export default RequestPanel;
