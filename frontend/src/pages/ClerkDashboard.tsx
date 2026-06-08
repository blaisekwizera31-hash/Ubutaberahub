import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle, MessageSquare, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { getConversations, getMyCases } from "@/services/backend";

const translations = {
  en: {
    greeting: "Welcome",
    subtitle: "Review filings and manage clerk-assigned cases with live data.",
    stats: {
      total: "Assigned Cases",
      pending: "Pending Review",
      ready: "Ready for Judge",
      messages: "Conversations",
    },
    tableTitle: "Case Queue",
    search: "Search case queue...",
    submittedBy: "Submitted By",
    noCases: "No clerk-assigned cases found.",
  },
};

interface ClerkDashboardProps {
  lang?: "en" | "rw" | "fr";
}

const ClerkDashboard = ({ lang = "en" }: ClerkDashboardProps) => {
  const t = translations.en;
  const loggedInUser = typeof window !== "undefined" ? localStorage.getItem("loggedInUser") : null;
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;

  const [query, setQuery] = useState("");
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
  const readyForJudgeCases = useMemo(
    () => cases.filter((c) => /ready|judge/i.test(String(c.status || ""))),
    [cases],
  );

  const stats = [
    { title: t.stats.total, value: cases.length, icon: FileText },
    { title: t.stats.pending, value: pendingCases.length, icon: Clock },
    { title: t.stats.ready, value: readyForJudgeCases.length, icon: CheckCircle },
    { title: t.stats.messages, value: conversations.length, icon: MessageSquare },
  ];

  const displayedCases = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = cases.map((c) => ({
      id: c.id,
      title: c.title,
      submittedBy: c.citizen || c.requestedBy || "Citizen",
      type: c.type || "Case",
      date: c.date || "",
      status: c.status || "Pending",
    }));
    if (!q) return base;
    return base.filter((item) =>
      `${item.id} ${item.title} ${item.submittedBy} ${item.type} ${item.status}`.toLowerCase().includes(q),
    );
  }, [cases, query]);

  const statusClass = (status: string) => {
    if (/completed|resolved|closed/i.test(status)) return "bg-green-500 text-white";
    if (/pending|awaiting|review/i.test(status)) return "bg-amber-500 text-white";
    if (/ready|judge/i.test(status)) return "bg-blue-600 text-white";
    return "bg-muted text-foreground";
  };

  return (
    <DashboardLayout role="clerk" userName={user?.name || "Court Clerk"} lang={lang}>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <h1 className="text-2xl font-semibold">
            {t.greeting}, {user?.name || "Court Clerk"}!
          </h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.title} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center justify-between text-muted-foreground">
                <p className="text-sm">{stat.title}</p>
                <stat.icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-semibold mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-xl border border-border">
          <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{t.tableTitle}</h2>
            <div className="relative md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} className="pl-9" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider">Case ID</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider">Description</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider">{t.submittedBy}</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider">Type</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider">Date</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {displayedCases.map((filing) => (
                  <tr key={filing.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-mono text-xs text-muted-foreground">{filing.id}</td>
                    <td className="p-4">
                      <p className="font-medium">{filing.title}</p>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{filing.submittedBy}</td>
                    <td className="p-4">
                      <Badge variant="outline">{filing.type}</Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{filing.date || "-"}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClass(filing.status)}`}>{filing.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {displayedCases.length === 0 && <div className="p-4 text-sm text-muted-foreground">{t.noCases}</div>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClerkDashboard;
