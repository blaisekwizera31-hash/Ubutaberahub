import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Edit, FileText, Loader2, Search, Upload, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { getAllClerkCases, searchCitizens, updateClerkRegistryCase } from "@/services/backend";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface ClerkCasesProps {
  lang?: string;
}

const translations = {
  en: {
    title: "All Cases",
    subtitle: "All court filings available in the registry",
    search: "Search filings...",
    filed: "Filed",
    submittedBy: "Submitted By",
    noCases: "No court case filings found.",
  },
};

const caseTypes = ["Criminal Defense", "Family Law", "Property Dispute", "Employment Law", "Contract Dispute", "Business Law", "Civil Rights", "Immigration", "Inheritance", "Other"];
const priorities = ["low", "medium", "high", "urgent"];
const statuses = ["Pending", "Accepted", "In Progress", "Under Review", "Awaiting Ruling", "Closed", "Resolved", "Rejected"];

const ClerkCases = ({ lang = "en" }: ClerkCasesProps) => {
  const t = translations.en;
  const location = useLocation();
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;
  const { toast } = useToast();

  const [query, setQuery] = useState("");
  const [cases, setCases] = useState<any[]>([]);
  const [editingCase, setEditingCase] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editFiles, setEditFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [citizenMatches, setCitizenMatches] = useState<any[]>([]);

  useEffect(() => {
    const q = new URLSearchParams(location.search).get("q") || "";
    setQuery(q);
  }, [location.search]);

  const loadCases = () => {
    getAllClerkCases()
      .then((data) => setCases(Array.isArray(data.cases) ? data.cases : []))
      .catch(() => setCases([]));
  };

  useEffect(() => {
    loadCases();
  }, []);

  const displayedCases = useMemo(() => {
    const normalized = cases.map((c) => ({
      id: c.id,
      caseNumber: c.caseNumber || c.id,
      title: c.title,
      submittedBy: c.citizen || c.requestedBy || "Citizen",
      type: c.caseType || c.type || "Case",
      date: c.date || (c.filedAt ? new Date(c.filedAt).toISOString().slice(0, 10) : ""),
      status: c.status || "Pending",
      priority: c.priority || "medium",
      metadata: c.metadata || {},
      raw: c,
    }));

    const q = query.trim().toLowerCase();
    if (!q) return normalized;
    return normalized.filter((item) =>
      `${item.caseNumber} ${item.title} ${item.submittedBy} ${item.type} ${item.status}`.toLowerCase().includes(q),
    );
  }, [cases, query]);

  useEffect(() => {
    const q = String(editForm.claimantName || "").trim();
    if (!editingCase || q.length < 2) {
      setCitizenMatches([]);
      return;
    }

    const timer = window.setTimeout(() => {
      searchCitizens(q)
        .then((data) => setCitizenMatches(Array.isArray(data.users) ? data.users : []))
        .catch(() => setCitizenMatches([]));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [editForm.claimantName, editingCase]);

  const openEdit = (caseItem: any) => {
    const row = caseItem.raw || caseItem;
    setEditingCase(row);
    setEditFiles([]);
    setCitizenMatches([]);
    setEditForm({
      title: row.title || "",
      description: row.description || "",
      caseType: row.caseType || row.type || "Other",
      priority: row.priority || "medium",
      status: row.status || "Pending",
      claimantName: row.metadata?.claimant_name || row.citizen || "",
      claimantEmail: row.metadata?.claimant_email || row.citizenEmail || "",
      claimantPhone: row.metadata?.claimant_phone || row.citizenPhone || "",
      respondentName: row.metadata?.respondent_name || "",
      respondentEmail: row.metadata?.respondent_email || "",
      respondentPhone: row.metadata?.respondent_phone || "",
      courtDivision: row.metadata?.court_division || "",
      filingFeeStatus: row.metadata?.filing_fee_status || "Pending",
      registryNotes: row.metadata?.registry_notes || "",
      nextHearingAt: row.metadata?.next_hearing_at ? String(row.metadata.next_hearing_at).slice(0, 16) : "",
      updateNote: "",
    });
  };

  const updateEditForm = (key: string, value: string) => setEditForm((prev: any) => ({ ...prev, [key]: value }));

  const saveEdit = async () => {
    if (!editingCase || saving) return;
    setSaving(true);
    try {
      await updateClerkRegistryCase(editingCase.id, { ...editForm, documents: editFiles });
      toast({ title: "Case updated", description: "The case updates are now visible to the linked citizen." });
      setEditingCase(null);
      setEditFiles([]);
      loadCases();
    } catch (error: any) {
      toast({ title: "Could not update case", description: error?.response?.data?.message || error.message || "Unknown error", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const badgeClass = (status: string) => {
    if (/completed|resolved|closed/i.test(status)) return "bg-green-500 text-white border-none";
    if (/pending|awaiting|review/i.test(status)) return "bg-amber-500 text-white border-none";
    if (/ready|judge/i.test(status)) return "bg-blue-600 text-white border-none";
    return "";
  };

  return (
    <DashboardLayout role="clerk" userName={user?.name || "Court Clerk"} lang={lang}>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-semibold">{t.title}</h1>
          <p className="text-muted-foreground mt-1">{t.subtitle}</p>
        </motion.div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t.search} className="pl-10" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        <div className="grid gap-4">
          {displayedCases.map((filing, index) => (
            <motion.div
              key={filing.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-mono text-muted-foreground">{filing.caseNumber}</span>
                    <Badge className={badgeClass(filing.status)}>{filing.status}</Badge>
                    <Badge variant="outline">{filing.type}</Badge>
                    {filing.metadata?.linked_citizen_id && (
                      <Badge className="bg-green-600 text-white border-none">Citizen linked</Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{filing.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      {t.submittedBy}: {filing.submittedBy}
                    </span>
                    <span>
                      {t.filed}: {filing.date}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => openEdit(filing)}>
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </motion.div>
          ))}
          {displayedCases.length === 0 && (
            <div className="bg-card rounded-xl border border-border p-6 text-sm text-muted-foreground">{t.noCases}</div>
          )}
        </div>

        {editingCase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-border bg-card shadow-xl">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card p-4">
                <div>
                  <h2 className="font-semibold">Edit Case</h2>
                  <p className="text-xs font-mono text-muted-foreground">{editingCase.caseNumber}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setEditingCase(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-4 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={editForm.title || ""} onChange={(e) => updateEditForm("title", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={editForm.status} onValueChange={(value) => updateEditForm("status", value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{statuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={editForm.caseType} onValueChange={(value) => updateEditForm("caseType", value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{caseTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={editForm.priority} onValueChange={(value) => updateEditForm("priority", value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{priorities.map((priority) => <SelectItem key={priority} value={priority}>{priority}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea rows={4} value={editForm.description || ""} onChange={(e) => updateEditForm("description", e.target.value)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label>Citizen name</Label>
                    <Input value={editForm.claimantName || ""} onChange={(e) => updateEditForm("claimantName", e.target.value)} />
                    {citizenMatches[0] && (
                      <div className="flex items-center gap-1.5 text-xs text-green-600">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        In system: {citizenMatches[0].name}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Citizen email</Label>
                    <Input value={editForm.claimantEmail || ""} onChange={(e) => updateEditForm("claimantEmail", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Citizen phone</Label>
                    <Input value={editForm.claimantPhone || ""} onChange={(e) => updateEditForm("claimantPhone", e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input placeholder="Respondent name" value={editForm.respondentName || ""} onChange={(e) => updateEditForm("respondentName", e.target.value)} />
                  <Input placeholder="Respondent email" value={editForm.respondentEmail || ""} onChange={(e) => updateEditForm("respondentEmail", e.target.value)} />
                  <Input placeholder="Respondent phone" value={editForm.respondentPhone || ""} onChange={(e) => updateEditForm("respondentPhone", e.target.value)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Next hearing date</Label>
                    <Input type="datetime-local" value={editForm.nextHearingAt || ""} onChange={(e) => updateEditForm("nextHearingAt", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Court division</Label>
                    <Input value={editForm.courtDivision || ""} onChange={(e) => updateEditForm("courtDivision", e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Update note</Label>
                  <Textarea rows={3} value={editForm.updateNote || ""} onChange={(e) => updateEditForm("updateNote", e.target.value)} placeholder="What changed? This appears in citizen updates." />
                </div>

                <div className="space-y-2">
                  <Label>Add documents or related files</Label>
                  <Input type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp" onChange={(e) => setEditFiles(Array.from(e.target.files || []))} />
                  <p className="text-xs text-muted-foreground">{editFiles.length ? `${editFiles.length} file(s) selected` : "Attach new documents related to this case."}</p>
                </div>
              </div>

              <div className="sticky bottom-0 flex justify-end gap-2 border-t border-border bg-card p-4">
                <Button variant="outline" onClick={() => setEditingCase(null)}>Cancel</Button>
                <Button onClick={saveEdit} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Save Updates
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClerkCases;
