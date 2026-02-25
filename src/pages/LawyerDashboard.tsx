import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  Users, 
  Calendar, 
  TrendingUp,
  Clock,
  MessageSquare,
  Plus,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import StatCard from "@/components/Dashboard/StatCard";
import CaseCard from "@/components/Dashboard/CaseCard";
import { useLanguage } from "@/contexts/LanguageContext";

// 1. COMPLETE TRANSLATIONS OBJECT
const translations = {
  en: {
    greeting: "Welcome",
    subtitle: "You have {count} hearings scheduled this week",
    btns: { schedule: "View Schedule", newClient: "New Client" },
    stats: ["Active Cases", "Clients", "Hearings", "Success Rate"],
    statTrends: ["this month", "new", "tomorrow", "this year"],
    titles: { activeCases: "Active Cases", schedule: "Today's Schedule", messages: "Recent Messages" },
    viewAll: "View All",
    viewAllMsgs: "View All Messages",
    msgTime: "ago",
    courts: {
      high: "High Court, Kigali",
      primary: "Primary Court, Gasabo",
      intermediate: "Intermediate Court, Musanze"
    },
    caseData: [
      { title: "Commercial Dispute - ABC Corp vs XYZ Ltd", status: "In Progress" },
      { title: "Property Transfer - Uwimana Estate", status: "Pending" },
      { title: "Criminal Defense - State vs Mugabo", status: "In Progress" }
    ]
  },
  rw: {
    greeting: "Murakaza neza",
    subtitle: "Ufite imanza {count} kuri gahunda muri iki cyumweru",
    btns: { schedule: "Reba Gahunda", newClient: "Umukiriya Mushya" },
    stats: ["Imanza zikurikiranwa", "Abakiriya", "Iburanisha", "Igipimo cy'intsinzi"],
    statTrends: ["uku kwezi", "bashya", "ejo", "uyu mwaka"],
    titles: { activeCases: "Imanza zikurikiranwa", schedule: "Gahunda y'uyu munsi", messages: "Ubutumwa bwa vuba" },
    viewAll: "Reba zose",
    viewAllMsgs: "Ubutumwa bwose",
    msgTime: "hashize",
    courts: {
      high: "Urukiko Rwisumbuye, Kigali",
      primary: "Urukiko rw'Ibanze, Gasabo",
      intermediate: "Urukiko Rwisumbuye, Musanze"
    },
    caseData: [
      { title: "Amakimbirane y'ubucuruzi - ABC Corp vs XYZ Ltd", status: "Birakomeje" },
      { title: "Ihererekanyabubasha ry'umutungo - Uwimana Estate", status: "Birategereje" },
      { title: "Urubanza mpanabyaha - Leta vs Mugabo", status: "Birakomeje" }
    ]
  },
  fr: {
    greeting: "Bienvenue",
    subtitle: "Vous avez {count} audiences prévues cette semaine",
    btns: { schedule: "Voir l'horaire", newClient: "Nouveau client" },
    stats: ["Affaires actives", "Clients", "Audiences", "Taux de réussite"],
    statTrends: ["ce mois", "nouveaux", "demain", "cette année"],
    titles: { activeCases: "Affaires actives", schedule: "Agenda du jour", messages: "Messages récents" },
    viewAll: "Voir tout",
    viewAllMsgs: "Tous les messages",
    msgTime: "il y a",
    courts: {
      high: "Haute Cour, Kigali",
      primary: "Tribunal de Base, Gasabo",
      intermediate: "Tribunal de Grande Instance"
    },
    caseData: [
      { title: "Litige Commercial - ABC Corp vs XYZ Ltd", status: "En cours" },
      { title: "Transfert de Propriété - Uwimana Estate", status: "En attente" },
      { title: "Défense Pénale - État vs Mugabo", status: "En cours" }
    ]
  }
} as const;

interface LawyerDashboardProps {
  // No props needed
}

