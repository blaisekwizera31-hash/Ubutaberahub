import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Clock, AlertCircle, Eye, X, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { getCaseDetails, getMyCases, summarizeTextWithAI } from "@/services/backend";
import { useLocation } from "react-router-dom";
import { UserPhoto } from "@/components/ui/UserPhoto";
import { useToast } from "@/hooks/use-toast";

interface LawyerCasesProps {
  lang?: string;
}

const translations = {
  en: {
    title: "My Active Cases",
    subtitle: "Cases you are actively participating in",
    search: "Search active cases...",
    filed: "Filed",
    client: "Citizen",
    viewDetails: "View Details",
    summarizeAi: "Summarize with AI",
    aiSummaryTitle: "AI Case Summary",
    noCases: "No active participating cases found.",
  },
};

const LawyerCases = ({ lang = "en" }: LawyerCasesProps) => {
  const t = translations.en;
  const location = useLocation();
  const { toast } = useToast();
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;

  const [query, setQuery] = useState("");
  const [cases, setCases] = useState<any[]>([]);
  const [selectedDetails, setSelectedDetails] = useState<any>(null);
  const [aiSummary, setAiSummary] = useState<{ title: string; content: string } | null>(null);
  const [summarizingCaseId, setSummarizingCaseId] = useState<string | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(location.search).get("q") || "";
    setQuery(q);
  }, [location.search]);

  useEffect(() => {
    getMyCases()
      .then((data) => {
        const all = Array.isArray(data.cases) ? data.cases : [];
        const active = all.filter((c) => !/completed|resolved|closed/i.test(String(c.status || "")));
        setCases(active);
      })
      .catch(() => {
        setCases([]);
      });
  }, []);

  const displayedCases = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cases;
    return cases.filter((item) =>
      `${item.id} ${item.title} ${item.caseType || item.type} ${item.status} ${item.citizen || item.requestedBy || ""}`.toLowerCase().includes(q),
    );
  }, [cases, query]);

  const openDetails = async (caseId: string) => {
    const details = await getCaseDetails(caseId);
    setSelectedDetails(details);
  };

  const summarizeCase = async (caseItem: any) => {
    if (summarizingCaseId) return;
    setSummarizingCaseId(caseItem.id);
    try {
      const filed = caseItem.date || (caseItem.filedAt ? new Date(caseItem.filedAt).toLocaleDateString() : "-");
      const prompt =
        "For an attorney in Rwanda, summarize this case. Include key facts, urgency, missing information, recommended next steps, documents to request, and client follow-up points.\n\n" +
        [
          `Title: ${caseItem.title || "Untitled"}`,
          `Number: ${caseItem.caseNumber || caseItem.id}`,
          `Citizen: ${caseItem.citizen || caseItem.requestedBy || "Citizen"}`,
          `Status: ${caseItem.status || "Pending"}`,
          `Priority: ${caseItem.priority || "medium"}`,
          `Type: ${caseItem.caseType || caseItem.type || "Case"}`,
          `Filed: ${filed}`,
          `Description: ${caseItem.description || "No description provided"}`,
        ].join("\n");
      const result = await summarizeTextWithAI(prompt, 1200);
      setAiSummary({ title: caseItem.title || "Case Summary", content: result.summary });
    } catch (error: any) {
      toast({ title: "AI failed", description: error.message || "Could not summarize case", variant: "destructive" });
    } finally {
      setSummarizingCaseId(null);
    }
  };

  return (
    <DashboardLayout role="lawyer" userName={user?.name || "Advocate"} lang={lang}>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-semibold text-slate-900">{t.title}</h1>
          <p className="text-muted-foreground mt-1">{t.subtitle}</p>
        </motion.div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder={t.search} value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10 bg-white border-slate-200" />
        </div>

        <div className="grid gap-4">
          {displayedCases.map((caseItem, index) => (
            <motion.div
              key={caseItem.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-mono text-slate-500">{caseItem.id}</span>
                    <Badge className="bg-amber-500 text-white border-none">{caseItem.status}</Badge>
                    <Badge variant="secondary">{caseItem.caseType || caseItem.type || "Other"}</Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">{caseItem.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-4 h-4" />
                      <span>
                        {t.filed}: {caseItem.date || (caseItem.filedAt ? new Date(caseItem.filedAt).toLocaleDateString() : "-")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>
                        {t.client}: {caseItem.citizen || caseItem.requestedBy || "Citizen"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => openDetails(caseItem.id)}>
                    <Eye className="h-4 w-4" />
                    {t.viewDetails}
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => summarizeCase(caseItem)} disabled={summarizingCaseId === caseItem.id}>
                    {summarizingCaseId === caseItem.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {t.summarizeAi}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
          {displayedCases.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 text-sm text-muted-foreground">{t.noCases}</div>
          )}
        </div>
        {selectedDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-mono text-muted-foreground">{selectedDetails.case.caseNumber}</p>
                  <h2 className="text-xl font-semibold">{selectedDetails.case.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedDetails.case.status} - {selectedDetails.case.caseType}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedDetails(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                <div className="rounded-xl border border-border p-4">
                  <UserPhoto
                    src={selectedDetails.citizen?.profile_photo}
                    alt={selectedDetails.citizen?.name || "Citizen"}
                    className="mb-3 h-20 w-20"
                  />
                  <h3 className="font-semibold">{selectedDetails.citizen?.name || "Citizen"}</h3>
                  <p className="text-sm text-muted-foreground">{selectedDetails.citizen?.email}</p>
                  <p className="text-sm text-muted-foreground">{selectedDetails.citizen?.phone || "No phone"}</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-1 font-semibold">Case Description</h3>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">{selectedDetails.case.description}</p>
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold">Uploaded Files</h3>
                    {selectedDetails.evidence?.length ? (
                      <div className="space-y-2">
                        {selectedDetails.evidence.map((doc: any) =>
                          doc.file_url ? (
                            <a
                              key={doc.id}
                              href={doc.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="block rounded-lg border border-border p-3 text-sm hover:bg-muted"
                            >
                              {doc.file_name || "Document"}
                            </a>
                          ) : (
                            <div key={doc.id} className="rounded-lg border border-border p-3 text-sm">
                              {doc.file_name || "Document"}
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No documents were uploaded yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {aiSummary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t.aiSummaryTitle}</p>
                  <h2 className="text-xl font-semibold">{aiSummary.title}</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setAiSummary(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="whitespace-pre-wrap text-sm text-foreground">{aiSummary.content}</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LawyerCases;
