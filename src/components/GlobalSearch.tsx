import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input"; // Your existing component
import { cn } from "@/lib/utils";

interface GlobalSearchProps {
  data: any[]; // The list of cases/lawyers/etc.
  searchKeys: string[]; // e.g., ["title", "id", "name"]
  onResults: (filtered: any[]) => void; // Sends results back to the dashboard
  placeholder?: string;
  className?: string;
}

export function GlobalSearch({ 
  data, 
  searchKeys, 
  onResults, 
  placeholder = "Search...", 
  className 
}: GlobalSearchProps) {
  const [query, setQuery] = React.useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (!value.trim()) {
      onResults(data); // If empty, show everything
      return;
    }

    const filtered = data.filter((item) =>
      searchKeys.some((key) =>
        String(item[key])?.toLowerCase().includes(value.toLowerCase())
      )
    );

    onResults(filtered);
  };

  const clearSearch = () => {
    setQuery("");
    onResults(data);
  };

  return (
    <div className={cn("relative w-full", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      
      <Input
        value={query}
        onChange={handleSearch}
        className="pl-10 pr-10" // Space for icons on both sides
        placeholder={placeholder}
      />

      {query && (
        <button 
          onClick={clearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-red-500 transition-colors"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      )}
    </div>
  );
}