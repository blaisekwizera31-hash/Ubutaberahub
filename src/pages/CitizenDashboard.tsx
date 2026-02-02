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
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Sidebar - Clean Slate Style */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 bg-white">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-display text-lg font-bold text-[#1E293B] tracking-tight">
            UBUTABERA<span className="text-slate-500 font-medium">HUB</span>
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                item.active
                  ? "text-[#1E293B]" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-[#1E293B]"
              }`}
            >
              <item.icon className={`w-5 h-5 ${item.active ? "text-[#1E293B]" : "text-slate-400"}`} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 transition-all">
            <Settings className="w-5 h-5" />
            {t.sidebar.settings}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all">
            <LogOut className="w-5 h-5" />
            {t.sidebar.signOut}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder={t.topbar.search} 
              className="pl-10 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-slate-300" 
            />
          </div>
          
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-slate-600">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full border-2 border-white" />
            </Button>
            <div className="flex items-center gap-3 border-l pl-6 border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-[#1E293B] leading-none">{user?.name || "Kwizera Blaise"}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">CITIZEN</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 overflow-hidden">
                <img src={user?.profilePhoto || "/avatar/avatar.png"} alt="profile" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 max-w-7xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl font-display font-bold text-[#1E293B]">
              {t.welcome}, {user?.name?.split(' ')[0] || "Blaise"}!
            </h1>
            <p className="text-slate-500 mt-1">{t.welcomeSub}</p>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              { icon: Plus, label: t.actions.submit, style: "bg-[#1E293B] text-white hover:bg-[#0F172A]", href: "/submit-case" },
              { icon: MessageSquare, label: t.actions.ask, style: "bg-white border border-slate-200 text-[#1E293B] hover:bg-slate-50", href: "/dashboard" },
              { icon: Briefcase, label: t.actions.find, style: "bg-white border border-slate-200 text-[#1E293B] hover:bg-slate-50", href: "/find-lawyer" },
              { icon: Calendar, label: t.actions.book, style: "bg-white border border-slate-200 text-[#1E293B] hover:bg-slate-50", href: "/dashboard" },
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
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                  <h2 className="font-bold text-[#1E293B]">{t.recentCases.title}</h2>
                  <Button variant="ghost" size="sm" className="text-slate-500 font-bold text-xs uppercase tracking-wider">
                    {t.recentCases.viewAll} <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Case ID</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentCases.map((caseItem) => (
                        <tr key={caseItem.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                          <td className="px-6 py-4 text-xs font-mono text-slate-400">{caseItem.id}</td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-[#1E293B]">{caseItem.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{caseItem.date}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white ${caseItem.statusColor}`}>
                              {caseItem.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#1E293B] transition-colors" />
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
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1E293B] rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1E293B]">{t.aiCard.title}</h3>
                      <p className="text-slate-400 text-xs font-medium">{t.aiCard.status}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="relative">
                    <Input placeholder={t.aiCard.placeholder} className="pr-20 bg-slate-50 border-slate-200 focus:ring-0" />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><Mic className="w-4 h-4" /></Button>
                      <Button size="icon" className="h-8 w-8 bg-[#1E293B] hover:bg-[#0F172A]"><Send className="w-4 h-4" /></Button>
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