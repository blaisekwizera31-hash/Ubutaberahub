import { motion } from "framer-motion";
import { 
  Gavel, 
  FileText, 
  Calendar, 
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Scale
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import StatCard from "@/components/Dashboard/StatCard";

interface JudgeDashboardProps {
  lang?: string;
}

const translations = {
  en: {
    greeting: "Good Morning",
    subtitle: "You have {count} hearings scheduled for today",
    btns: { calendar: "Court Calendar", ruling: "Issue Ruling" },
    stats: [
      { title: "Cases for Review", trend: "5 urgent" },
      { title: "Hearings Today", trend: "Next at 10:00" },
      { title: "Pending Rulings", trend: "3 due this week" },
      { title: "Cases Closed", trend: "+8 vs last month" }
    ],
    titles: { attention: "Cases Requiring Attention", schedule: "Today's Schedule", performance: "This Month's Performance" },
    table: { viewAll: "View All Cases", review: "Review", ruling: "Ruling", filed: "Filed" },
    perf: ["Cases Resolved", "Avg. Resolution Time", "Rulings Issued", "days"],
    priority: { urgent: "Urgent", high: "High", normal: "Normal" },
    status: { awaiting: "Awaiting Ruling", review: "Evidence Review", scheduled: "Hearing Scheduled" },
    cases: [
      { title: "Commercial Dispute - ABC Corp vs XYZ Ltd", type: "Civil", parties: "ABC Corporation vs XYZ Limited" },
      { title: "Criminal Defense - State vs Mugabo", type: "Criminal", parties: "Republic of Rwanda vs Patrick Mugabo" },
      { title: "Family Matter - Inheritance Dispute", type: "Family", parties: "Uwimana Family" }
    ],
    schedule: [
      { type: "Oral Arguments", room: "Courtroom 1" },
      { type: "Evidence Hearing", room: "Courtroom 1" },
      { type: "Preliminary", room: "Courtroom 2" },
      { type: "Final Ruling", room: "Courtroom 1" }
    ]
  },
  rw: {
    greeting: "Mwaramutse",
    subtitle: "Ufite imanza {count} kuri gahunda uyu munsi",
    btns: { calendar: "Kalendari y'inkiko", ruling: "Sohora umwanzuro" },
    stats: [
      { title: "Imanza zo gusuzuma", trend: "5 zihutirwa" },
      { title: "Imanza z'uyu munsi", trend: "Ikurikiyeho saa 10:00" },
      { title: "Imyanzuro itegerejwe", trend: "3 muri iki cyumweru" },
      { title: "Imanza zafunzwe", trend: "+8 ugereranyije n'ukwezi gushize" }
    ],
    titles: { attention: "Imanza zikeneye kwitambira", schedule: "Gahunda y'uyu munsi", performance: "Imihigo y'uku kwezi" },
    table: { viewAll: "Reba zose", review: "Suzuma", ruling: "Umwanzuro", filed: "Yatanzwe" },
    perf: ["Imanza zarakemutse", "Igihe mpuzandengo", "Imyanzuro yatanzwe", "iminsi"],
    priority: { urgent: "Byihutirwa", high: "Bikomeye", normal: "Bisanzwe" },
    status: { awaiting: "Hategerejwe umwanzuro", review: "Gusuzuma ibimenyetso", scheduled: "Yashyizwe kuri gahunda" },
    cases: [
      { title: "Amakimbirane y'ubucuruzi - ABC Corp vs XYZ Ltd", type: "Imbonezamubano", parties: "Ikigo ABC vs XYZ Limited" },
      { title: "Urubanza mpanabyaha - Leta vs Mugabo", type: "Inshinjabyaha", parties: "Repubulika y'u Rwanda vs Patrick Mugabo" },
      { title: "Ikibazo cy'umuryango - Izungura", type: "Umuryango", parties: "Umuryango wa Uwimana" }
    ],
    schedule: [
      { type: "Iburanisha", room: "Icyumba cya 1" },
      { type: "Gusuzuma ibimenyetso", room: "Icyumba cya 1" },
      { type: "Ibanze", room: "Icyumba cya 2" },
      { type: "Umwanzuro wa nyuma", room: "Icyumba cya 1" }
    ]
  },
  fr: {
    greeting: "Bon matin",
    subtitle: "Vous avez {count} audiences prévues aujourd'hui",
    btns: { calendar: "Calendrier judiciaire", ruling: "Rendre une décision" },
    stats: [
      { title: "Dossiers à réviser", trend: "5 urgents" },
      { title: "Audiences aujourd'hui", trend: "Prochaine à 10:00" },
      { title: "Décisions en attente", trend: "3 cette semaine" },
      { title: "Dossiers clôturés", trend: "+8 vs mois dernier" }
    ],
    titles: { attention: "Dossiers nécessitant une attention", schedule: "Programme du jour", performance: "Performance du mois" },
    table: { viewAll: "Voir tout", review: "Réviser", ruling: "Décision", filed: "Déposé" },
    perf: ["Dossiers résolus", "Temps de résolution moyen", "Décisions rendues", "jours"],
    priority: { urgent: "Urgent", high: "Élevée", normal: "Normale" },
    status: { awaiting: "En attente de décision", review: "Examen des preuves", scheduled: "Audience prévue" },
    cases: [
      { title: "Litige commercial - ABC Corp vs XYZ Ltd", type: "Civil", parties: "ABC Corporation vs XYZ Limited" },
      { title: "Défense pénale - État vs Mugabo", type: "Pénal", parties: "République du Rwanda vs Patrick Mugabo" },
      { title: "Affaire familiale - Litige de succession", type: "Famille", parties: "Famille Uwimana" }
    ],
    schedule: [
      { type: "Plaidoiries", room: "Salle d'audience 1" },
      { type: "Audition des preuves", room: "Salle d'audience 1" },
      { type: "Préliminaire", room: "Salle d'audience 2" },
      { type: "Décision finale", room: "Salle d'audience 1" }
    ]
  }
};

const JudgeDashboard = ({ lang = "en" }: JudgeDashboardProps) => {
  const t = translations[lang as keyof typeof translations] || translations.en;
  
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;

  const stats = [
    { title: t.stats[0].title, value: "12", icon: FileText, trend: t.stats[0].trend, color: "primary" as const },
    { title: t.stats[1].title, value: "4", icon: Calendar, trend: t.stats[1].trend, color: "secondary" as const },
    { title: t.stats[2].title, value: "8", icon: Gavel, trend: t.stats[2].trend, color: "accent" as const },
    { title: t.stats[3].title, value: "23", icon: CheckCircle, trend: t.stats[3].trend, color: "primary" as const },
  ];

  const caseData = [
    { id: "CASE-2024-045", date: "Jan 8, 2024", priority: t.priority.high, status: t.status.awaiting, ...t.cases[0] },
    { id: "CASE-2024-032", date: "Jan 2, 2024", priority: t.priority.urgent, status: t.status.review, ...t.cases[1] },
    { id: "CASE-2024-028", date: "Dec 28, 2023", priority: t.priority.normal, status: t.status.scheduled, ...t.cases[2] },
  ];

  const getPriorityColor = (p: string) => {
    if (p === t.priority.urgent) return "destructive";
    if (p === t.priority.high) return "default";
    return "secondary";
  };

  return (
    <DashboardLayout 
      role="judge" 
      userName={user?.name || "Hon. Justice"} 
      lang={lang}
    >
      <div className="space-y-6">
        {/* Welcome Section with Institution Logo */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* BRAND LOGO ADDED HERE */}
            <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center p-2 shadow-lg">
              <img 
                src="/logow.png" 
                alt="UBUTABERAhub Logo" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div className="flex items-center gap-3">
              <img src={user?.profilePhoto || "/avatar/avatar.png"} alt="Profile" className="w-12 h-12 rounded-full border-2 border-primary object-cover" />
              <div>
                <h1 className="text-2xl font-bold">{t.greeting}, {user?.name || "Justice"}</h1>
                <p className="text-muted-foreground">{t.subtitle.replace("{count}", "4")}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="w-4 h-4" />
              {t.btns.calendar}
            </Button>
            <Button size="sm" className="gap-2">
              <Scale className="w-4 h-4" />
              {t.btns.ruling}
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <StatCard {...stat} />
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{t.titles.attention}</h2>
              <Button variant="ghost" size="sm">{t.table.viewAll}</Button>
            </div>
            {caseData.map((c) => (
              <motion.div key={c.id} className="bg-card p-5 rounded-xl border shadow-sm flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <span className="text-xs font-mono text-muted-foreground">{c.id}</span>
                    <Badge variant={getPriorityColor(c.priority)}>{c.priority}</Badge>
                    <Badge variant="outline">{c.type}</Badge>
                  </div>
                  <h3 className="font-bold">{c.title}</h3>
                  <p className="text-sm text-muted-foreground">{c.parties}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {t.table.filed}: {c.date}</span>
                    <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {c.status}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="gap-1"><Eye className="w-3 h-3" /> {t.table.review}</Button>
                  <Button size="sm" className="gap-1"><Gavel className="w-3 h-3" /> {t.table.ruling}</Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <div className="bg-card p-6 rounded-xl border shadow-sm">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> {t.titles.schedule}
              </h3>
              <div className="space-y-4">
                {t.schedule.map((item, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/50 border-l-4 border-primary">
                    <div className="flex justify-between text-xs font-bold text-primary mb-1">
                      <span>{["10:00 AM", "11:30 AM", "02:00 PM", "04:00 PM"][i]}</span>
                      <span className="text-muted-foreground">{item.room}</span>
                    </div>
                    <p className="text-sm font-medium">
                      {["ABC Corp vs XYZ", "State vs Mugabo", "Uwimana Estate", "Land Registry"][i]}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.type}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary p-6 rounded-xl text-primary-foreground shadow-md">
              <h3 className="font-bold mb-4">{t.titles.performance}</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span>{t.perf[0]}</span><span className="font-bold">23</span></div>
                <div className="flex justify-between text-sm"><span>{t.perf[1]}</span><span className="font-bold">18 {t.perf[3]}</span></div>
                <div className="flex justify-between text-sm"><span>{t.perf[2]}</span><span className="font-bold">31</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JudgeDashboard;