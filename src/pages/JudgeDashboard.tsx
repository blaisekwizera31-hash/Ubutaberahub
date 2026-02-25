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
import { useLanguage } from "@/contexts/LanguageContext";

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
  // ... (rw and fr translations remain the same)
};

const JudgeDashboard = () => {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
  
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
      userName={user?.name || "Hon. Kwizera Blaise"}
    >
      <div className="space-y-6">
        {/* Clean Header - Blue Square Removed */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={user?.profilePhoto || "/avatar/avatar.png"} 
                alt="Profile" 
                className="w-16 h-16 rounded-full border-2 border-primary object-cover shadow-sm" 
              />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t.greeting}, {user?.name || "Kwizera Blaise"}</h1>
              <p className="text-muted-foreground font-medium">{t.subtitle.replace("{count}", "4")}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="default" className="gap-2 shadow-sm">
              <Calendar className="w-4 h-4" />
              {t.btns.calendar}
            </Button>
            <Button size="default" className="gap-2 shadow-sm">
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
              <h2 className="text-xl font-semibold tracking-tight">{t.titles.attention}</h2>
              <Button variant="ghost" size="sm" className="text-primary">{t.table.viewAll}</Button>
            </div>
            {caseData.map((c) => (
              <motion.div key={c.id} className="bg-card p-5 rounded-xl border shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">{c.id}</span>
                    <Badge variant={getPriorityColor(c.priority)}>{c.priority}</Badge>
                    <Badge variant="outline" className="font-normal">{c.type}</Badge>
                  </div>
                  <h3 className="font-bold text-lg">{c.title}</h3>
                  <p className="text-sm text-muted-foreground">{c.parties}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> {t.table.filed}: {c.date}</span>
                    <span className="flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {c.status}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="outline" className="gap-1.5"><Eye className="w-4 h-4" /> {t.table.review}</Button>
                  <Button size="sm" className="gap-1.5"><Gavel className="w-4 h-4" /> {t.table.ruling}</Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <div className="bg-card p-6 rounded-xl border shadow-sm">
              <h3 className="font-bold mb-4 flex items-center gap-2 border-b pb-2">
                <Calendar className="w-4 h-4 text-primary" /> {t.titles.schedule}
              </h3>
              <div className="space-y-4">
                {t.schedule.map((item, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/30 border-l-4 border-primary hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between text-xs font-bold text-primary mb-1">
                      <span>{["10:00 AM", "11:30 AM", "02:00 PM", "04:00 PM"][i]}</span>
                      <span className="text-muted-foreground uppercase">{item.room}</span>
                    </div>
                    <p className="text-sm font-semibold">
                      {["ABC Corp vs XYZ", "State vs Mugabo", "Uwimana Estate", "Land Registry"][i]}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.type}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary p-6 rounded-xl text-primary-foreground shadow-lg border border-primary-foreground/10">
              <h3 className="font-bold mb-4 text-lg border-b border-primary-foreground/20 pb-2">{t.titles.performance}</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm items-center">
                  <span className="opacity-90">{t.perf[0]}</span>
                  <span className="font-bold text-lg">23</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="opacity-90">{t.perf[1]}</span>
                  <span className="font-bold text-lg">18 {t.perf[3]}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="opacity-90">{t.perf[2]}</span>
                  <span className="font-bold text-lg">31</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JudgeDashboard;