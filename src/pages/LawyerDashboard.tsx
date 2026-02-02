import { motion } from "framer-motion";
import { 
  Briefcase, 
  Users, 
  Calendar, 
  TrendingUp,
  Clock,
  MessageSquare,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import StatCard from "@/components/Dashboard/StatCard";
import CaseCard from "@/components/Dashboard/CaseCard";

// 1. Define Props Interface
interface LawyerDashboardProps {
  lang?: string;
}

// 2. Translations Object
const translations = {
  en: {
    greeting: "Welcome",
    subtitle: "You have {count} hearings scheduled this week",
    btns: { schedule: "View Schedule", newClient: "New Client" },
    stats: ["Active Cases", "Clients", "Hearings This Week", "Success Rate"],
    statTrends: ["this month", "new", "tomorrow", "this year"],
    titles: { activeCases: "Active Cases", schedule: "Today's Hearings", messages: "Recent Messages" },
    viewAll: "View All",
    viewAllMsgs: "View All Messages",
    caseLabels: { progress: "In Progress", pending: "Pending" },
    msgTime: "ago"
  },
  rw: {
    greeting: "Murakaza neza",
    subtitle: "Ufite imanza {count} kuri gahunda muri iki cyumweru",
    btns: { schedule: "Reba Gahunda", newClient: "Umukiriya Mushya" },
    stats: ["Imanza zikurikiranwa", "Abakiriya", "Imanza z'iki cyumweru", "Igipimo cy'intsinzi"],
    statTrends: ["uku kwezi", "bashya", "ejo", "uyu mwaka"],
    titles: { activeCases: "Imanza zikurikiranwa", schedule: "Iburanisha ryuyu munsi", messages: "Ubutumwa bwa vuba" },
    viewAll: "Reba zose",
    viewAllMsgs: "Ubutumwa bwose",
    caseLabels: { progress: "Birakomeje", pending: "Birategereje" },
    msgTime: "hashize"
  },
  fr: {
    greeting: "Bienvenue",
    subtitle: "Vous avez {count} audiences prévues cette semaine",
    btns: { schedule: "Voir l'horaire", newClient: "Nouveau client" },
    stats: ["Affaires actives", "Clients", "Audiences de la semaine", "Taux de réussite"],
    statTrends: ["ce mois", "nouveaux", "demain", "cette année"],
    titles: { activeCases: "Affaires actives", schedule: "Audiences d'aujourd'hui", messages: "Messages récents" },
    viewAll: "Voir tout",
    viewAllMsgs: "Tous les messages",
    caseLabels: { progress: "En cours", pending: "En attente" },
    msgTime: "il y a"
  }
};

const LawyerDashboard = ({ lang = "en" }: LawyerDashboardProps) => {
  // Select translation
  const t = translations[lang as keyof typeof translations] || translations.en;

  // Get User Data
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;

  const stats = [
    { title: t.stats[0], value: "15", icon: Briefcase, trend: `+3 ${t.statTrends[0]}`, color: "primary" as const },
    { title: t.stats[1], value: "28", icon: Users, trend: `+5 ${t.statTrends[1]}`, color: "secondary" as const },
    { title: t.stats[2], value: "6", icon: Calendar, trend: `2 ${t.statTrends[2]}`, color: "accent" as const },
    { title: t.stats[3], value: "87%", icon: TrendingUp, trend: `+2% ${t.statTrends[3]}`, color: "primary" as const },
  ];

  const cases = [
    {
      id: "CASE-2024-045",
      title: "Commercial Dispute - ABC Corp vs XYZ Ltd",
      status: t.caseLabels.progress as any,
      date: "Jan 8, 2024",
      lawyer: "High Court, Kigali",
      nextHearing: "Jan 18, 2024",
    },
    {
      id: "CASE-2024-039",
      title: "Property Transfer - Uwimana Estate",
      status: t.caseLabels.pending as any,
      date: "Jan 5, 2024",
      lawyer: "Primary Court, Gasabo",
      nextHearing: "Jan 22, 2024",
    },
    {
      id: "CASE-2024-032",
      title: "Criminal Defense - State vs Mugabo",
      status: t.caseLabels.progress as any,
      date: "Jan 2, 2024",
      lawyer: "Intermediate Court",
      nextHearing: "Jan 15, 2024",
    },
  ];

  const upcomingHearings = [
    { time: "09:00 AM", case: "ABC Corp vs XYZ", court: "High Court, Room 3" },
    { time: "11:30 AM", case: "State vs Mugabo", court: "Intermediate Court" },
    { time: "02:00 PM", case: "Uwimana Estate", court: "Primary Court" },
  ];

  return (
    <DashboardLayout 
      role="lawyer" 
      userName={user?.name || "Me. Lawyer"} 
      lang={lang}
    >
      <div className="space-y-6">
        {/* Welcome Section with Institution Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            {/* BRAND LOGO ADDED HERE */}
            <div className="hidden sm:flex w-14 h-14 bg-primary rounded-xl items-center justify-center p-2 shadow-lg">
              <img 
                src="/logo.png" 
                alt="UBUTABERAhub Logo" 
                className="w-full h-full object-contain" 
              />
            </div>

            <div className="flex items-center gap-3">
              <img
                src={user?.profilePhoto || "/avatar/avatar.png"}
                alt={user?.name || "Lawyer"}
                className="w-12 h-12 rounded-full object-cover border-2 border-primary"
              />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {t.greeting}, {user?.name || "Advocate"}!
                </h1>
                <p className="text-muted-foreground">{t.subtitle.replace("{count}", "6")}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              {t.btns.schedule}
            </Button>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              {t.btns.newClient}
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

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cases List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{t.titles.activeCases}</h2>
              <Button variant="ghost" size="sm">{t.viewAll}</Button>
            </div>
            <div className="space-y-4">
              {cases.map((caseItem, index) => (
                <motion.div
                  key={caseItem.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CaseCard {...caseItem} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Schedule */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card rounded-xl p-6 border shadow-soft"
            >
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                {t.titles.schedule}
              </h3>
              <div className="space-y-4">
                {upcomingHearings.map((hearing, index) => (
                  <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted/50 border-l-4 border-primary">
                    <div className="text-sm font-medium text-primary">{hearing.time}</div>
                    <div>
                      <p className="text-sm font-medium">{hearing.case}</p>
                      <p className="text-xs text-muted-foreground">{hearing.court}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Client Messages */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-xl p-6 border shadow-soft"
            >
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-secondary" />
                {t.titles.messages}
              </h3>
              <div className="space-y-3">
                {[
                  { name: "Jean-Claude M.", message: "Thank you for the update...", time: `2h ${t.msgTime}` },
                  { name: "Marie U.", message: "When is our next meeting?", time: `5h ${t.msgTime}` }
                ].map((msg, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/20 cursor-pointer transition-colors border border-transparent hover:border-border">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold border border-primary/20">
                      {msg.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{msg.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{msg.message}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{msg.time}</span>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-3">
                {t.viewAllMsgs}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LawyerDashboard;