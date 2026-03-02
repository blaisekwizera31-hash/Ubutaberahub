import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Clock, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { getMyCases } from "@/services/backend";

interface LawyerCasesProps {
  lang?: string;
}

const translations = {
  en: {
    title: "My Active Cases",
    subtitle: "Cases you are actively participating in",
    search: "Search active cases...",
    filed: "Filed",
    client: "Citizen",
    noCases: "No active participating cases found.",
  },
};

const LawyerCases = ({ lang = "en" }: LawyerCasesProps) => {
  const t = translations.en;
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;

  const [query, setQuery] = useState("");
  const [cases, setCases] = useState<any[]>([]);

  useEffect(() => {
    getMyCases()
      .then((data) => {
        const all = Array.isArray(data.cases) ? data.cases : [];
        const active = all.filter((c) => !/completed|resolved|closed/i.test(String(c.status || "")));
        setCases(active);
      })
      .catch(() => {
        setCases([]);
      });
  }, []);

  const displayedCases = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cases;
    return cases.filter((item) =>
      `${item.id} ${item.title} ${item.type} ${item.status} ${item.citizen || ""}`.toLowerCase().includes(q),
    );
  }, [cases, query]);

  return (
    <DashboardLayout role="lawyer" userName={user?.name || "Advocate"} lang={lang}>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-slate-900">{t.title}</h1>
          <p className="text-muted-foreground mt-1">{t.subtitle}</p>
        </motion.div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder={t.search} value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10 bg-white border-slate-200" />
        </div>

        <div className="grid gap-4">
          {displayedCases.map((caseItem, index) => (
            <motion.div
              key={caseItem.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-mono text-slate-500">{caseItem.id}</span>
                    <Badge className="bg-amber-500 text-white border-none">{caseItem.status}</Badge>
                    <Badge variant="secondary">{caseItem.type || "Other"}</Badge>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">{caseItem.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-4 h-4" />
                      <span>
                        {t.filed}: {caseItem.date || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>
                        {t.client}: {caseItem.citizen || "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {displayedCases.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 text-sm text-muted-foreground">{t.noCases}</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LawyerCases;
