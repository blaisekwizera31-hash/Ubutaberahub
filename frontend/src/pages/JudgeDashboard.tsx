import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Gavel, FileText, Clock, CheckCircle, AlertCircle, Eye, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import StatCard from "@/components/Dashboard/StatCard";
import { getMyCases } from "@/services/backend";

const JudgeDashboard = () => {
  const navigate = useNavigate();
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;
  const [query, setQuery] = useState("");
  const [cases, setCases] = useState<any[]>([]);

  useEffect(() => {
    getMyCases()
      .then((data) => setCases(Array.isArray(data.cases) ? data.cases : []))
      .catch(() => setCases([]));
  }, []);

  const pendingCases = useMemo(
    () => cases.filter((c) => /pending|awaiting|review|scheduled/i.test(String(c.status || ""))),
    [cases],
  );

  const closedCases = useMemo(() => cases.filter((c) => /closed|resolved|completed/i.test(String(c.status || ""))), [cases]);
  const urgentCases = useMemo(() => cases.filter((c) => /urgent|high/i.test(String(c.priority || ""))), [cases]);

  const stats = [
    { title: "Assigned Cases", value: String(cases.length), icon: FileText, trend: "Cases in your court", color: "primary" as const },
    { title: "Pending Rulings", value: String(pendingCases.length), icon: Clock, trend: "Awaiting your decision", color: "secondary" as const },
    { title: "Urgent/High Priority", value: String(urgentCases.length), icon: AlertCircle, trend: "Needs immediate attention", color: "accent" as const },
    { title: "Closed Cases", value: String(closedCases.length), icon: CheckCircle, trend: "Resolved in your court", color: "primary" as const },
  ];

  const displayedCases = useMemo(() => {
    const normalized = cases.map((c) => ({
      id: c.id,
      date: c.date || "",
      priority: c.priority || "Normal",
      status: c.status || "Pending",
      title: c.title || "Untitled case",
      type: c.type || "Case",
      parties: `${c.citizen || c.requestedBy || "Citizen"} vs ${c.lawyer || "Lawyer"}`,
    }));

    const q = query.trim().toLowerCase();
    if (!q) return normalized;
    return normalized.filter((item) =>
      `${item.id} ${item.title} ${item.type} ${item.status} ${item.priority} ${item.parties}`.toLowerCase().includes(q),
    );
  }, [cases, query]);

  const getPriorityColor = (p: string) => {
    if (/urgent/i.test(p)) return "destructive";
    if (/high/i.test(p)) return "default";
    return "secondary";
  };

  return (
    <DashboardLayout role="judge" userName={user?.name || "Hon. Judge"}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={user?.profilePhoto || "/avatar/avatar.png"} 
                alt="Profile" 
                className="w-16 h-16 rounded-full border-2 border-primary object-cover shadow-sm" 
              />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Welcome, {user?.name || "Hon. Judge"}</h1>
              <p className="text-muted-foreground font-medium">All cases filed in your assigned court appear below.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:w-80">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your court cases..." className="pl-9" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <StatCard {...stat} />
            </motion.div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Cases Requiring Your Review</h2>
            <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate("/judge-cases")}>
              View All Cases
            </Button>
          </div>
          {displayedCases.map((c) => (
            <motion.div key={c.id} className="bg-card p-5 rounded-xl border shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">{c.id}</span>
                  <Badge variant={getPriorityColor(c.priority)}>{c.priority}</Badge>
                  <Badge variant="outline" className="font-normal">
                    {c.type}
                  </Badge>
                </div>
                <h3 className="font-semibold text-lg">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.parties}</p>
                <div className="flex gap-4 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Filed: {c.date || "-"}
                  </span>
                  <span className="flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {c.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => navigate("/judge-cases")}>
                  <Eye className="w-4 h-4" /> Review
                </Button>
                <Button size="sm" className="gap-1.5" onClick={() => navigate("/judge-cases")}>
                  <Gavel className="w-4 h-4" /> Issue Ruling
                </Button>
              </div>
            </motion.div>
          ))}
          {displayedCases.length === 0 && (
            <div className="bg-card rounded-xl border border-border p-6 text-sm text-muted-foreground">
              No cases are currently assigned to your court.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JudgeDashboard;
