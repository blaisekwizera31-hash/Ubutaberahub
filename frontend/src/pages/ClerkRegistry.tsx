import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle2, FileCheck2, FileText, Filter, Loader2, Plus, Search, Upload, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { createClerkRegistryCase, getAllClerkCases, getClerkSubmittedDocuments, searchCitizens } from "@/services/backend";

interface ClerkRegistryProps {
  lang?: string;
}

const caseTypes = [
  "Criminal Defense",
  "Family Law",
  "Property Dispute",
  "Employment Law",
  "Contract Dispute",
  "Business Law",
  "Civil Rights",
  "Immigration",
  "Inheritance",
  "Other",
];

const priorities = ["low", "medium", "high", "urgent"];
const statuses = ["all", "Pending", "Accepted", "In Progress", "Under Review", "Awaiting Ruling", "Closed", "Resolved", "Rejected"];
const feeStatuses = ["Pending", "Paid", "Waived", "Exempted"];
const filingChannels = ["Counter", "Email", "Online portal", "Transferred from court", "Police referral"];

const emptyForm = {
  title: "",
  description: "",
  caseType: "",
  priority: "medium",
  claimantName: "",
  claimantEmail: "",
  claimantPhone: "",
  claimantNationalId: "",
  respondentName: "",
  respondentEmail: "",
  respondentPhone: "",
  courtDivision: "",
  filingChannel: "Counter",
  filingFeeStatus: "Pending",
  incidentDate: "",
  registryNotes: "",
};

const normalizeDate = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const badgeClass = (status: string) => {
  if (/completed|resolved|closed/i.test(status)) return "bg-green-500 text-white border-none";
  if (/pending|awaiting|review/i.test(status)) return "bg-amber-500 text-white border-none";
  if (/ready|judge|accepted|progress/i.test(status)) return "bg-blue-600 text-white border-none";
  if (/rejected/i.test(status)) return "bg-destructive text-destructive-foreground border-none";
  return "bg-muted text-foreground border-none";
};

