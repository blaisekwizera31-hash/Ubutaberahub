import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Eye, MessageSquare, Calendar, ChevronRight, Plus, Briefcase, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCaseDetails, getDashboardData, getMyCases } from "@/services/backend";
import { UserPhoto } from "@/components/ui/UserPhoto";
import { useToast } from "@/hooks/use-toast";

const translations = {
  en: {
    welcome: "Welcome back",
    welcomeSub: "Here is what is happening with your cases today.",
    actions: {
      submit: "Submit New Case",
      ask: "Ask AI Assistant",
      find: "Find a Lawyer",
      book: "Book Consultation",
    },
    recentCases: {
      title: "Recent Cases",
      viewAll: "View All",
      viewDetails: "View Details",
      pending: "Pending",
      empty: "No recent cases found yet.",
      assignedLawyer: "Assigned Lawyer",
      noLawyer: "No lawyer assigned yet",
      phone: "Phone",
      email: "Email",
    },
  },
  rw: {
    welcome: "Muraho neza",
    welcomeSub: "Dore uko imanza zawe zifashe uyu munsi.",
    actions: {
      submit: "Tanga ikirego gishya",
      ask: "Baza AI Assistant",
      find: "Shaka Umunyamategeko",
      book: "Saba gahunda",
    },
    recentCases: {
      title: "Imanza ziherutse",
      viewAll: "Reba zose",
      viewDetails: "Reba amakuru",
      pending: "Itegereje",
      empty: "Nta manza ziherutse ziboneka.",
      assignedLawyer: "Umunyamategeko wahawe urubanza",
      noLawyer: "Nta munyamategeko urahabwa urubanza",
      phone: "Telefone",
      email: "Imeyili",
    },
  },
  fr: {
    welcome: "Bon retour",
    welcomeSub: "Voici ce qui se passe avec vos dossiers aujourd'hui.",
    actions: {
      submit: "Soumettre un dossier",
      ask: "Demander a l'IA",
      find: "Trouver un avocat",
      book: "Prendre RDV",
    },
    recentCases: {
      title: "Dossiers recents",
      viewAll: "Voir tout",
      viewDetails: "Voir details",
      pending: "En attente",
      empty: "Aucun dossier recent trouve.",
      assignedLawyer: "Avocat assigne",
      noLawyer: "Aucun avocat assigne",
      phone: "Telephone",
      email: "Email",
    },
  },
};

const CitizenDashboard = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const t = translations[language as keyof typeof translations] || translations.en;
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;
  const [apiCases, setApiCases] = useState<any[]>([]);
  const [myCases, setMyCases] = useState<any[]>([]);
  const [selectedDetails, setSelectedDetails] = useState<any>(null);

  useEffect(() => {
    getDashboardData("citizen")
      .then((data) => {
        setApiCases(Array.isArray(data.cases) ? data.cases : []);
      })
      .catch(() => {
        setApiCases([]);
      });

    getMyCases()
      .then((data) => setMyCases(Array.isArray(data.cases) ? data.cases : []))
      .catch(() => setMyCases([]));
  }, []);

  const displayedCases = useMemo(
    () =>
      apiCases.map((c) => {
        const matchingCase = myCases.find((item) => item.id === c.dbId || item.id === c.id || item.caseNumber === c.id || item.caseNumber === c.caseNumber);
        return {
        id: c.id,
        dbId: c.dbId || matchingCase?.id || c.id,
        caseNumber: c.caseNumber || matchingCase?.caseNumber || c.id,
        title: c.title,
        status: c.status || t.recentCases.pending,
        statusColor: /completed|resolved|closed/i.test(c.status) ? "bg-emerald-600" : "bg-[#1E293B]",
        date: c.date || "",
        lawyer: c.lawyer || "",
        lawyerEmail: c.lawyerEmail || null,
        lawyerPhone: c.lawyerPhone || null,
        lawyerPhoto: c.lawyerPhoto || null,
      };
      }),
    [apiCases, myCases, t.recentCases.pending],
  );

  const openDetails = async (caseItem: { id: string; dbId: string; caseNumber?: string }) => {
    try {
      const details = await getCaseDetails(caseItem.dbId || caseItem.id);
      setSelectedDetails(details);
    } catch (error: any) {
      const fallbackIds = [caseItem.id, caseItem.caseNumber].filter(Boolean);
      for (const fallbackId of fallbackIds) {
        if (fallbackId === caseItem.dbId) continue;
        try {
          const details = await getCaseDetails(fallbackId as string);
          setSelectedDetails(details);
          return;
        } catch {}
      }
      toast({
        title: "Could not load case details",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout role="citizen" userName={user?.name || "User"}>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-display font-semibold text-foreground">
            {t.welcome}, {user?.name?.split(" ")[0] || "User"}!
          </h1>
          <p className="text-muted-foreground mt-1">{t.welcomeSub}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { icon: Plus, label: t.actions.submit, style: "bg-primary text-primary-foreground hover:bg-primary/90", href: "/dashboard/submit-case" },
            { icon: MessageSquare, label: t.actions.ask, style: "bg-card border border-border text-foreground hover:bg-muted", href: "/dashboard/ai-assistant" },
            { icon: Briefcase, label: t.actions.find, style: "bg-card border border-border text-foreground hover:bg-muted", href: "/dashboard/find-lawyer" },
            { icon: Calendar, label: t.actions.book, style: "bg-card border border-border text-foreground hover:bg-muted", href: "/dashboard/appointments" },
          ].map((action) => (
            <Link
              key={action.label}
              to={action.href}
              className={`flex items-center gap-3 p-4 rounded-xl shadow-sm transition-all hover:scale-[1.01] ${action.style}`}
            >
              <action.icon className="w-5 h-5" />
              <span className="font-semibold text-sm">{action.label}</span>
            </Link>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-semibold text-foreground">{t.recentCases.title}</h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground font-semibold text-xs uppercase tracking-wider"
                onClick={() => navigate("/dashboard/my-cases")}
              >
                {t.recentCases.viewAll} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-muted/50 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayedCases.map((caseItem) => (
                    <tr
                      key={caseItem.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-foreground">{caseItem.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{caseItem.date}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider text-white ${caseItem.statusColor}`}>
                          {caseItem.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => openDetails(caseItem)}>
                          <Eye className="h-4 w-4" />
                          {t.recentCases.viewDetails}
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {displayedCases.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-sm text-muted-foreground">
                        {t.recentCases.empty}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
        {selectedDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
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
                    src={selectedDetails.lawyer?.profile_photo}
                    alt={selectedDetails.lawyer?.name || "Lawyer"}
                    className="mb-3 h-20 w-20"
                  />
                  <p className="mb-2 text-sm font-semibold">{t.recentCases.assignedLawyer}</p>
                  {selectedDetails.lawyer ? (
                    <>
                      <h3 className="font-semibold">{selectedDetails.lawyer.name || "Lawyer"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t.recentCases.email}: {selectedDetails.lawyer.email || "Not provided"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t.recentCases.phone}: {selectedDetails.lawyer.phone || "Not provided"}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t.recentCases.noLawyer}</p>
                  )}
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
                            <div key={doc.id} className="rounded-lg border border-border p-3 text-sm text-muted-foreground">
                              {doc.file_name || "Document"}
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

export default CitizenDashboard;
