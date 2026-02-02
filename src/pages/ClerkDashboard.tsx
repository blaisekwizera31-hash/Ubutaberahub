import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Upload, 
  Search, 
  Filter, 
  MoreVertical 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import StatCard from "@/components/Dashboard/StatCard";

// Full Translations for EN, RW, and FR
const translations = {
  en: {
    greeting: "Good Morning",
    pendingSubtitle: "You have {count} pending filings to process",
    scheduleBtn: "Schedule Hearing",
    newFilingBtn: "New Filing",
    stats: ["Pending Filings", "Processed Today", "Scheduled Hearings", "Document Requests"],
    statTrends: ["today", "vs yesterday", "This week", "urgent"],
    tableTitle: "Pending Filings",
    searchPlaceholder: "Search filings...",
    tableHeaders: ["Filing ID", "Description", "Submitted By", "Type", "Date", "Status", "Actions"],
    actions: { review: "Review", approve: "Approve", reject: "Reject", request: "Request Documents" },
    statusTexts: { pending: "Pending Review", missing: "Documents Missing", ready: "Ready for Judge" },
    pagination: "Showing {show} of {total} filings",
    prev: "Previous",
    next: "Next"
  },
  rw: {
    greeting: "Mwaramutse",
    pendingSubtitle: "Mufite dosiye {count} zitegereje gukorwa",
    scheduleBtn: "Gahunda y'iburanisha",
    newFilingBtn: "Dosiye nshya",
    stats: ["Dosiye zitegereje", "Zatunganyijwe uyu munsi", "Imanza ziteganijwe", "Kubaza inyandiko"],
    statTrends: ["uyu munsi", "ugereranyije n'ejo", "Iyi cyumweru", "byihutirwa"],
    tableTitle: "Dosiye zitegereje",
    searchPlaceholder: "Shakisha dosiye...",
    tableHeaders: ["ID ya Dosiye", "Ibisobanuro", "Uwayitanze", "Ubwoko", "Itariki", "Imiterere", "Ibikorwa"],
    actions: { review: "Sura", approve: "Kwemeza", reject: "Kwanze", request: "Saba inyandiko" },
    statusTexts: { pending: "Irategereje", missing: "Inyandiko zibura", ready: "Yiteguye gucirwa urubanza" },
    pagination: "Hagaragajwe {show} kuri {total} za dosiye",
    prev: "Ibanziriza",
    next: "Ikurikira"
  },
  fr: {
    greeting: "Bonjour",
    pendingSubtitle: "Vous avez {count} dossiers en attente à traiter",
    scheduleBtn: "Programmer l'audience",
    newFilingBtn: "Nouveau dossier",
    stats: ["Dossiers en attente", "Traités aujourd'hui", "Audiences prévues", "Demandes de documents"],
    statTrends: ["aujourd'hui", "vs hier", "Cette semaine", "urgent"],
    tableTitle: "Dossiers en attente",
    searchPlaceholder: "Rechercher des dossiers...",
    tableHeaders: ["ID du dossier", "Description", "Soumis par", "Type", "Date", "Statut", "Actions"],
    actions: { review: "Réviser", approve: "Approuver", reject: "Rejeter", request: "Demander documents" },
    statusTexts: { pending: "En attente", missing: "Documents manquants", ready: "Prêt pour le juge" },
    pagination: "Affichage de {show} sur {total} dossiers",
    prev: "Précédent",
    next: "Suivant"
  }
} as const;

interface ClerkDashboardProps {
  lang?: "en" | "rw" | "fr";
}

