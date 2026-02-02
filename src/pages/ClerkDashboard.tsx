import { useState } from "react";
import { motion } from "framer-motion";
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

const translations = {
  en: {
    sidebar: {
      dashboard: "Dashboard",
      cases: "My Cases",
      ai: "AI Assistant",
      lawyers: "Find Lawyers",
      appoint: "Appointments",
      resources: "Legal Resources",
      settings: "Settings",
      signOut: "Sign Out"
    },
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
    sidebar: {
      dashboard: "Ikarita mpuruza",
      cases: "Imanza zanjye",
      ai: "Ubufasha bwa AI",
      lawyers: "Shaka abanyamategeko",
      appoint: "Gahunda",
      resources: "Amategeko n'izindi mbuga",
      settings: "Igenamiterere",
      signOut: "Sohoka"
    },
    greeting: "Mwaramutse",
    pendingSubtitle: "Ufite amadosiye {count} agutegereje",
    scheduleBtn: "Gahunda y'iburanisha",
    newFilingBtn: "Kwandika idosiye nshya",
    stats: ["Amadosiye ategereje", "Ayatunganyijwe uyu munsi", "Imanza ziteguwe", "Abasabye inyandiko"],
    statTrends: ["uyu munsi", "ugereranyije n'ejo", "Iyi cyumweru", "byihutirwa"],
    tableTitle: "Amadosiye ategereje",
    searchPlaceholder: "Shakisha idosiye...",
    tableHeaders: ["ID y'idosiye", "Ibisobanuro", "Uwayitanze", "Ubwoko", "Itariki", "Imiterere", "Icyakorwa"],
    actions: { review: "Gusuzuma", approve: "Kwemeza", reject: "Kwangira", request: "Gusaba inyandiko" },
    statusTexts: { pending: "Isuzuma rirakomeje", missing: "Inyandiko zibura", ready: "Biteguye Umucamanza" },
    pagination: "Hagaragajwe {show} kuri {total}",
    prev: "Icyabanjirije",
    next: "Ibikurikira"
  },
  fr: {
    sidebar: {
      dashboard: "Tableau de bord",
      cases: "Mes dossiers",
      ai: "Assistant IA",
      lawyers: "Trouver un avocat",
      appoint: "Rendez-vous",
      resources: "Ressources juridiques",
      settings: "Paramètres",
      signOut: "Se déconnecter"
    },
    greeting: "Bon matin",
    pendingSubtitle: "Vous avez {count} dossiers en attente de traitement",
    scheduleBtn: "Programmer l'audience",
    newFilingBtn: "Nouveau dépôt",
    stats: ["Dépôts en attente", "Traités aujourd'hui", "Audiences prévues", "Demandes de documents"],
    statTrends: ["aujourd'hui", "par rapport à hier", "Cette semaine", "urgents"],
    tableTitle: "Dépôts en attente",
    searchPlaceholder: "Rechercher des dépôts...",
    tableHeaders: ["ID du dépôt", "Description", "Soumis par", "Type", "Date", "Statut", "Actions"],
    actions: { review: "Réviser", approve: "Approuver", reject: "Rejeter", request: "Demander documents" },
    statusTexts: { pending: "Examen en cours", missing: "Documents manquants", ready: "Prêt pour le juge" },
    pagination: "Affichage de {show} sur {total} dépôts",
    prev: "Précédent",
    next: "Suivant"
  }
};

interface ClerkDashboardProps {
  lang?: string;
}

const ClerkDashboard = ({ lang = "en" }: ClerkDashboardProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const t = translations[lang as keyof typeof translations] || translations.en;

  const loggedInUser = localStorage.getItem("loggedInUser");
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
      userName={user?.name || "Court Clerk"} 
      lang={lang} 
    >
      <div className="space-y-6">
        {/* Welcome Section with LOGO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            {/* BRAND LOGO ADDED HERE */}
            <div className="hidden sm:flex w-14 h-14 bg-primary rounded-xl items-center justify-center p-2 shadow-soft">
              <img src="/logow.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            
            <div className="flex items-center gap-3">
              <img
                src={user?.profilePhoto || "/avatar/avatar.png"}
                alt={user?.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-primary"
              />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {t.greeting}, {user?.name || "Diane"}!
                </h1>
                <p className="text-muted-foreground">{t.pendingSubtitle.replace("{count}", "24")}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              {t.scheduleBtn}
            </Button>
            <Button className="gap-2">
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
          className="bg-card rounded-xl border shadow-soft"
        >
          <div className="p-4 md:p-6 border-b">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">{t.tableTitle}</h2>
              <div className="flex gap-3">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  {t.tableHeaders.map((header) => (
                    <th key={header} className="text-left p-4 font-medium text-muted-foreground">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pendingFilings.map((filing) => (
                  <tr key={filing.id} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-mono text-sm">{filing.id}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{filing.title}</p>
                        <p className="text-sm text-muted-foreground">{filing.documents} docs</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm">{filing.submittedBy}</td>
                    <td className="p-4">
                      <Badge variant="outline">{filing.type}</Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{filing.date}</td>
                    <td className="p-4">
                      <Badge variant={getStatusColor(filing.status)}>{filing.status}</Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">{t.actions.review}</Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <CheckCircle className="w-4 h-4" /> {t.actions.approve}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
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
              <Button variant="outline" size="sm" disabled>{t.prev}</Button>
              <Button variant="outline" size="sm">{t.next}</Button>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ClerkDashboard;