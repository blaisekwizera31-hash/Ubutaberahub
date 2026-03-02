import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { getMyCases } from "@/services/backend";

interface ClerkCasesProps {
  lang?: string;
}

const translations = {
  en: {
    title: "Case Filings",
    subtitle: "Real filings assigned to your clerk account",
    search: "Search filings...",
    filed: "Filed",
    submittedBy: "Submitted By",
    noCases: "No clerk case filings found.",
  },
};

const ClerkCases = ({ lang = "en" }: ClerkCasesProps) => {
  const t = translations.en;
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;

  const [query, setQuery] = useState("");
  const [cases, setCases] = useState<any[]>([]);

  useEffect(() => {
    getMyCases()
      .then((data) => setCases(Array.isArray(data.cases) ? data.cases : []))
      .catch(() => setCases([]));
  }, []);

  const displayedCases = useMemo(() => {
    const normalized = cases.map((c) => ({
      id: c.id,
      title: c.title,
      submittedBy: c.citizen || c.requestedBy || "Citizen",
      type: c.type || "Case",
      date: c.date || "",
      status: c.status || "Pending",
    }));

    const q = query.trim().toLowerCase();
    if (!q) return normalized;
    return normalized.filter((item) =>
      `${item.id} ${item.title} ${item.submittedBy} ${item.type} ${item.status}`.toLowerCase().includes(q),
    );
  }, [cases, query]);

  const badgeClass = (status: string) => {
    if (/completed|resolved|closed/i.test(status)) return "bg-green-500 text-white border-none";
    if (/pending|awaiting|review/i.test(status)) return "bg-amber-500 text-white border-none";
    if (/ready|judge/i.test(status)) return "bg-blue-600 text-white border-none";
    return "";
  };

  return (
    <DashboardLayout role="clerk" userName={user?.name || "Court Clerk"} lang={lang}>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground mt-1">{t.subtitle}</p>
        </motion.div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t.search} className="pl-10" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        <div className="grid gap-4">
          {displayedCases.map((filing, index) => (
            <motion.div
              key={filing.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-mono text-muted-foreground">{filing.id}</span>
                    <Badge className={badgeClass(filing.status)}>{filing.status}</Badge>
                    <Badge variant="outline">{filing.type}</Badge>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{filing.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      {t.submittedBy}: {filing.submittedBy}
                    </span>
                    <span>
                      {t.filed}: {filing.date}
                    </span>
                  </div>
                </div>
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
            </motion.div>
          ))}
          {displayedCases.length === 0 && (
            <div className="bg-card rounded-xl border border-border p-6 text-sm text-muted-foreground">{t.noCases}</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClerkCases;
