import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Filter, Eye, Gavel, Clock, AlertCircle, Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { getMyCases } from "@/services/backend";

interface JudgeCasesProps {
  lang?: string;
}

const translations = {
  en: {
    title: "Cases in Your Court",
    subtitle: "All real cases assigned to your judge account",
    filter: "Filter",
    review: "Review",
    ruling: "Issue Ruling",
    filed: "Filed",
    search: "Search cases...",
    noCases: "No cases found for your account.",
  },
};

const JudgeCases = ({ lang = "en" }: JudgeCasesProps) => {
  const t = translations[lang as keyof typeof translations] || translations.en;
  const navigate = useNavigate();
  const location = useLocation();
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "closed">("all");
  const [cases, setCases] = useState<any[]>([]);

  useEffect(() => {
    getMyCases()
      .then((data) => setCases(Array.isArray(data.cases) ? data.cases : []))
      .catch(() => setCases([]));
  }, []);

  useEffect(() => {
    const q = new URLSearchParams(location.search).get("q") || "";
    setQuery(q);
  }, [location.search]);

  const displayedCases = useMemo(() => {
    const normalized = cases.map((c) => ({
      id: c.id,
      title: c.title || "Untitled case",
      type: c.type || "Case",
      parties: `${c.citizen || c.requestedBy || "Citizen"} vs ${c.lawyer || "Lawyer"}`,
      status: c.status || "Pending",
      priority: c.priority || "Normal",
      date: c.date || "",
      priorityColor: /urgent/i.test(String(c.priority || ""))
        ? "bg-red-500"
        : /high/i.test(String(c.priority || ""))
          ? "bg-orange-500"
          : "bg-slate-500",
    }));

    const filteredByStatus = normalized.filter((item) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "closed") return /closed|resolved|completed/i.test(item.status);
      return /pending|awaiting|review|scheduled/i.test(item.status);
    });

    const q = query.trim().toLowerCase();
    if (!q) return filteredByStatus;
    return filteredByStatus.filter((item) =>
      `${item.id} ${item.title} ${item.parties} ${item.type} ${item.status} ${item.priority}`.toLowerCase().includes(q),
    );
  }, [cases, query, statusFilter]);

  return (
    <DashboardLayout role="judge" userName={user?.name || "Hon. Judge"} lang={lang}>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="text-muted-foreground mt-1">{t.subtitle}</p>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setStatusFilter((prev) => (prev === "all" ? "pending" : prev === "pending" ? "closed" : "all"))}
          >
            <Filter className="w-4 h-4" />
            {t.filter}: {statusFilter}
          </Button>
        </motion.div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} className="pl-9" />
        </div>

        <div className="grid gap-4">
          {displayedCases.map((caseItem, index) => (
            <motion.div
              key={caseItem.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-mono text-muted-foreground">{caseItem.id}</span>
                    <Badge className={`${caseItem.priorityColor} text-white border-none`}>{caseItem.priority}</Badge>
                    <Badge variant="outline">{caseItem.type}</Badge>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{caseItem.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{caseItem.parties}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {t.filed}: {caseItem.date || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{caseItem.status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => navigate("/judge-dashboard")}>
                    <Eye className="w-4 h-4" />
                    {t.review}
                  </Button>
                  <Button size="sm" className="gap-2" onClick={() => navigate("/judge-dashboard")}>
                    <Gavel className="w-4 h-4" />
                    {t.ruling}
                  </Button>
                </div>
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

export default JudgeCases;
