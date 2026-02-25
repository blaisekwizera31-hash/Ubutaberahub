import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  FileText,
  Calendar,
  Bell,
  Search,
  ChevronRight,
  Plus,
  Mic,
  Send,
  Home,
  Briefcase,
  HelpCircle,
  Settings,
  LogOut,
  Gavel,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";

interface DashboardProps {
  // No props needed anymore
}

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
    topbar: {
      search: "Search cases, lawyers, resources...",
      notifications: "2"
    },
    welcome: "Welcome back",
    welcomeSub: "Here's what's happening with your cases today.",
    actions: {
      submit: "Submit New Case",
      ask: "Ask AI Assistant",
      find: "Find a Lawyer",
      book: "Book Consultation"
    },
    recentCases: {
      title: "Recent Cases",
      viewAll: "View All",
      inProgress: "In Progress",
      completed: "Completed",
      pending: "Pending"
    },
    aiCard: {
      title: "AI Legal Assistant",
      status: "Online • Ready to help",
      placeholder: "Ask a legal question..."
    },
    appointments: {
      title: "Upcoming Appointments"
    },
    notifications: {
      title: "Notifications"
    }
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
    topbar: {
      search: "Shaka imanza, abanyamategeko...",
      notifications: "2"
    },
    welcome: "Muraho neza",
    welcomeSub: "Dore uko imanza zawe zifashe uyu munsi.",
    actions: {
      submit: "Tanga ikirego gishya",
      ask: "Baza AI Assistant",
      find: "Shaka Umunyamategeko",
      book: "Saba gahunda"
    },
    recentCases: {
      title: "Imanza ziherutse",
      viewAll: "Reba zose",
      inProgress: "Irakurikiranywa",
      completed: "Yarangiye",
      pending: "Itegereje"
    },
    aiCard: {
      title: "AI Legal Assistant",
      status: "Yiteguye kugufasha",
      placeholder: "Baza ikibazo cy'amategeko..."
    },
    appointments: {
      title: "Gahunda ziteganyijwe"
    },
    notifications: {
      title: "Imenyesha"
    }
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
    topbar: {
      search: "Rechercher des dossiers, avocats...",
      notifications: "2"
    },
    welcome: "Bon retour",
    welcomeSub: "Voici ce qui se passe avec vos dossiers aujourd'hui.",
    actions: {
      submit: "Soumettre un dossier",
      ask: "Demander à l'IA",
      find: "Trouver un avocat",
      book: "Prendre RDV"
    },
    recentCases: {
      title: "Dossiers récents",
      viewAll: "Voir tout",
      inProgress: "En cours",
      completed: "Terminé",
      pending: "En attente"
    },
    aiCard: {
      title: "Assistant Juridique IA",
      status: "En ligne • Prêt à aider",
      placeholder: "Posez une question juridique..."
    },
    appointments: {
      title: "Rendez-vous à venir"
    },
    notifications: {
      title: "Notifications"
    }
  }
};

const CitizenDashboard = () => {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;

  const recentCases = [
    {
      id: "CASE-2024-001",
      title: "Property Dispute Resolution",
      status: t.recentCases.inProgress,
      statusColor: "bg-[#1E293B]", 
      date: "Jan 10, 2024",
    },
    {
      id: "CASE-2024-002",
      title: "Employment Contract Review",
      status: t.recentCases.completed,
      statusColor: "bg-emerald-600",
      date: "Jan 5, 2024",
    },
  ];

  return (
    <DashboardLayout role="citizen" userName={user?.name || "Kwizera Blaise"}>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-display font-bold text-foreground">
            {t.welcome}, {user?.name?.split(' ')[0] || "Blaise"}!
          </h1>
          <p className="text-muted-foreground mt-1">{t.welcomeSub}</p>
        </motion.div>

          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              { icon: Plus, label: t.actions.submit, style: "bg-primary text-primary-foreground hover:bg-primary/90", href: "/submit-case" },
              { icon: MessageSquare, label: t.actions.ask, style: "bg-card border border-border text-foreground hover:bg-muted", href: "/dashboard" },
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Table Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="lg:col-span-2">
              <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <h2 className="font-bold text-foreground">{t.recentCases.title}</h2>
                  <Button variant="ghost" size="sm" className="text-muted-foreground font-bold text-xs uppercase tracking-wider">
                    {t.recentCases.viewAll} <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-muted/50 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Case ID</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {recentCases.map((caseItem) => (
                        <tr key={caseItem.id} className="hover:bg-muted/30 transition-colors group cursor-pointer">
                          <td className="px-6 py-4 text-xs font-mono text-muted-foreground">{caseItem.id}</td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-foreground">{caseItem.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{caseItem.date}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white ${caseItem.statusColor}`}>
                              {caseItem.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>

            {/* AI Assistant Card */}
            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{t.aiCard.title}</h3>
                      <p className="text-muted-foreground text-xs font-medium">{t.aiCard.status}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="relative">
                    <Input placeholder={t.aiCard.placeholder} className="pr-20 bg-muted/50 border-border" />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Mic className="w-4 h-4" /></Button>
                      <Button size="icon" className="h-8 w-8 bg-primary hover:bg-primary/90"><Send className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
      </div>
    </DashboardLayout>
  );
};

export default CitizenDashboard;