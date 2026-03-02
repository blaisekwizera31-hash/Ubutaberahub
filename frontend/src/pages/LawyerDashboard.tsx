import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Clock, UserRound, MessageSquare, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { getConversations, getMyCases } from "@/services/backend";

const translations = {
  en: {
    greeting: "Welcome",
    subtitle: "You can review citizen case requests and manage active cases.",
    pendingTitle: "Pending Case Requests",
    allCasesTitle: "All My Cases",
    noPending: "No pending citizen requests.",
    noCases: "No assigned/participating cases found.",
    requestedBy: "Requested by",
    filed: "Filed",
    viewMessages: "Open Messages",
    stats: {
      total: "Total Cases",
      pending: "Pending Requests",
      active: "Active Cases",
      conversations: "Conversations",
    },
  },
};

const LawyerDashboard = () => {
  const { language } = useLanguage();
  const t = translations.en;
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;

  const [cases, setCases] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    getMyCases()
      .then((data) => setCases(Array.isArray(data.cases) ? data.cases : []))
      .catch(() => setCases([]));

    getConversations()
      .then((data) => setConversations(Array.isArray(data.conversations) ? data.conversations : []))
      .catch(() => setConversations([]));
  }, []);

  const pendingCases = useMemo(
    () => cases.filter((c) => /pending|awaiting|review/i.test(String(c.status || ""))),
    [cases],
  );
  const activeCases = useMemo(
    () => cases.filter((c) => !/completed|resolved|closed/i.test(String(c.status || ""))),
    [cases],
  );

  const stats = [
    { label: t.stats.total, value: cases.length, icon: Briefcase },
    { label: t.stats.pending, value: pendingCases.length, icon: Clock },
    { label: t.stats.active, value: activeCases.length, icon: UserRound },
    { label: t.stats.conversations, value: conversations.length, icon: MessageSquare },
  ];

  const renderCaseItem = (caseItem: any, index: number) => (
    <motion.div
      key={`${caseItem.id}-${index}`}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 rounded-xl border border-border bg-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-mono text-muted-foreground">{caseItem.id}</p>
          <h3 className="font-semibold">{caseItem.title}</h3>
          <div className="text-sm text-muted-foreground flex flex-wrap gap-3">
            <span>
              {t.requestedBy}: {caseItem.citizen || "Unknown"}
            </span>
            <span>
              {t.filed}: {caseItem.date || "-"}
            </span>
            <span>{caseItem.status}</span>
          </div>
        </div>
        <Link to="/messages" className="text-muted-foreground hover:text-foreground">
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
    </motion.div>
  );

  return (
    <DashboardLayout role="lawyer" userName={user?.name || "Advocate"} lang={language}>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold">
            {t.greeting}, {user?.name || "Advocate"}!
          </h1>
          <p className="text-muted-foreground mt-1">{t.subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <stat.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t.pendingTitle}</h2>
            <Link to="/messages" className="text-sm text-muted-foreground hover:text-foreground">
              {t.viewMessages}
            </Link>
          </div>
          {pendingCases.map(renderCaseItem)}
          {pendingCases.length === 0 && <div className="text-sm text-muted-foreground">{t.noPending}</div>}
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">{t.allCasesTitle}</h2>
          {cases.map(renderCaseItem)}
          {cases.length === 0 && <div className="text-sm text-muted-foreground">{t.noCases}</div>}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LawyerDashboard;
