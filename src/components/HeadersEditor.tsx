import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";

interface Header {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

interface HeadersEditorProps {
  headers: Header[];
  onChange: (headers: Header[]) => void;
}

const HeadersEditor = ({ headers, onChange }: HeadersEditorProps) => {
  const addHeader = () => {
    onChange([
      ...headers,
      { id: crypto.randomUUID(), key: "", value: "", enabled: true },
    ]);
  };

  const removeHeader = (id: string) => {
    onChange(headers.filter((h) => h.id !== id));
  };

  const updateHeader = (id: string, field: "key" | "value", val: string) => {
    onChange(headers.map((h) => (h.id === id ? { ...h, [field]: val } : h)));
  };

  const clearAll = () => onChange([]);

  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-muted-foreground">
            <th className="text-left py-2 px-3 w-10 font-medium">#</th>
            <th className="text-left py-2 px-3 font-medium">Key</th>
            <th className="text-left py-2 px-3 font-medium">Value</th>
            <th className="w-10"></th>
          </tr>
        </thead>
        <tbody>
          {headers.map((header, i) => (
            <tr key={header.id} className="border-b hover:bg-muted/50">
              <td className="py-2 px-3 text-muted-foreground">{i + 1}</td>
              <td className="py-1 px-2">
                <Input
                  value={header.key}
                  onChange={(e) => updateHeader(header.id, "key", e.target.value)}
                  placeholder="Header name"
                  className="border-0 bg-transparent shadow-none h-8 font-mono text-sm"
                />
              </td>
              <td className="py-1 px-2">
                <Input
                  value={header.value}
                  onChange={(e) => updateHeader(header.id, "value", e.target.value)}
                  placeholder="Value"
                  className="border-0 bg-transparent shadow-none h-8 font-mono text-sm"
                />
              </td>
              <td className="py-1 px-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => removeHeader(header.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-4 mt-3 px-3">
        <button
          onClick={addHeader}
          className="text-sm font-medium text-primary flex items-center gap-1 hover:underline"
        >
          <Plus className="h-4 w-4" /> Add Header
        </button>
        <button
          onClick={clearAll}
          className="text-sm font-medium text-primary hover:underline"
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

export default HeadersEditor;