const LawyerDashboard = () => {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
  
  // User Session logic
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) setUser(JSON.parse(loggedInUser));
  }, []);

  // 2. DYNAMIC STATS (Translated)
  const stats = [
    { title: t.stats[0], value: "15", icon: Briefcase, trend: `+3 ${t.statTrends[0]}`, color: "primary" as const },
    { title: t.stats[1], value: "28", icon: Users, trend: `+5 ${t.statTrends[1]}`, color: "secondary" as const },
    { title: t.stats[2], value: "6", icon: Calendar, trend: `2 ${t.statTrends[2]}`, color: "accent" as const },
    { title: t.stats[3], value: "87%", icon: TrendingUp, trend: `+2% ${t.statTrends[3]}`, color: "primary" as const },
  ];

  // 3. DYNAMIC CASE LIST (Translated)
  const cases = [
    {
      id: "CASE-2024-045",
      title: t.caseData[0].title,
      status: t.caseData[0].status as any,
      date: "Jan 8, 2024",
      lawyer: t.courts.high,
      nextHearing: "Jan 18, 2024",
    },
    {
      id: "CASE-2024-039",
      title: t.caseData[1].title,
      status: t.caseData[1].status as any,
      date: "Jan 5, 2024",
      lawyer: t.courts.primary,
      nextHearing: "Jan 22, 2024",
    },
    {
      id: "CASE-2024-032",
      title: t.caseData[2].title,
      status: t.caseData[2].status as any,
      date: "Jan 2, 2024",
      lawyer: t.courts.intermediate,
      nextHearing: "Jan 15, 2024",
    },
  ];

  return (
    <DashboardLayout 
      role="lawyer" 
      userName={user?.name || "Adv. Me. Lawyer"}
    >
      <div className="space-y-6">
        
        {/* CLEAN WELCOME SECTION - Logo Removed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={user?.profilePhoto || "/avatar/avatar.png"}
                alt="Profile"
                className="w-14 h-14 rounded-full object-cover border-2 border-[#1a2b4b] shadow-sm"
              />
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                {t.greeting}, {user?.name || "Advocate"}!
              </h1>
              <p className="text-muted-foreground font-medium">
                {t.subtitle.replace("{count}", "6")}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2 border-slate-200">
              <Calendar className="w-4 h-4" />
              {t.btns.schedule}
            </Button>
            <Button className="gap-2 bg-[#1a2b4b] hover:bg-[#111c32]">
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
          {/* Main Content: Cases */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">{t.titles.activeCases}</h2>
              <Button variant="ghost" size="sm" className="text-[#1a2b4b] hover:bg-slate-100">
                {t.viewAll}
              </Button>
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

          {/* Sidebar Content */}
          <div className="space-y-6">
            {/* Schedule Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
            >
              <h3 className="font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider text-slate-500">
                <Clock className="w-4 h-4 text-primary" />
                {t.titles.schedule}
              </h3>
              <div className="space-y-4">
                <div className="flex gap-4 p-3 rounded-lg bg-slate-50 border-l-4 border-[#1a2b4b]">
                  <div className="text-xs font-bold text-[#1a2b4b]">09:00 AM</div>
                  <div>
                    <p className="text-sm font-semibold">ABC vs XYZ</p>
                    <p className="text-xs text-slate-500">{t.courts.high}</p>
                  </div>
                </div>
                <div className="flex gap-4 p-3 rounded-lg bg-slate-50 border-l-4 border-slate-300">
                  <div className="text-xs font-bold text-slate-500">02:30 PM</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Uwimana Estate</p>
                    <p className="text-xs text-slate-500">{t.courts.primary}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Messages Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
            >
              <h3 className="font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider text-slate-500">
                <MessageSquare className="w-4 h-4 text-secondary" />
                {t.titles.messages}
              </h3>
              <div className="space-y-3">
                {[
                  { name: "Jean-Claude M.", message: "Dosiye nshya yagezeho...", time: `2h ${t.msgTime}` },
                  { name: "Me. Marie U.", message: "Meeting at 4 PM?", time: `5h ${t.msgTime}` }
                ].map((msg, index) => (
                  <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors border border-transparent">
                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-[#1a2b4b] text-sm font-bold">
                      {msg.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{msg.name}</p>
                      <p className="text-xs text-slate-500 truncate">{msg.message}</p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{msg.time}</span>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-3 text-xs font-bold uppercase tracking-tight text-slate-500">
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