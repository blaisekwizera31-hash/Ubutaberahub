import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, CalendarClock, CheckCircle2, FileText, Loader2, Scale, Search, Users } from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { assignCaseToJudge, getCourtAdminQueue } from "@/services/backend";

const CourtAdminDashboard = () => {
  const stored = localStorage.getItem("loggedInUser");
  const user = stored ? JSON.parse(stored) : null;
  const { toast } = useToast();
  const [cases, setCases] = useState<any[]>([]);
  const [judges, setJudges] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [assigningCaseId, setAssigningCaseId] = useState("");
  const [assignment, setAssignment] = useState<Record<string, { judgeId: string; suggestedHearingAt: string; notes: string }>>({});
  const [savingId, setSavingId] = useState("");

  const load = async () => {
    const data = await getCourtAdminQueue();
    setCases(Array.isArray(data.cases) ? data.cases : []);
    setJudges(Array.isArray(data.judges) ? data.judges : []);
  };

  useEffect(() => {
    load().catch(() => {
      setCases([]);
      setJudges([]);
    });
  }, []);

  const displayedCases = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cases;
    return cases.filter((item) =>
      `${item.caseNumber} ${item.title} ${item.caseType} ${item.status} ${item.citizen || ""}`.toLowerCase().includes(q),
    );
  }, [cases, query]);

  const recommendedJudge = (caseItem: any) => {
    const type = String(caseItem.caseType || "").toLowerCase();
    const specialized = judges.filter((judge) => String(judge.specialization || "").toLowerCase().includes(type.split(" ")[0] || type));
    const pool = specialized.length ? specialized : judges;
    return [...pool].sort((a, b) => Number(a.active_count || 0) - Number(b.active_count || 0))[0] || null;
  };

  const setCaseAssignment = (caseId: string, key: "judgeId" | "suggestedHearingAt" | "notes", value: string) => {
    setAssignment((prev) => ({
      ...prev,
      [caseId]: { judgeId: "", suggestedHearingAt: "", notes: "", ...(prev[caseId] || {}), [key]: value },
    }));
  };

  const handleAssign = async (caseItem: any) => {
    const selected = assignment[caseItem.id] || {};
    const judgeId = selected.judgeId || recommendedJudge(caseItem)?.id;
    if (!judgeId) {
      toast({ title: "Select a judge", description: "There are no judges available for assignment.", variant: "destructive" });
      return;
    }

    setSavingId(caseItem.id);
    try {
      await assignCaseToJudge({
        caseId: caseItem.id,
        judgeId,
        suggestedHearingAt: selected.suggestedHearingAt,
        notes: selected.notes,
      });
      toast({ title: "Case assigned", description: "The judge has been notified and the case moved to the judicial workspace." });
      setAssigningCaseId("");
      await load();
    } catch (error: any) {
      toast({ title: "Assignment failed", description: error?.response?.data?.message || error.message || "Unknown error", variant: "destructive" });
    } finally {
      setSavingId("");
    }
  };

  return (
    <DashboardLayout role="court_admin" userName={user?.name || "Court Administration"}>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-semibold">Court Administration</h1>
          <p className="text-muted-foreground mt-1">Assign new court cases fairly by workload, specialization, and hearing timelines.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between text-muted-foreground"><span>New Unassigned Cases</span><FileText className="h-4 w-4" /></div>
            <p className="mt-2 text-2xl font-semibold">{cases.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between text-muted-foreground"><span>Judges Available</span><Users className="h-4 w-4" /></div>
            <p className="mt-2 text-2xl font-semibold">{judges.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between text-muted-foreground"><span>Lowest Active Workload</span><BarChart3 className="h-4 w-4" /></div>
            <p className="mt-2 text-2xl font-semibold">{judges[0]?.active_count ?? 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
          <section className="rounded-xl border border-border bg-card">
            <div className="border-b border-border p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-10" placeholder="Search unassigned cases..." value={query} onChange={(event) => setQuery(event.target.value)} />
              </div>
            </div>

            <div className="divide-y divide-border">
              {displayedCases.map((caseItem) => {
                const recommended = recommendedJudge(caseItem);
                const selected = assignment[caseItem.id] || {};
                const open = assigningCaseId === caseItem.id;

                return (
                  <div key={caseItem.id} className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-mono text-xs text-muted-foreground">{caseItem.caseNumber}</span>
                          <Badge>{caseItem.status}</Badge>
                          <Badge variant="outline">{caseItem.caseType}</Badge>
                        </div>
                        <h2 className="font-semibold">{caseItem.title}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">{caseItem.citizen || "Registry intake"} - {caseItem.evidenceCount || 0} document(s)</p>
                      </div>
                      <Button className="gap-2" variant={open ? "secondary" : "outline"} onClick={() => setAssigningCaseId(open ? "" : caseItem.id)}>
                        <Scale className="h-4 w-4" />
                        Assign
                      </Button>
                    </div>

                    {recommended && (
                      <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Suggested: {recommended.name || recommended.email} ({recommended.active_count || 0} active case(s))
                      </div>
                    )}

                    {open && (
                      <div className="mt-4 grid gap-3 rounded-lg border border-border p-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Judge</Label>
                            <Select value={selected.judgeId || recommended?.id || ""} onValueChange={(value) => setCaseAssignment(caseItem.id, "judgeId", value)}>
                              <SelectTrigger><SelectValue placeholder="Choose judge" /></SelectTrigger>
                              <SelectContent>
                                {judges.map((judge) => (
                                  <SelectItem key={judge.id} value={judge.id}>
                                    {judge.name || judge.email} - {judge.active_count || 0} active
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Suggested hearing date</Label>
                            <Input type="datetime-local" value={selected.suggestedHearingAt || ""} onChange={(event) => setCaseAssignment(caseItem.id, "suggestedHearingAt", event.target.value)} />
                          </div>
                        </div>
                        <Textarea placeholder="Assignment notes or scheduling rationale" value={selected.notes || ""} onChange={(event) => setCaseAssignment(caseItem.id, "notes", event.target.value)} />
                        <div className="flex justify-end">
                          <Button className="gap-2" onClick={() => handleAssign(caseItem)} disabled={savingId === caseItem.id}>
                            {savingId === caseItem.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarClock className="h-4 w-4" />}
                            Confirm Assignment
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {displayedCases.length === 0 && <div className="p-4 text-sm text-muted-foreground">No new cases are waiting for assignment.</div>}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="font-semibold">Judge Workload</h2>
            <div className="mt-4 space-y-3">
              {judges.map((judge) => (
                <div key={judge.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{judge.name || judge.email}</p>
                      <p className="text-xs text-muted-foreground">{judge.specialization || "General jurisdiction"}</p>
                    </div>
                    <Badge variant="outline">{judge.active_count || 0} active</Badge>
                  </div>
                </div>
              ))}
              {judges.length === 0 && <p className="text-sm text-muted-foreground">No judge accounts are available.</p>}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourtAdminDashboard;
