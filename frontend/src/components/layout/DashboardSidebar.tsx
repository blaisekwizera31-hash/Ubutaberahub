import React from "react";
import { Scale, Home, FileText, MessageSquare, Briefcase, Calendar, Settings, LogOut, Languages } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

// 1. Hand-written translation dictionary
const translations = {
  en: {
    dashboard: "Dashboard",
    myCases: "My Cases",
    aiAssistant: "AI Assistant",
    messages: "Messages",
    findLawyers: "Find Lawyers",
    appointments: "Appointments",
    settings: "Settings",
    signOut: "Sign Out",
    switchLang: "Kinyarwanda"
  },
  rw: {
    dashboard: "Inyandiko mbonera",
    myCases: "Imanza zanjye",
    aiAssistant: "Umufasha wa AI",
    messages: "Ubutumwa",
    findLawyers: "Shaka abanyamategeko",
    appointments: "Gahunda",
    settings: "Igenamiterere",
    signOut: "Sohoka",
    switchLang: "English"
  },
  fr: {
    dashboard: "Tableau de bord",
    myCases: "Mes dossiers",
    aiAssistant: "Assistant IA",
    messages: "Messages",
    findLawyers: "Trouver des avocats",
    appointments: "Rendez-vous",
    settings: "Parametres",
    signOut: "Se deconnecter",
    switchLang: "English"
  },
};

interface DashboardSidebarProps {
  activePage?: string;
}

export function DashboardSidebar({ activePage }: DashboardSidebarProps) {
  const location = useLocation();
  const { language: lang, setLanguage } = useLanguage();

  // 3. Hand-written translation helper
  const t = (key: keyof typeof translations.en) => (translations[lang] || translations.en)[key];

  const navItems = [
    { icon: Home, label: t("dashboard"), href: "/dashboard" },
    { icon: FileText, label: t("myCases"), href: "/dashboard/my-cases" },
    { icon: MessageSquare, label: t("aiAssistant"), href: "/dashboard/ai-assistant" },
    { icon: MessageSquare, label: t("messages"), href: "/dashboard/messages" },
    { icon: Briefcase, label: t("findLawyers"), href: "/dashboard/find-lawyer" },
    { icon: Calendar, label: t("appointments"), href: "/dashboard/appointments" },
  ];

  const isActive = (href: string) => {
    return activePage ? href.includes(activePage) : location.pathname === href;
  };

  const toggleLanguage = () => {
    if (lang === "en") setLanguage("rw");
    else if (lang === "rw") setLanguage("fr");
    else setLanguage("en");
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card h-screen sticky top-0">
      {/* Logo Section */}
      <div className="p-6 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <Scale className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-semibold">
            <span className="text-black">UBUTABERA</span><span className="text-[#1292E2]">hub</span>
          </span>
        </Link>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isActive(item.href)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Footer Section (Settings, Lang, Logout) */}
      <div className="p-4 border-t border-border space-y-1">
        {/* Language Switcher */}
        <button 
          onClick={toggleLanguage}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        >
          <Languages className="w-5 h-5" />
          {t("switchLang")}
        </button>

        <Link
          to="/dashboard/settings"
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            isActive("/dashboard/settings")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Settings className="w-5 h-5" />
          {t("settings")}
        </Link>

        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all">
          <LogOut className="w-5 h-5" />
          {t("signOut")}
        </button>
      </div>
    </aside>
  );
}