const ClerkDashboard = ({ lang = "en" }: ClerkDashboardProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // FIX: Accessing the correct translation based on lang
  const t = translations[lang] || translations.en;

  const loggedInUser = typeof window !== 'undefined' ? localStorage.getItem("loggedInUser") : null;
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;

  const stats = [
    { title: t.stats[0], value: "24", icon: FileText, trend: `8 ${t.statTrends[0]}`, color: "primary" as const },
    { title: t.stats[1], value: "18", icon: CheckCircle, trend: `+5 ${t.statTrends[1]}`, color: "secondary" as const },
    { title: t.stats[2], value: "32", icon: Calendar, trend: t.statTrends[2], color: "accent" as const },
    { title: t.stats[3], value: "7", icon: Upload, trend: `3 ${t.statTrends[3]}`, color: "primary" as const },
  ];

  const pendingFilings = [
    { id: "FILE-2024-156", title: "New Case Filing - Property Dispute", submittedBy: "Jean-Claude Mugisha", type: "Civil", date: "Jan 10, 2024", status: t.statusTexts.pending, documents: 5 },
    { id: "FILE-2024-155", title: "Appeal Submission - Criminal Case", submittedBy: "Me. Marie Uwimana", type: "Criminal", date: "Jan 10, 2024", status: t.statusTexts.missing, documents: 3 },
    { id: "FILE-2024-154", title: "Evidence Submission - CASE-2024-032", submittedBy: "Me. Jean Habimana", type: "Evidence", date: "Jan 9, 2024", status: t.statusTexts.pending, documents: 8 },
    { id: "FILE-2024-153", title: "Motion for Extension", submittedBy: "Me. Patrick Nkurunziza", type: "Motion", date: "Jan 9, 2024", status: t.statusTexts.ready, documents: 2 },
  ];

  const getStatusColor = (status: string) => {
    if (status === t.statusTexts.pending) return "default";
    if (status === t.statusTexts.missing) return "destructive";
    if (status === t.statusTexts.ready) return "secondary";
    return "outline";
  };

  return (
    <DashboardLayout 
      role="clerk" 
      userName={user?.name || "Kwizera Blaise"} 
      lang={lang} 
    >
      <div className="space-y-6">
        {/* CLEAN WELCOME SECTION - Extra Logo Completely Removed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <img
              src={user?.profilePhoto || "/avatar/avatar.png"}
              alt={user?.name}
              className="w-14 h-14 rounded-full object-cover shadow-sm"
            />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                {t.greeting}, {user?.name || "Kwizera Blaise"}!
              </h1>
              <p className="text-muted-foreground font-medium">
                {t.pendingSubtitle.replace("{count}", "24")}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="gap-2 border-slate-200">
              <Calendar className="w-4 h-4" />
              {t.scheduleBtn}
            </Button>
            <Button className="gap-2 bg-[#1a2b4b] hover:bg-[#111c32]">
              <FileText className="w-4 h-4" />
              {t.newFilingBtn}
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <StatCard {...stat} />
            </motion.div>
          ))}
        </div>

        {/* Filings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-xl border border-slate-200 shadow-sm"
        >
          <div className="p-4 md:p-6 border-b border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-slate-800">{t.tableTitle}</h2>
              <div className="flex gap-3">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-slate-50/50 border-slate-200"
                  />
                </div>
                <Button variant="outline" size="icon" className="border-slate-200">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-slate-50/50">
                  {t.tableHeaders.map((header: string) => (
                    <th key={header} className="text-left p-4 font-semibold text-slate-500 text-sm uppercase tracking-wider">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pendingFilings.map((filing) => (
                  <tr key={filing.id} className="border-b hover:bg-slate-50/30 transition-colors">
                    <td className="p-4 font-mono text-xs text-slate-500">{filing.id}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-slate-900">{filing.title}</p>
                        <p className="text-xs text-muted-foreground">{filing.documents} docs</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-700 font-medium">{filing.submittedBy}</td>
                    <td className="p-4">
                      <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">{filing.type}</Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{filing.date}</td>
                    <td className="p-4">
                      <Badge variant={getStatusColor(filing.status)} className="font-semibold">{filing.status}</Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 justify-end">
                        <Button size="sm" variant="outline" className="h-8 border-slate-200">{t.actions.review}</Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <CheckCircle className="w-4 h-4" /> {t.actions.approve}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-destructive">
                              <XCircle className="w-4 h-4" /> {t.actions.reject}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <FileText className="w-4 h-4" /> {t.actions.request}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {t.pagination.replace("{show}", "4").replace("{total}", "24")}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-slate-200" disabled>{t.prev}</Button>
              <Button variant="outline" size="sm" className="border-slate-200">{t.next}</Button>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ClerkDashboard;