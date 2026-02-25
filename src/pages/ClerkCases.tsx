import { motion } from "framer-motion";
import { Filter, Search, CheckCircle, XCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";

interface ClerkCasesProps {
  lang?: string;
}

const translations = {
  en: {
    title: "Case Filings",
    subtitle: "Process and manage case submissions",
    search: "Search filings...",
    filter: "Filter",
    review: "Review",
    approve: "Approve",
    reject: "Reject",
    status: { pending: "Pending Review", approved: "Approved", missing: "Documents Missing", ready: "Ready for Judge" },
    filed: "Filed",
    submittedBy: "Submitted By"
  },
  rw: {
    title: "Dosiye z'imanza",
    subtitle: "Tunganya no gucunga dosiye zatanzwe",
    search: "Shakisha dosiye...",
    filter: "Shungura",
    review: "Sura",
    approve: "Kwemeza",
    reject: "Kwanga",
    status: { pending: "Irategereje", approved: "Yemerejwe", missing: "Inyandiko zibura", ready: "Yiteguye gucirwa urubanza" },
    filed: "Yatanzwe",
    submittedBy: "Uwayitanze"
  },
  fr: {
    title: "Dépôts de dossiers",
    subtitle: "Traiter et gérer les soumissions",
    search: "Rechercher des dépôts...",
    filter: "Filtrer",
    review: "Réviser",
    approve: "Approuver",
    reject: "Rejeter",
    status: { pending: "En attente", approved: "Approuvé", missing: "Documents manquants", ready: "Prêt pour le juge" },
    filed: "Déposé",
    submittedBy: "Soumis par"
  }
};

const ClerkCases = ({ lang = "en" }: ClerkCasesProps) => {
  const t = translations[lang as keyof typeof translations] || translations.en;
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;

  const filings = [
    {
      id: "FILE-2024-156",
      title: "New Case Filing - Property Dispute",
      submittedBy: "Jean-Claude Mugisha",
      type: "Civil",
      date: "Jan 10, 2024",
      status: t.status.pending,
      statusColor: "default"
    },
    {
      id: "FILE-2024-155",
      title: "Appeal Submission - Criminal Case",
      submittedBy: "Me. Marie Uwimana",
      type: "Criminal",
      date: "Jan 10, 2024",
      status: t.status.missing,
      statusColor: "destructive"
    },
    {
      id: "FILE-2024-154",
      title: "Evidence Submission - CASE-2024-032",
      submittedBy: "Me. Jean Habimana",
      type: "Evidence",
      date: "Jan 9, 2024",
      status: t.status.ready,
      statusColor: "secondary"
    },
    {
      id: "FILE-2024-153",
      title: "Motion for Extension",
      submittedBy: "Me. Patrick Nkurunziza",
      type: "Motion",
      date: "Jan 9, 2024",
      status: t.status.approved,
      statusColor: "default"
    }
  ];

  return (
    <DashboardLayout role="clerk" userName={user?.name || "Court Clerk"} lang={lang}>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{t.title}</h1>
            <p className="text-muted-foreground mt-1">{t.subtitle}</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            {t.filter}
          </Button>
        </motion.div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder={t.search}
            className="pl-10 bg-white border-slate-200"
          />
        </div>

        <div className="grid gap-4">
          {filings.map((filing, index) => (
            <motion.div
              key={filing.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-mono text-slate-500">{filing.id}</span>
                    <Badge variant={filing.statusColor as any}>{filing.status}</Badge>
                    <Badge variant="outline">{filing.type}</Badge>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{filing.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span>{t.submittedBy}: {filing.submittedBy}</span>
                    <span>{t.filed}: {filing.date}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-2">
                    <FileText className="w-4 h-4" />
                    {t.review}
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2 text-green-600 border-green-600 hover:bg-green-50">
                    <CheckCircle className="w-4 h-4" />
                    {t.approve}
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2 text-red-600 border-red-600 hover:bg-red-50">
                    <XCircle className="w-4 h-4" />
                    {t.reject}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClerkCases;