const ClerkRegistry = ({ lang = "en" }: ClerkRegistryProps) => {
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;
  const { toast } = useToast();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [records, setRecords] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [formData, setFormData] = useState(emptyForm);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [citizenMatches, setCitizenMatches] = useState<any[]>([]);

  const loadRegistry = async () => {
    const [caseData, docData] = await Promise.all([getAllClerkCases(), getClerkSubmittedDocuments()]);
    setRecords(Array.isArray(caseData.cases) ? caseData.cases : []);
    setDocuments(Array.isArray(docData.documents) ? docData.documents : []);
  };

  useEffect(() => {
    loadRegistry().catch(() => {
      setRecords([]);
      setDocuments([]);
    });
  }, []);

  useEffect(() => {
    const q = formData.claimantName.trim();
    if (q.length < 2) {
      setCitizenMatches([]);
      return;
    }

    const timer = window.setTimeout(() => {
      searchCitizens(q)
        .then((data) => setCitizenMatches(Array.isArray(data.users) ? data.users : []))
        .catch(() => setCitizenMatches([]));
    }, 300);

    return () => window.clearTimeout(timer);
  }, [formData.claimantName]);

  const filteredRecords = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records
      .map((c) => ({
        ...c,
        displayId: c.caseNumber || c.id,
        type: c.caseType || c.type || "Other",
        date: normalizeDate(c.filedAt || c.date || c.createdAt),
        submittedBy: c.citizen || c.requestedBy || c.metadata?.claimant_name || "Registry intake",
      }))
      .filter((entry) => {
        const matchesSearch = !q || `${entry.displayId} ${entry.title} ${entry.type} ${entry.status} ${entry.submittedBy}`.toLowerCase().includes(q);
        const matchesStatus = statusFilter === "all" || entry.status === statusFilter;
        const matchesType = typeFilter === "all" || entry.type === typeFilter;
        const matchesFrom = !fromDate || (entry.date && entry.date >= fromDate);
        const matchesTo = !toDate || (entry.date && entry.date <= toDate);
        return matchesSearch && matchesStatus && matchesType && matchesFrom && matchesTo;
      });
  }, [records, query, statusFilter, typeFilter, fromDate, toDate]);

  const filteredDocuments = useMemo(() => {
    const recordIds = new Set(filteredRecords.flatMap((r) => [r.id, r.displayId, r.caseNumber].filter(Boolean)));
    return documents.filter((doc) => recordIds.has(doc.case_id) || recordIds.has(doc.case_number));
  }, [documents, filteredRecords]);

  const stats = useMemo(() => {
    const now = new Date();
    const isThisMonth = (value: string) => {
      const date = new Date(value);
      return !Number.isNaN(date.getTime()) && date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
    };

    return [
      { label: "Total Records", value: records.length, icon: FileText },
      { label: "New This Month", value: records.filter((r) => isThisMonth(r.filedAt || r.date || r.createdAt)).length, icon: Calendar },
      { label: "Submitted Documents", value: documents.length, icon: FileCheck2 },
      { label: "Pending Review", value: records.filter((r) => /pending|awaiting|review/i.test(String(r.status || ""))).length, icon: Users },
    ];
  }, [records, documents]);

  const documentAnalysis = useMemo(() => {
    const highPriority = filteredRecords.filter((r) => ["high", "urgent"].includes(String(r.priority || "").toLowerCase())).length;
    const withoutDocuments = filteredRecords.filter((r) => Number(r.evidenceCount || r.metadata?.evidence_count || 0) === 0).length;
    return [
      `${filteredDocuments.length} submitted document${filteredDocuments.length === 1 ? "" : "s"} match the current filters.`,
      `${highPriority} filtered case${highPriority === 1 ? "" : "s"} are high or urgent priority.`,
      `${withoutDocuments} filtered case${withoutDocuments === 1 ? "" : "s"} have no uploaded supporting document yet.`,
    ];
  }, [filteredDocuments.length, filteredRecords]);

  const updateForm = (key: keyof typeof emptyForm, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.caseType) {
      toast({ title: "Complete the required fields", description: "Title, type, and summary are required.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      await createClerkRegistryCase({ ...formData, documents: files });
      setFormData(emptyForm);
      setFiles([]);
      await loadRegistry();
      toast({ title: "Case registered", description: "A case number was assigned and the case is waiting for assignment." });
    } catch (error: any) {
      toast({ title: "Could not register case", description: error?.response?.data?.message || error.message || "Unknown error", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="clerk" userName={user?.name || "Court Clerk"} lang={lang}>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-semibold">Court Registry</h1>
          <p className="text-muted-foreground mt-1">Register new cases, review submitted documents, and filter registry records.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center justify-between text-muted-foreground">
                <p className="text-sm">{stat.label}</p>
                <stat.icon className="h-4 w-4" />
              </div>
              <p className="text-2xl font-semibold mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
          <section className="bg-card rounded-xl border border-border p-5 space-y-5">
            <div>
              <h2 className="text-lg font-semibold">Submitted Document Analysis</h2>
              <div className="mt-3 grid gap-2">
                {documentAnalysis.map((line) => (
                  <p key={line} className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">{line}</p>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search registry..." className="pl-10" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>{statuses.map((s) => <SelectItem key={s} value={s}>{s === "all" ? "All statuses" : s}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {caseTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2" onClick={() => { setQuery(""); setStatusFilter("all"); setTypeFilter("all"); setFromDate(""); setToDate(""); }}>
                <Filter className="h-4 w-4" /> Clear
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>

            <div className="space-y-3">
              {filteredRecords.map((entry) => (
                <div key={entry.id} className="rounded-lg border border-border p-4">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs font-mono text-muted-foreground">{entry.displayId}</span>
                        <Badge className={badgeClass(entry.status)}>{entry.status}</Badge>
                        <Badge variant="outline">{entry.type}</Badge>
                      </div>
                      <h3 className="font-semibold">{entry.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{entry.submittedBy} - {entry.date || "No filing date"}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{Number(entry.evidenceCount || entry.metadata?.evidence_count || 0)} document(s)</p>
                  </div>
                </div>
              ))}
              {filteredRecords.length === 0 && <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">No registry records match the filters.</div>}
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="font-semibold mb-3">Submitted Documents</h3>
              <div className="space-y-2">
                {filteredDocuments.map((doc) => (
                  <a key={doc.id} href={doc.file_url || "#"} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 hover:bg-muted/40">
                    <div>
                      <p className="font-medium text-sm">{doc.file_name}</p>
                      <p className="text-xs text-muted-foreground">{doc.case_number} - {doc.case_title} - {normalizeDate(doc.uploaded_at)}</p>
                    </div>
                    <Badge variant="outline">{doc.file_type || "document"}</Badge>
                  </a>
                ))}
                {filteredDocuments.length === 0 && <p className="text-sm text-muted-foreground">No submitted documents match the current filters.</p>}
              </div>
            </div>
          </section>

          <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Add New Case</h2>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Case Title *</Label>
              <Input id="title" value={formData.title} onChange={(e) => updateForm("title", e.target.value)} placeholder="Brief registry title" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Case Type *</Label>
                <Select value={formData.caseType} onValueChange={(value) => updateForm("caseType", value)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>{caseTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => updateForm("priority", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{priorities.map((priority) => <SelectItem key={priority} value={priority}>{priority}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Case Summary *</Label>
              <Textarea id="description" rows={5} value={formData.description} onChange={(e) => updateForm("description", e.target.value)} placeholder="Facts, requested relief, jurisdiction notes, and urgent issues" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Input placeholder="Claimant name" value={formData.claimantName} onChange={(e) => updateForm("claimantName", e.target.value)} />
                {citizenMatches[0] && (
                  <div className="flex items-center gap-1.5 text-xs text-green-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    In system: {citizenMatches[0].name} {citizenMatches[0].email ? `(${citizenMatches[0].email})` : ""}
                  </div>
                )}
              </div>
              <Input placeholder="Respondent name" value={formData.respondentName} onChange={(e) => updateForm("respondentName", e.target.value)} />
              <Input placeholder="Claimant phone" value={formData.claimantPhone} onChange={(e) => updateForm("claimantPhone", e.target.value)} />
              <Input placeholder="Respondent phone" value={formData.respondentPhone} onChange={(e) => updateForm("respondentPhone", e.target.value)} />
              <Input placeholder="Claimant email" value={formData.claimantEmail} onChange={(e) => updateForm("claimantEmail", e.target.value)} />
              <Input placeholder="Respondent email" value={formData.respondentEmail} onChange={(e) => updateForm("respondentEmail", e.target.value)} />
              <Input placeholder="National ID / Passport" value={formData.claimantNationalId} onChange={(e) => updateForm("claimantNationalId", e.target.value)} />
              <Input type="date" value={formData.incidentDate} onChange={(e) => updateForm("incidentDate", e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder="Court division / chamber" value={formData.courtDivision} onChange={(e) => updateForm("courtDivision", e.target.value)} />
              <Select value={formData.filingChannel} onValueChange={(value) => updateForm("filingChannel", value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{filingChannels.map((channel) => <SelectItem key={channel} value={channel}>{channel}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={formData.filingFeeStatus} onValueChange={(value) => updateForm("filingFeeStatus", value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{feeStatuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Registry Notes</Label>
              <Textarea id="notes" rows={3} value={formData.registryNotes} onChange={(e) => updateForm("registryNotes", e.target.value)} placeholder="Internal filing notes, missing items, payment reference, or routing instructions" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="documents">Supporting Documents</Label>
              <Input id="documents" type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
              <p className="text-xs text-muted-foreground">{files.length ? `${files.length} file(s) selected` : "PDF, DOC, DOCX, JPG, PNG, or WEBP."}</p>
            </div>

            <Button type="submit" className="w-full gap-2" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Register Case
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClerkRegistry;
