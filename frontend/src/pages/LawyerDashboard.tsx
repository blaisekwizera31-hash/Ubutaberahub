import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Clock, UserRound, MessageSquare, ChevronRight, BadgeCheck, X, Bot, Sparkles, Loader2, Send } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  approveCase,
  chatWithLegalAI,
  getCaseDetails,
  getConversations,
  getMyCases,
  summarizeTextWithAI,
  updateMyLawyerProfile,
} from "@/services/backend";
import { useToast } from "@/hooks/use-toast";
import { UserPhoto } from "@/components/ui/UserPhoto";

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
    approve: "Approve Case",
    details: "View Details",
    saveProfile: "Save Profile",
    available: "Available for new clients",
    hourlyRate: "Hourly Rate",
    phone: "Working Phone Number",
    firm: "Law Firm / Location",
    specialization: "Specialization",
    aiTitle: "Lawyer AI Assistant",
    aiSubtitle: "Summarize active files and ask case-prep questions.",
    summarizeAll: "Summarize All Cases",
    summarizePending: "Summarize Pending",
    askPlaceholder: "Ask about deadlines, risks, documents needed, or next steps...",
    ask: "Ask AI",
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
  const { toast } = useToast();
  const t = translations.en;
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;

  const [cases, setCases] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [profile, setProfile] = useState({
    phone: user?.phone || "",
    lawFirm: user?.lawFirm || user?.law_firm || "",
    specialization: user?.specialization || "",
    hourlyRate: user?.hourlyRate || user?.hourly_rate || 50000,
    isAvailable: user?.isAvailable ?? user?.is_available ?? true,
  });
  const [selectedDetails, setSelectedDetails] = useState<any>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    getMyCases()
      .then((data) => setCases(Array.isArray(data.cases) ? data.cases : []))
      .catch(() => setCases([]));

    getConversations()
      .then((data) => setConversations(Array.isArray(data.conversations) ? data.conversations : []))
      .catch(() => setConversations([]));
  }, []);

  const pendingCases = useMemo(
    () => cases.filter((c) => /pending/i.test(String(c.status || ""))),
    [cases],
  );
  const activeCases = useMemo(
    () => cases.filter((c) => /accepted|in progress|under review|awaiting ruling/i.test(String(c.status || ""))),
    [cases],
  );

  const saveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const { user: updated } = await updateMyLawyerProfile(profile);
      const current = localStorage.getItem("loggedInUser");
      const stored = current ? JSON.parse(current) : {};
      localStorage.setItem("loggedInUser", JSON.stringify({ ...stored, ...updated, profilePhoto: updated.profile_photo }));
      toast({ title: "Profile updated", description: "Your lawyer availability is now visible to citizens." });
    } catch (error: any) {
      toast({ title: "Failed to update profile", description: error.message || "Unknown error", variant: "destructive" });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const openDetails = async (caseId: string) => {
    try {
      const details = await getCaseDetails(caseId);
      setSelectedDetails(details);
    } catch (error: any) {
      toast({ title: "Could not load case details", description: error.message || "Unknown error", variant: "destructive" });
    }
  };

  const handleApprove = async (caseId: string) => {
    try {
      const result = await approveCase(caseId);
      setCases((prev) => prev.map((item) => (item.id === caseId ? { ...item, status: result.case.status } : item)));
      toast({ title: "Case approved", description: "The citizen has been notified." });
    } catch (error: any) {
      toast({ title: "Could not approve case", description: error.message || "Unknown error", variant: "destructive" });
    }
  };

  const buildCaseContext = (items: any[]) =>
    items
      .map((caseItem, index) => {
        const filed = caseItem.date || (caseItem.filedAt ? new Date(caseItem.filedAt).toLocaleDateString() : "-");
        return [
          `Case ${index + 1}: ${caseItem.title || "Untitled"}`,
          `Number: ${caseItem.caseNumber || caseItem.id}`,
          `Citizen: ${caseItem.citizen || caseItem.requestedBy || "Citizen"}`,
          `Status: ${caseItem.status || "Pending"}`,
          `Priority: ${caseItem.priority || "medium"}`,
          `Type: ${caseItem.caseType || caseItem.type || "Case"}`,
          `Filed: ${filed}`,
          `Description: ${caseItem.description || "No description provided"}`,
        ].join("\n");
      })
      .join("\n\n");

  const summarizeCases = async (scope: "all" | "pending") => {
    const source = scope === "pending" ? pendingCases : cases;
    if (!source.length || isAiLoading) return;
    setIsAiLoading(true);
    setAiAnswer("");
    try {
      const prompt =
        "For a lawyer in Rwanda, summarize these cases. Include urgent priorities, missing information, recommended next steps, and client follow-up points.\n\n" +
        buildCaseContext(source);
      const result = await summarizeTextWithAI(prompt, 1200);
      setAiAnswer(result.summary);
    } catch (error: any) {
      toast({ title: "AI failed", description: error.message || "Could not summarize cases", variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  };

  const askCaseAI = async () => {
    const question = aiQuestion.trim();
    if (!question || isAiLoading) return;
    setIsAiLoading(true);
    setAiAnswer("");
    try {
      const context = buildCaseContext(cases);
      const result = await chatWithLegalAI(
        [
          {
            role: "user",
            content:
              "You are assisting a licensed lawyer in Rwanda. Use only the case context below. Give practical case-prep support, not final legal advice.\n\n" +
              `Case context:\n${context}\n\nLawyer question: ${question}`,
          },
        ],
        language,
      );
      setAiAnswer(result.response);
    } catch (error: any) {
      toast({ title: "AI failed", description: error.message || "Could not answer", variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  };

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
              {t.requestedBy}: {caseItem.citizen || caseItem.requestedBy || "Citizen"}
            </span>
            <span>
              {t.filed}: {caseItem.date || (caseItem.filedAt ? new Date(caseItem.filedAt).toLocaleDateString() : "-")}
            </span>
            <span>{caseItem.status}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {String(caseItem.status || "").toLowerCase() === "pending" && (
            <Button size="sm" onClick={() => handleApprove(caseItem.id)}>
              <BadgeCheck className="mr-1 h-4 w-4" />
              {t.approve}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => openDetails(caseItem.id)}>
            {t.details}
          </Button>
          <Link to="/messages" className="text-muted-foreground hover:text-foreground">
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );

  return (
    <DashboardLayout role="lawyer" userName={user?.name || "Advocate"} lang={language}>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-semibold">
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
              <p className="text-2xl font-semibold mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <UserPhoto src={user?.profilePhoto || user?.profile_photo} alt={user?.name || "Lawyer"} className="h-12 w-12" />
              <div>
                <h2 className="text-lg font-semibold">Lawyer Profile</h2>
                <p className="text-sm text-muted-foreground">Keep this complete so citizens can choose you.</p>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={profile.isAvailable}
                onChange={(e) => setProfile({ ...profile, isAvailable: e.target.checked })}
              />
              {t.available}
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>{t.phone}</Label>
              <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t.hourlyRate}</Label>
              <Input type="number" value={profile.hourlyRate} onChange={(e) => setProfile({ ...profile, hourlyRate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t.firm}</Label>
              <Input value={profile.lawFirm} onChange={(e) => setProfile({ ...profile, lawFirm: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t.specialization}</Label>
              <Input value={profile.specialization} onChange={(e) => setProfile({ ...profile, specialization: e.target.value })} />
            </div>
          </div>
          <Button className="mt-4" onClick={saveProfile} disabled={isSavingProfile || !profile.phone}>
            {isSavingProfile ? "..." : t.saveProfile}
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{t.aiTitle}</h2>
                <p className="text-sm text-muted-foreground">{t.aiSubtitle}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => summarizeCases("all")} disabled={isAiLoading || cases.length === 0}>
                <Sparkles className="h-4 w-4" />
                {t.summarizeAll}
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => summarizeCases("pending")} disabled={isAiLoading || pendingCases.length === 0}>
                <Sparkles className="h-4 w-4" />
                {t.summarizePending}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Textarea
              value={aiQuestion}
              onChange={(event) => setAiQuestion(event.target.value)}
              placeholder={t.askPlaceholder}
              rows={3}
            />
            <div className="flex justify-end">
              <Button className="gap-2" onClick={askCaseAI} disabled={isAiLoading || !aiQuestion.trim() || cases.length === 0}>
                {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {t.ask}
              </Button>
            </div>
            {(isAiLoading || aiAnswer) && (
              <div className="rounded-xl border border-border bg-muted/40 p-4">
                {isAiLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking...
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-sm text-foreground">{aiAnswer}</p>
                )}
              </div>
            )}
          </div>
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
        {selectedDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-mono text-muted-foreground">{selectedDetails.case.caseNumber}</p>
                  <h2 className="text-xl font-semibold">{selectedDetails.case.title}</h2>
                  <p className="text-sm text-muted-foreground">{selectedDetails.case.status} · {selectedDetails.case.caseType}</p>
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
                  <h3 className="font-semibold">{selectedDetails.citizen?.name || "Unknown citizen"}</h3>
                  <p className="text-sm text-muted-foreground">{selectedDetails.citizen?.email}</p>
                  <p className="text-sm text-muted-foreground">{selectedDetails.citizen?.phone || "No phone"}</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-1 font-semibold">Case Description</h3>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">{selectedDetails.case.description}</p>
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold">Submitted Documents</h3>
                    {selectedDetails.evidence?.length ? (
                      <div className="space-y-2">
                        {selectedDetails.evidence.map((doc: any) => (
                          doc.file_url ? (
                            <a key={doc.id} href={doc.file_url} target="_blank" rel="noreferrer" className="block rounded-lg border border-border p-3 text-sm hover:bg-muted">
                              {doc.file_name || "Document"}
                            </a>
                          ) : (
                            <div key={doc.id} className="rounded-lg border border-border p-3 text-sm">
                              <p className="font-medium">{doc.file_name || "Document"}</p>
                              <p className="text-xs text-muted-foreground">{doc.notes}</p>
                            </div>
                          )
                        ))}
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
      </div>
    </DashboardLayout>
  );
};

export default LawyerDashboard;
