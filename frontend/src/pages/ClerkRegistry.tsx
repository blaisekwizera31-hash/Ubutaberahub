import { motion } from "framer-motion";
import { Search, Plus, Users, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";

interface ClerkRegistryProps {
  lang?: string;
}

const translations = {
  en: {
    title: "Court Registry",
    subtitle: "Manage court records and registrations",
    search: "Search registry...",
    newEntry: "New Entry",
    stats: ["Total Records", "New This Month", "Pending Updates"],
    type: "Type",
    date: "Date",
    status: "Status",
    viewDetails: "View Details"
  },
  rw: {
    title: "Ubwanditsi bw'urukiko",
    subtitle: "Cunga inyandiko n'iyandikwa ry'urukiko",
    search: "Shakisha mu bwanditsi...",
    newEntry: "Iyandikwa rishya",
    stats: ["Inyandiko zose", "Nshya uku kwezi", "Zitegereje kuvugururwa"],
    type: "Ubwoko",
    date: "Itariki",
    status: "Imiterere",
    viewDetails: "Reba ibisobanuro"
  },
  fr: {
    title: "Greffe du tribunal",
    subtitle: "Gérer les dossiers et enregistrements",
    search: "Rechercher dans le greffe...",
    newEntry: "Nouvelle entrée",
    stats: ["Total des dossiers", "Nouveaux ce mois", "Mises à jour en attente"],
    type: "Type",
    date: "Date",
    status: "Statut",
    viewDetails: "Voir les détails"
  }
};

const ClerkRegistry = ({ lang = "en" }: ClerkRegistryProps) => {
  const t = translations[lang as keyof typeof translations] || translations.en;
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;

  const stats = [
    { label: t.stats[0], value: "1,247", icon: FileText, color: "bg-blue-500" },
    { label: t.stats[1], value: "89", icon: Calendar, color: "bg-green-500" },
    { label: t.stats[2], value: "23", icon: Users, color: "bg-orange-500" }
  ];

  const registryEntries = [
    {
      id: "REG-2024-156",
      title: "Case Registration - Property Dispute",
      type: "Case Filing",
      date: "Jan 10, 2024",
      status: "Active",
      statusColor: "bg-green-500"
    },
    {
      id: "REG-2024-155",
      title: "Lawyer Registration - Me. Marie Uwimana",
      type: "Lawyer Registration",
      date: "Jan 10, 2024",
      status: "Approved",
      statusColor: "bg-blue-500"
    },
    {
      id: "REG-2024-154",
      title: "Document Archive - CASE-2023-089",
      type: "Archive",
      date: "Jan 9, 2024",
      status: "Completed",
      statusColor: "bg-slate-500"
    },
    {
      id: "REG-2024-153",
      title: "Court Order Registration",
      type: "Court Order",
      date: "Jan 9, 2024",
      status: "Pending",
      statusColor: "bg-orange-500"
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
          <Button className="gap-2 bg-[#1a2b4b] hover:bg-[#111c32]">
            <Plus className="w-4 h-4" />
            {t.newEntry}
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl border border-slate-200 p-6"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-sm text-slate-600">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder={t.search}
            className="pl-10 bg-white border-slate-200"
          />
        </div>

        <div className="grid gap-4">
          {registryEntries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-mono text-slate-500">{entry.id}</span>
                    <Badge className={`${entry.statusColor} text-white border-none`}>
                      {entry.status}
                    </Badge>
                    <Badge variant="outline">{entry.type}</Badge>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{entry.title}</h3>
                  <p className="text-sm text-slate-600">{t.date}: {entry.date}</p>
                </div>
                <Button size="sm" variant="outline">
                  {t.viewDetails}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClerkRegistry;
