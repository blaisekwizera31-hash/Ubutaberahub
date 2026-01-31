import { motion } from "framer-motion";
import { ChevronRight, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

const MyCases = () => {
  const t = useTranslation("myCases");
  const dashboardT = useTranslation("dashboard");
  const commonT = useTranslation("common");

  const cases = [
    { id: "CASE-2024-001", title: "Property Dispute Resolution", status: dashboardT.caseStatuses.inProgress, statusColor: "bg-amber-500", date: "Jan 10, 2024", type: "Property Law", lawyer: "Me. Jean Habimana" },
    { id: "CASE-2024-002", title: "Employment Contract Review", status: dashboardT.caseStatuses.completed, statusColor: "bg-secondary", date: "Jan 5, 2024", type: "Employment Law", lawyer: "Me. Marie Uwimana" },
    { id: "CASE-2023-089", title: "Family Law Consultation", status: dashboardT.caseStatuses.pending, statusColor: "bg-muted-foreground", date: "Dec 28, 2023", type: "Family Law", lawyer: t.unassigned },
    { id: "CASE-2023-075", title: "Business Registration Query", status: dashboardT.caseStatuses.resolved, statusColor: "bg-green-500", date: "Dec 15, 2023", type: "Business Law", lawyer: "Me. Patrick Niyonzima" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar activePage="my-cases" />
      <main className="flex-1 overflow-auto">
        <DashboardHeader searchPlaceholder={t.searchPlaceholder} />
        <div className="p-6 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold mb-1">{t.title}</h1>
              <p className="text-muted-foreground">{t.subtitle}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2"><Filter className="w-4 h-4" />{commonT.filter}</Button>
              <Link to="/submit-case"><Button className="gap-2"><Plus className="w-4 h-4" />{commonT.newCase}</Button></Link>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-card rounded-2xl border border-border shadow-soft">
            <div className="divide-y divide-border">
              {cases.map((caseItem, index) => (
                <motion.div key={caseItem.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }} className="p-5 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-mono text-muted-foreground">{caseItem.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs text-white ${caseItem.statusColor}`}>{caseItem.status}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">{caseItem.type}</span>
                      </div>
                      <h3 className="font-medium text-lg">{caseItem.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{t.filed}: {caseItem.date}</span>
                        <span>{t.lawyer}: {caseItem.lawyer}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default MyCases;
