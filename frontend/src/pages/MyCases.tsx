import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { getMyCases } from "@/services/backend";

const MyCases = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const t =
    language === "rw"
      ? {
          title: "Imanza zanjye",
          subtitle: "Imanza washizemo uruhare",
          unassigned: "Nta munyamategeko",
          searchPlaceholder: "Shakisha imanza...",
          filed: "Byatanzwe",
          lawyer: "Umunyamategeko",
          empty: "Nta manza ufitemo uruhare ziraboneka.",
          newCase: "Urubanza rushya",
        }
      : language === "fr"
        ? {
            title: "Mes dossiers",
            subtitle: "Dossiers auxquels vous participez",
            unassigned: "Non attribue",
            searchPlaceholder: "Rechercher des dossiers...",
            filed: "Depose",
            lawyer: "Avocat",
            empty: "Aucun dossier de participation trouve.",
            newCase: "Nouveau dossier",
          }
        : {
            title: "My Cases",
            subtitle: "Cases you participate in",
            unassigned: "Unassigned",
            searchPlaceholder: "Search cases...",
            filed: "Filed",
            lawyer: "Lawyer",
            empty: "No participating cases found yet.",
            newCase: "New Case",
          };

  const [cases, setCases] = useState<any[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const q = new URLSearchParams(location.search).get("q") || "";
    setQuery(q);
  }, [location.search]);

  useEffect(() => {
    getMyCases()
      .then((data) => {
        setCases(Array.isArray(data.cases) ? data.cases : []);
      })
      .catch(() => {
        setCases([]);
      });
  }, []);

  const displayedCases = useMemo(() => {
    const q = query.trim().toLowerCase();
    const normalized = cases.map((c) => ({
      id: c.id,
      title: c.title,
      status: c.status || "Pending",
      statusColor: /completed|resolved|closed/i.test(c.status) ? "bg-secondary" : /pending|awaiting|review/i.test(c.status) ? "bg-muted-foreground" : "bg-amber-500",
      date: c.date || "",
      type: c.type || "Other",
      lawyer: c.lawyer || t.unassigned,
    }));
    if (!q) return normalized;
    return normalized.filter((item) =>
      `${item.id} ${item.title} ${item.type} ${item.lawyer} ${item.status}`.toLowerCase().includes(q),
    );
  }, [cases, query, t.unassigned]);

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar activePage="my-cases" />
      <main className="flex-1 overflow-auto">
        <DashboardHeader searchPlaceholder={t.searchPlaceholder} />
        <div className="p-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-2xl font-display font-semibold mb-1">{t.title}</h1>
              <p className="text-muted-foreground">{t.subtitle}</p>
            </div>
            <Link to="/submit-case">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                {t.newCase}
              </Button>
            </Link>
          </motion.div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.searchPlaceholder} className="pl-10" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card rounded-2xl border border-border shadow-soft"
          >
            <div className="divide-y divide-border">
              {displayedCases.map((caseItem, index) => (
                <motion.div
                  key={caseItem.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.06 }}
                  className="p-5 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/messages?q=${encodeURIComponent(caseItem.id)}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-mono text-muted-foreground">{caseItem.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs text-white ${caseItem.statusColor}`}>{caseItem.status}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">{caseItem.type}</span>
                      </div>
                      <h3 className="font-medium text-lg">{caseItem.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>
                          {t.filed}: {caseItem.date}
                        </span>
                        <span>
                          {t.lawyer}: {caseItem.lawyer}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </motion.div>
              ))}
              {displayedCases.length === 0 && <div className="p-5 text-sm text-muted-foreground">{t.empty}</div>}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default MyCases;
