import { useState } from "react";

interface ResponseViewerProps {
  response: {
    status: number;
    statusText: string;
    body: string;
    headers: Record<string, string>;
    time: number;
    size: number;
  } | null;
}

const tabs = ["Pretty", "Raw", "Headers", "Timing"] as const;

const ResponseViewer = ({ response }: ResponseViewerProps) => {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Pretty");

  if (!response) return null;

  const statusColor =
    response.status >= 200 && response.status < 300
      ? "text-status-success"
      : response.status >= 400
      ? "text-status-error"
      : "text-status-warning";

  const prettyJson = (() => {
    try {
      return JSON.stringify(JSON.parse(response.body), null, 2);
    } catch {
      return response.body;
    }
  })();

  return (
    <div>
      <div className="flex items-center justify-between border-b px-1">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 text-sm pr-3">
          <span>
            Status: <span className={`font-semibold ${statusColor}`}>{response.status} {response.statusText}</span>
          </span>
          <span>
            Time: <span className="font-semibold">{response.time} ms</span>
          </span>
          <span>
            Size: <span className="font-semibold">{response.size} B</span>
          </span>
        </div>
      </div>

      <div className="p-4 max-h-64 overflow-auto">
        {activeTab === "Pretty" && (
          <pre className="font-mono text-sm text-foreground whitespace-pre-wrap">{prettyJson}</pre>
        )}
        {activeTab === "Raw" && (
          <pre className="font-mono text-sm text-muted-foreground whitespace-pre-wrap">{response.body}</pre>
        )}
        {activeTab === "Headers" && (
          <div className="space-y-1">
            {Object.entries(response.headers).map(([k, v]) => (
              <div key={k} className="font-mono text-sm">
                <span className="text-primary font-medium">{k}</span>: <span className="text-foreground">{v}</span>
              </div>
            ))}
          </div>
        )}
        {activeTab === "Timing" && (
          <div className="text-sm text-muted-foreground">
            Total request time: <span className="font-semibold text-foreground">{response.time} ms</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponseViewer;
