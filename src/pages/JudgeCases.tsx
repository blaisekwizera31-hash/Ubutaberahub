import { motion } from "framer-motion";
import { Filter, Eye, Gavel, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";

interface JudgeCasesProps {
  lang?: string;
}

const translations = {
  en: {
    title: "Cases for Review",
    subtitle: "All cases assigned to you for judgment",
    filter: "Filter",
    review: "Review",
    ruling: "Issue Ruling",
    priority: { urgent: "Urgent", high: "High", normal: "Normal" },
    status: { awaiting: "Awaiting Ruling", review: "Evidence Review", scheduled: "Hearing Scheduled", closed: "Closed" },
    filed: "Filed",
    type: "Type",
    parties: "Parties"
  },
  rw: {
    title: "Imanza zo gusuzuma",
    subtitle: "Imanza zose wahawe gusuzuma",
    filter: "Shungura",
    review: "Sura",
    ruling: "Tanga icyemezo",
    priority: { urgent: "Byihutirwa", high: "Byingenzi", normal: "Bisanzwe" },
    status: { awaiting: "Itegereje icyemezo", review: "Isuzuma ry'ibimenyetso", scheduled: "Iburanisha ryateganijwe", closed: "Ryarangiye" },
    filed: "Ryatanzwe",
    type: "Ubwoko",
    parties: "Abarwanira"
  },
  fr: {
    title: "Dossiers à examiner",
    subtitle: "Tous les dossiers qui vous sont assignés",
    filter: "Filtrer",
    review: "Réviser",
    ruling: "Rendre jugement",
    priority: { urgent: "Urgent", high: "Élevé", normal: "Normal" },
    status: { awaiting: "En attente de jugement", review: "Examen des preuves", scheduled: "Audience prévue", closed: "Fermé" },
    filed: "Déposé",
    type: "Type",
    parties: "Parties"
  }
};

const JudgeCases = ({ lang = "en" }: JudgeCasesProps) => {
  const t = translations[lang as keyof typeof translations] || translations.en;
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;

  const cases = [
    {
      id: "CASE-2024-045",
      title: "Commercial Dispute - ABC Corp vs XYZ Ltd",
      type: "Civil",
      parties: "ABC Corporation vs XYZ Limited",
      status: t.status.awaiting,
      priority: t.priority.high,
      date: "Jan 8, 2024",
      priorityColor: "bg-orange-500"
    },
    {
      id: "CASE-2024-032",
      title: "Criminal Defense - State vs Mugabo",
      type: "Criminal",
      parties: "Republic of Rwanda vs Patrick Mugabo",
      status: t.status.review,
      priority: t.priority.urgent,
      date: "Jan 2, 2024",
      priorityColor: "bg-red-500"
    },
    {
      id: "CASE-2024-028",
      title: "Family Matter - Inheritance Dispute",
      type: "Family",
      parties: "Uwimana Family",
      status: t.status.scheduled,
      priority: t.priority.normal,
      date: "Dec 28, 2023",
      priorityColor: "bg-slate-500"
    },
    {
      id: "CASE-2023-089",
      title: "Property Boundary Dispute",
      type: "Civil",
      parties: "Habimana vs Niyonzima",
      status: t.status.closed,
      priority: t.priority.normal,
      date: "Dec 15, 2023",
      priorityColor: "bg-slate-500"
    }
  ];

  return (
    <DashboardLayout role="judge" userName={user?.name || "Hon. Judge"} lang={lang}>
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
                    <Badge className={`${caseItem.priorityColor} text-white border-none`}>
                      {caseItem.priority}
                    </Badge>
                    <Badge variant="outline">{caseItem.type}</Badge>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{caseItem.title}</h3>
                  <p className="text-sm text-slate-600 mb-3">{caseItem.parties}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{t.filed}: {caseItem.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{caseItem.status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-2">
                    <Eye className="w-4 h-4" />
                    {t.review}
                  </Button>
                  <Button size="sm" className="gap-2 bg-blue-900 hover:bg-blue-950">
                    <Gavel className="w-4 h-4" />
                    {t.ruling}
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

export default JudgeCases;
