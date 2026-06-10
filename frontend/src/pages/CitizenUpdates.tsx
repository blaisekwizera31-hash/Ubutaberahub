import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarClock, FileText, Search } from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getCitizenCourtUpdates } from "@/services/backend";

const formatDateTime = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
};

const CitizenUpdates = () => {
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;
  const [updates, setUpdates] = useState<any[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getCitizenCourtUpdates()
      .then((data) => setUpdates(Array.isArray(data.updates) ? data.updates : []))
      .catch(() => setUpdates([]));
  }, []);

  const displayed = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return updates;
    return updates.filter((item) =>
      `${item.caseNumber} ${item.title} ${item.status} ${item.caseType} ${item.metadata?.last_clerk_update_note || ""}`.toLowerCase().includes(q),
    );
  }, [updates, query]);

  return (
    <DashboardLayout role="citizen" userName={user?.name || "Citizen"}>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-semibold">Updates</h1>
          <p className="text-muted-foreground mt-1">Court registry updates and next hearing dates linked to your account.</p>
        </motion.div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-10" placeholder="Search updates..." value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>

        <div className="grid gap-4">
          {displayed.map((item) => (
            <div key={item.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-mono text-xs text-muted-foreground">{item.caseNumber}</span>
                    <Badge variant="outline">{item.caseType}</Badge>
                    <Badge>{item.status}</Badge>
                  </div>
                  <h2 className="font-semibold">{item.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{item.metadata?.last_clerk_update_note || item.description}</p>
                </div>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>

              {item.metadata?.next_hearing_at && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
                  <CalendarClock className="h-4 w-4" />
                  Next hearing: {formatDateTime(item.metadata.next_hearing_at)}
                </div>
              )}

              <div className="mt-3 text-xs text-muted-foreground">
                Last updated: {formatDateTime(item.metadata?.last_clerk_update_at || item.updatedAt)}
              </div>
            </div>
          ))}

          {displayed.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
              No court updates are linked to your account yet.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CitizenUpdates;
