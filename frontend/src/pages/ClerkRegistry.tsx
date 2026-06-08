import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, FileText, Calendar, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { getMyCases } from "@/services/backend";

interface ClerkRegistryProps {
  lang?: string;
}

const translations = {
  en: {
    title: "Court Registry",
    subtitle: "Live registry records from your assigned case data",
    search: "Search registry...",
    stats: ["Total Records", "New This Month", "Pending Updates"],
    type: "Type",
    date: "Date",
    status: "Status",
    noEntries: "No registry records found.",
  },
};

const ClerkRegistry = ({ lang = "en" }: ClerkRegistryProps) => {
  const t = translations.en;
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;
  const [query, setQuery] = useState("");
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    getMyCases()
      .then((data) => {
        const cases = Array.isArray(data.cases) ? data.cases : [];
        const mapped = cases.map((c) => ({
          id: c.id,
          title: c.title,
          type: c.type || "Case Filing",
          date: c.date || "",
          status: c.status || "Pending",
          submittedBy: c.citizen || c.requestedBy || "Citizen",
        }));
        setRecords(mapped);
      })
      .catch(() => setRecords([]));
  }, []);

  const filteredRecords = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return records;
    return records.filter((entry) =>
      `${entry.id} ${entry.title} ${entry.type} ${entry.status} ${entry.submittedBy}`.toLowerCase().includes(q),
    );
  }, [records, query]);

  const stats = useMemo(() => {
    const now = new Date();
    const sameMonth = (iso: string) => {
      if (!iso) return false;
      const d = new Date(iso);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    };

    return [
      { label: t.stats[0], value: records.length, icon: FileText, iconBg: "bg-primary/10", iconColor: "text-primary" },
      { label: t.stats[1], value: records.filter((r) => sameMonth(r.date)).length, icon: Calendar, iconBg: "bg-secondary/15", iconColor: "text-secondary" },
      { label: t.stats[2], value: records.filter((r) => /pending|awaiting|review/i.test(String(r.status || ""))).length, icon: Users, iconBg: "bg-accent/10", iconColor: "text-accent" },
    ];
  }, [records, t.stats]);

  const badgeClass = (status: string) => {
    if (/completed|resolved|closed/i.test(status)) return "bg-green-500 text-white border-none";
    if (/pending|awaiting|review/i.test(status)) return "bg-amber-500 text-white border-none";
    if (/ready|judge/i.test(status)) return "bg-blue-600 text-white border-none";
    return "bg-muted text-foreground border-none";
  };

  return (
    <DashboardLayout role="clerk" userName={user?.name || "Court Clerk"} lang={lang}>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-semibold">{t.title}</h1>
          <p className="text-muted-foreground mt-1">{t.subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center border border-border`}>
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t.search} className="pl-10" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        <div className="grid gap-4">
          {filteredRecords.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-mono text-muted-foreground">{entry.id}</span>
                    <Badge className={badgeClass(entry.status)}>{entry.status}</Badge>
                    <Badge variant="outline">{entry.type}</Badge>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{entry.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t.date}: {entry.date || "-"} • {t.status}: {entry.status}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
          {filteredRecords.length === 0 && (
            <div className="bg-card rounded-xl border border-border p-6 text-sm text-muted-foreground">{t.noEntries}</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClerkRegistry;
