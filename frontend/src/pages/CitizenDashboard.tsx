import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Calendar, ChevronRight, Plus, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { getDashboardData } from "@/services/backend";

const translations = {
  en: {
    welcome: "Welcome back",
    welcomeSub: "Here is what is happening with your cases today.",
    actions: {
      submit: "Submit New Case",
      ask: "Ask AI Assistant",
      find: "Find a Lawyer",
      book: "Book Consultation",
    },
    recentCases: {
      title: "Recent Cases",
      viewAll: "View All",
      pending: "Pending",
      empty: "No recent cases found yet.",
    },
  },
  rw: {
    welcome: "Muraho neza",
    welcomeSub: "Dore uko imanza zawe zifashe uyu munsi.",
    actions: {
      submit: "Tanga ikirego gishya",
      ask: "Baza AI Assistant",
      find: "Shaka Umunyamategeko",
      book: "Saba gahunda",
    },
    recentCases: {
      title: "Imanza ziherutse",
      viewAll: "Reba zose",
      pending: "Itegereje",
      empty: "Nta manza ziherutse ziboneka.",
    },
  },
  fr: {
    welcome: "Bon retour",
    welcomeSub: "Voici ce qui se passe avec vos dossiers aujourd'hui.",
    actions: {
      submit: "Soumettre un dossier",
      ask: "Demander a l'IA",
      find: "Trouver un avocat",
      book: "Prendre RDV",
    },
    recentCases: {
      title: "Dossiers recents",
      viewAll: "Voir tout",
      pending: "En attente",
      empty: "Aucun dossier recent trouve.",
    },
  },
};

const CitizenDashboard = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = translations[language as keyof typeof translations] || translations.en;
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;
  const [apiCases, setApiCases] = useState<any[]>([]);

  useEffect(() => {
    getDashboardData("citizen")
      .then((data) => {
        setApiCases(Array.isArray(data.cases) ? data.cases : []);
      })
      .catch(() => {
        setApiCases([]);
      });
  }, []);

  const displayedCases = useMemo(
    () =>
      apiCases.map((c) => ({
        id: c.id,
        title: c.title,
        status: c.status || t.recentCases.pending,
        statusColor: /completed|resolved|closed/i.test(c.status) ? "bg-emerald-600" : "bg-[#1E293B]",
        date: c.date || "",
      })),
    [apiCases, t.recentCases.pending],
  );

  return (
    <DashboardLayout role="citizen" userName={user?.name || "User"}>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-display font-semibold text-foreground">
            {t.welcome}, {user?.name?.split(" ")[0] || "User"}!
          </h1>
          <p className="text-muted-foreground mt-1">{t.welcomeSub}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { icon: Plus, label: t.actions.submit, style: "bg-primary text-primary-foreground hover:bg-primary/90", href: "/submit-case" },
            { icon: MessageSquare, label: t.actions.ask, style: "bg-card border border-border text-foreground hover:bg-muted", href: "/ai-assistant" },
            { icon: Briefcase, label: t.actions.find, style: "bg-card border border-border text-foreground hover:bg-muted", href: "/find-lawyer" },
            { icon: Calendar, label: t.actions.book, style: "bg-card border border-border text-foreground hover:bg-muted", href: "/appointments" },
          ].map((action) => (
            <Link
              key={action.label}
              to={action.href}
              className={`flex items-center gap-3 p-4 rounded-xl shadow-sm transition-all hover:scale-[1.01] ${action.style}`}
            >
              <action.icon className="w-5 h-5" />
              <span className="font-semibold text-sm">{action.label}</span>
            </Link>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-semibold text-foreground">{t.recentCases.title}</h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground font-semibold text-xs uppercase tracking-wider"
                onClick={() => navigate("/my-cases")}
              >
                {t.recentCases.viewAll} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-muted/50 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Case ID</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayedCases.map((caseItem) => (
                    <tr
                      key={caseItem.id}
                      className="hover:bg-muted/30 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/my-cases?q=${encodeURIComponent(caseItem.id)}`)}
                    >
                      <td className="px-6 py-4 text-xs font-mono text-muted-foreground">{caseItem.id}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-foreground">{caseItem.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{caseItem.date}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider text-white ${caseItem.statusColor}`}>
                          {caseItem.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </td>
                    </tr>
                  ))}
                  {displayedCases.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-sm text-muted-foreground">
                        {t.recentCases.empty}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default CitizenDashboard;
