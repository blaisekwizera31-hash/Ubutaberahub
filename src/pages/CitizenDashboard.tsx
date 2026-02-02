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
} from "lucide-react"; // Removed Scale import
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

interface DashboardProps {
  lang?: string;
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

const CitizenDashboard = ({ lang = "en" }: DashboardProps) => {
  const t = translations[lang as keyof typeof translations] || translations.en;
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;

  const navItems = [
    { icon: Home, label: t.sidebar.dashboard, active: true, href: "/dashboard" },
    { icon: FileText, label: t.sidebar.cases, href: "/dashboard" },
    { icon: MessageSquare, label: t.sidebar.ai, href: "/dashboard" },
    { icon: Briefcase, label: t.sidebar.lawyers, href: "/find-lawyer" },
    { icon: Calendar, label: t.sidebar.appoint, href: "/appointments" },
    { icon: HelpCircle, label: t.sidebar.resources, href: "/legal-resources" },
  ];

  const recentCases = [
    {
      id: "CASE-2024-001",
      title: "Property Dispute Resolution",
      status: t.recentCases.inProgress,
      statusColor: "bg-amber-500",
      date: "Jan 10, 2024",
    },
    {
      id: "CASE-2024-002",
      title: "Employment Contract Review",
      status: t.recentCases.completed,
      statusColor: "bg-secondary",
      date: "Jan 5, 2024",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card">
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            {/* LOGO ADDED HERE */}
            <div className="w-9 h-9 flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="UBUTABERAhub" 
                className="w-full h-full object-contain" 
              />
            </div>
            <span className="font-display text-lg font-bold">
              UBUTABERA<span className="text-accent">hub</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                item.active
                  ? "bg-accent/10 text-accent"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
            <Settings className="w-5 h-5" />
            {t.sidebar.settings}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
            <LogOut className="w-5 h-5" />
            {t.sidebar.signOut}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder={t.topbar.search} className="pl-10" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  {t.topbar.notifications}
                </span>
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-accent">
                  <img
                    src={user?.profilePhoto || "/avatar/avatar.png"}
                    alt={user?.name || "User"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-medium">{user?.name || "Citizen"}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-2xl font-display font-bold mb-1">
              {t.welcome}, {user?.name || "Amahoro"}!
            </h1>
            <p className="text-muted-foreground">{t.welcomeSub}</p>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              { icon: Plus, label: t.actions.submit, color: "gradient-gold text-primary", href: "/submit-case" },
              { icon: MessageSquare, label: t.actions.ask, color: "bg-secondary text-secondary-foreground", href: "/dashboard" },
              { icon: Briefcase, label: t.actions.find, color: "bg-primary text-primary-foreground", href: "/find-lawyer" },
              { icon: Calendar, label: t.actions.book, color: "bg-accent text-accent-foreground", href: "/dashboard" },
            ].map((action) => (
              <Link
                key={action.label}
                to={action.href}
                className={`flex items-center gap-3 p-4 rounded-xl ${action.color} shadow-soft hover:shadow-elevated transition-all hover:scale-[1.02]`}
              >
                <action.icon className="w-5 h-5" />
                <span className="font-medium">{action.label}</span>
              </Link>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="lg:col-span-2">
              <div className="bg-card rounded-2xl border border-border shadow-soft">
                <div className="flex items-center justify-between p-5 border-b border-border">
                  <h2 className="font-semibold">{t.recentCases.title}</h2>
                  <Button variant="ghost" size="sm" className="text-accent">
                    {t.recentCases.viewAll} <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <div className="divide-y divide-border">
                  {recentCases.map((caseItem) => (
                    <div key={caseItem.id} className="p-5 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-mono text-muted-foreground">{caseItem.id}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs text-white ${caseItem.statusColor}`}>
                              {caseItem.status}
                            </span>
                          </div>
                          <h3 className="font-medium">{caseItem.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{caseItem.date}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* AI Assistant Card */}
            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
                <div className="gradient-hero p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{t.aiCard.title}</h3>
                      <p className="text-white/70 text-sm">{t.aiCard.status}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="relative">
                    <Input placeholder={t.aiCard.placeholder} className="pr-20" />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Mic className="w-4 h-4" /></Button>
                      <Button size="icon" className="h-8 w-8"><Send className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CitizenDashboard;