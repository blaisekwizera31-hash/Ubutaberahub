import { motion } from "framer-motion";
import { Filter, Plus, Eye, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";

interface LawyerCasesProps {
  lang?: string;
}

const translations = {
  en: {
    title: "My Cases",
    subtitle: "Manage all your active and closed cases",
    filter: "Filter",
    newCase: "New Case",
    viewAll: "View All",
    review: "Review",
    statuses: { inProgress: "In Progress", pending: "Pending", completed: "Completed", urgent: "Urgent" },
    filed: "Filed",
    nextHearing: "Next Hearing",
    client: "Client"
  },
  rw: {
    title: "Imanza zanjye",
    subtitle: "Cunga imanza zawe zose",
    filter: "Shungura",
    newCase: "Ikirego gishya",
    viewAll: "Reba zose",
    review: "Sura",
    statuses: { inProgress: "Birakomeje", pending: "Birategereje", completed: "Byarangiye", urgent: "Byihutirwa" },
    filed: "Yatanzwe",
    nextHearing: "Iburanisha rikurikira",
    client: "Umukiriya"
  },
  fr: {
    title: "Mes dossiers",
    subtitle: "Gérer tous vos dossiers actifs et clos",
    filter: "Filtrer",
    newCase: "Nouveau dossier",
    viewAll: "Voir tout",
    review: "Réviser",
    statuses: { inProgress: "En cours", pending: "En attente", completed: "Terminé", urgent: "Urgent" },
    filed: "Déposé",
    nextHearing: "Prochaine audience",
    client: "Client"
  }
};

const LawyerCases = ({ lang = "en" }: LawyerCasesProps) => {
  const t = translations[lang as keyof typeof translations] || translations.en;
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;

  const cases = [
    {
      id: "CASE-2024-045",
      title: "Commercial Dispute - ABC Corp vs XYZ Ltd",
      status: t.statuses.inProgress,
      statusColor: "bg-amber-500",
      date: "Jan 8, 2024",
      client: "ABC Corporation",
      nextHearing: "Jan 18, 2024",
      priority: "high"
    },
    {
      id: "CASE-2024-039",
      title: "Property Transfer - Uwimana Estate",
      status: t.statuses.pending,
      statusColor: "bg-slate-500",
      date: "Jan 5, 2024",
      client: "Marie Uwimana",
      nextHearing: "Jan 22, 2024",
      priority: "normal"
    },
    {
      id: "CASE-2024-032",
      title: "Criminal Defense - State vs Mugabo",
      status: t.statuses.urgent,
      statusColor: "bg-red-500",
      date: "Jan 2, 2024",
      client: "Patrick Mugabo",
      nextHearing: "Jan 15, 2024",
      priority: "urgent"
    },
    {
      id: "CASE-2023-089",
      title: "Contract Review - Business Partnership",
      status: t.statuses.completed,
      statusColor: "bg-green-500",
      date: "Dec 28, 2023",
      client: "Tech Solutions Ltd",
      nextHearing: "-",
      priority: "normal"
    }
  ];

  return (
    <DashboardLayout role="lawyer" userName={user?.name || "Advocate"} lang={lang}>
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
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              {t.filter}
            </Button>
            <Button className="gap-2 bg-[#1a2b4b] hover:bg-[#111c32]">
              <Plus className="w-4 h-4" />
              {t.newCase}
            </Button>
          </div>
        </motion.div>

        <div className="grid gap-4">
          {cases.map((caseItem, index) => (
            <motion.div
              key={caseItem.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-mono text-slate-500">{caseItem.id}</span>
                    <Badge className={`${caseItem.statusColor} text-white border-none`}>
                      {caseItem.status}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">{caseItem.title}</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-4 h-4" />
                      <span>{t.filed}: {caseItem.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>{t.client}: {caseItem.client}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-4 h-4" />
                      <span>{t.nextHearing}: {caseItem.nextHearing}</span>
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="gap-2">
                  <Eye className="w-4 h-4" />
                  {t.review}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LawyerCases;
