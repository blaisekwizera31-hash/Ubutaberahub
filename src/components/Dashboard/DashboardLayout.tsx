import { ReactNode, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Home, FileText, MessageSquare, Users, Settings, 
  Search, Menu, X, LogOut, User, Briefcase, Gavel, 
  Bot, Calendar, HelpCircle, Moon, Sun, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

// REMOVED: import Logo from "@/assets/logo.png"; 

type Role = "citizen" | "lawyer" | "judge" | "clerk" | "client";

interface DashboardLayoutProps {
  children: ReactNode;
  role: Role;
  userName: string;
}

const sidebarTranslations: Record<string, any> = {
  en: {
    dashboard: "Dashboard",
    cases: "My Cases",
    ai: "AI Assistant",
    lawyers: "Find Lawyers",
    appoint: "Appointments",
    settings: "Settings",
    signOut: "Sign Out",
    help: "Help Center",
    search: "Search cases...",
    profile: "Profile",
    messages: "Messages",
    clients: "Clients",
    registry: "Registry",
    roleNames: { judge: "Judge", clerk: "Clerk", lawyer: "Lawyer", citizen: "Citizen", client: "Client" }
  },
  rw: {
    dashboard: "Ikarita mpuruza",
    cases: "Imanza zanjye",
    ai: "Ubufasha bwa AI",
    lawyers: "Shaka abanyamategeko",
    appoint: "Gahunda",
    settings: "Igenamiterere",
    signOut: "Sohoka",
    help: "Gufashwa",
    search: "Shakisha...",
    profile: "Umwirondoro",
    messages: "Ubutumwa",
    clients: "Abakiriya",
    registry: "Ubwanditsi",
    roleNames: { judge: "Umucamanza", clerk: "Umwanditsi", lawyer: "Umunyamategeko", citizen: "Umwenyegihugu", client: "Umukiriya" }
  },
  fr: {
    dashboard: "Tableau de bord",
    cases: "Mes dossiers",
    ai: "Assistant IA",
    lawyers: "Trouver un avocat",
    appoint: "Rendez-vous",
    settings: "Paramètres",
    signOut: "Se déconnecter",
    help: "Centre d'aide",
    search: "Rechercher...",
    profile: "Profil",
    messages: "Messages",
    clients: "Clients",
    registry: "Greffe",
    roleNames: { judge: "Juge", clerk: "Greffier", lawyer: "Avocat", citizen: "Citoyen", client: "Client" }
  }
};

const roleConfig = {
  citizen: {
    icon: User,
    color: "bg-primary", 
    navItems: (t: any) => [
      { icon: Home, label: t.dashboard, href: "/dashboard" },
      { icon: FileText, label: t.cases, href: "/my-cases" },
      { icon: Search, label: t.lawyers, href: "/find-lawyer" },
      { icon: Calendar, label: t.appoint, href: "/appointments" },
      { icon: Bot, label: t.ai, href: "/ai-assistant" },
    ],
  },
  client: { 
    icon: User,
    color: "bg-blue-600",
    navItems: (t: any) => [
      { icon: Home, label: t.dashboard, href: "/dashboard" },
      { icon: FileText, label: t.cases, href: "/my-cases" },
      { icon: MessageSquare, label: t.messages, href: "/messages" },
    ],
  },
  lawyer: {
    icon: Briefcase,
    color: "bg-secondary", 
    navItems: (t: any) => [
      { icon: Home, label: t.dashboard, href: "/lawyer-dashboard" },
      { icon: FileText, label: t.cases, href: "/lawyer-cases" },
      { icon: Users, label: t.clients, href: "/lawyer-clients" },
      { icon: Calendar, label: t.appoint, href: "/appointments" },
    ],
  },
  judge: {
    icon: Gavel,
    color: "bg-blue-900",
    navItems: (t: any) => [
      { icon: Home, label: t.dashboard, href: "/judge-dashboard" },
      { icon: FileText, label: t.cases, href: "/judge-cases" },
      { icon: Calendar, label: t.appoint, href: "/appointments" },
    ],
  },
  clerk: {
    icon: FileText,
    color: "bg-primary",
    navItems: (t: any) => [
      { icon: Home, label: t.dashboard, href: "/clerk-dashboard" },
      { icon: FileText, label: t.cases, href: "/clerk-cases" },
      { icon: Calendar, label: t.appoint, href: "/appointments" },
      { icon: Users, label: t.registry, href: "/clerk-registry" },
    ],
  },
};

const DashboardLayout = ({ children, role, userName }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  
  const t = sidebarTranslations[language] || sidebarTranslations.en;
  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.citizen;
  const RoleIcon = config.icon;
  const navItems = config.navItems(t);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/auth");
  };

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'rw', label: 'Kinyarwanda', flag: '🇷🇼' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-4 border-b border-border">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                  style={{ filter: 'brightness(0)' }}
                />
              </div>
              <span className="text-lg font-bold tracking-tight uppercase">
                UBUTABERA<span className="text-primary">hub</span>
              </span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item: any) => {
              const active = isActive(item.href);
              return (
                <Link 
                  key={item.label} 
                  to={item.href} 
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border space-y-1">
            <Link 
              to="/settings" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/settings')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>{t.settings}</span>
            </Link>
            <Link 
              to="/help-center" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/help-center')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <HelpCircle className="w-5 h-5" />
              <span>{t.help}</span>
            </Link>
          </div>
        </div>
      </aside>

      <div className="lg:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border h-16 flex items-center justify-between px-6">
          <button className="lg:hidden text-foreground p-2 hover:bg-muted rounded-md" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="hidden md:block flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder={t.search} 
              className="pl-9 bg-background border-border focus:ring-primary focus:border-primary" 
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Globe className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as any)}
                    className={`cursor-pointer ${language === lang.code ? 'bg-primary/10' : ''}`}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-3 p-1 px-2 rounded-full hover:bg-muted transition-colors outline-none border border-transparent focus:border-border">
                <div className={`w-8 h-8 rounded-full ${config.color} flex items-center justify-center shadow-md shadow-primary/20`}>
                  <RoleIcon className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold leading-none mb-1">{userName}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t.roleNames[role] || role}</p>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 bg-card border-border shadow-xl">
                <div className="px-2 py-2 font-bold text-[10px] uppercase tracking-[0.15em] text-muted-foreground opacity-70">
                  Account Management
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer focus:bg-primary/10">
                  <User className="mr-2 w-4 h-4 text-primary" /> {t.profile}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive font-medium cursor-pointer focus:bg-destructive/10">
                  <LogOut className="mr-2 w-4 h-4" /> {t.signOut}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="p-6 flex-1 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;