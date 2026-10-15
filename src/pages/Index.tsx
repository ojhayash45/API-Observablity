import { useEffect, useState } from "react";
import RequestPanel from "@/components/RequestPanel";
import { Activity, Moon, Sun } from "lucide-react";

const Index = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("api-tracing-theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("api-tracing-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <header className="border-b border-border bg-card/95 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <Activity className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">API-Tracing</h1>
            <p className="text-[11px] text-muted-foreground">Request observability workspace</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-xs font-mono text-muted-foreground">v1.0.0</span>
          <button
            type="button"
            onClick={() => setDarkMode((current) => !current)}
            aria-label={darkMode ? "Switch to light theme" : "Switch to dark theme"}
            className="flex items-center gap-2 rounded-lg border border-border bg-muted/60 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span>{darkMode ? "Light" : "Dark"}</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] p-4 lg:p-6">
        <section className="min-w-0">
          <RequestPanel />
        </section>
      </main>
    </div>
  );
};

export default Index;
