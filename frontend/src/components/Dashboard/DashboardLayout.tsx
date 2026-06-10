import { ReactNode, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Home, FileText, MessageSquare, Users, Settings, 
  Search, Menu, X, LogOut, User, Briefcase, Gavel, Bell,
  Bot, Calendar, HelpCircle, Globe, CalendarClock
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
import { useLanguage } from "@/contexts/LanguageContext";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "@/services/backend";
import { UserPhoto } from "@/components/ui/UserPhoto";

// REMOVED: import Logo from "@/assets/logo.png"; 

type Role = "citizen" | "lawyer" | "judge" | "clerk" | "court_admin" | "client";

interface DashboardLayoutProps {
  children: ReactNode;
  role: Role;
  userName: string;
  lang?: string;
}

const sidebarTranslations: Record<string, any> = {
  en: {
    dashboard: "Dashboard",
    cases: "My Cases",
    allCases: "All Cases",
    ai: "AI Assistant",
    lawyers: "Find Attorneys",
    appoint: "Appointments",
    settings: "Settings",
    signOut: "Sign Out",
    help: "Help Center",
    search: "Search cases...",
    profile: "Profile",
    messages: "Messages",
    updates: "Updates",
    clients: "Clients",
    registry: "Registry",
    administration: "Administration",
    roleNames: { judge: "Judge", clerk: "Clerk", court_admin: "Court Admin", lawyer: "Attorney", citizen: "Citizen", client: "Client" }
  },
  rw: {
    dashboard: "Ikarita mpuruza",
    cases: "Imanza zanjye",
    allCases: "Imanza zose",
    ai: "Ubufasha bwa AI",
    lawyers: "Shaka abanyamategeko",
    appoint: "Gahunda",
    settings: "Igenamiterere",
    signOut: "Sohoka",
    help: "Gufashwa",
    search: "Shakisha...",
    profile: "Umwirondoro",
    messages: "Ubutumwa",
    updates: "Amakuru mashya",
    clients: "Abakiriya",
    registry: "Ubwanditsi",
    administration: "Ubuyobozi",
    roleNames: { judge: "Umucamanza", clerk: "Umwanditsi", court_admin: "Ubuyobozi", lawyer: "Umunyamategeko", citizen: "Umwenyegihugu", client: "Umukiriya" }
  },
  fr: {
    dashboard: "Tableau de bord",
    cases: "Mes dossiers",
    allCases: "Tous les dossiers",
    ai: "Assistant IA",
    lawyers: "Trouver un avocat",
    appoint: "Rendez-vous",
    settings: "Paramètres",
    signOut: "Se déconnecter",
    help: "Centre d'aide",
    search: "Rechercher...",
    profile: "Profil",
    messages: "Messages",
    updates: "Mises a jour",
    clients: "Clients",
    registry: "Greffe",
    administration: "Administration",
    roleNames: { judge: "Juge", clerk: "Greffier", court_admin: "Administration", lawyer: "Avocat", citizen: "Citoyen", client: "Client" }
  }
};

const roleConfig = {
  citizen: {
    icon: User,
    color: "bg-primary", 
    navItems: (t: any) => [
      { icon: Home, label: t.dashboard, href: "/dashboard" },
      { icon: FileText, label: t.cases, href: "/dashboard/my-cases" },
      { icon: Bot, label: t.ai, href: "/dashboard/ai-assistant" },
      { icon: Search, label: t.lawyers, href: "/dashboard/find-lawyer" },
      { icon: Calendar, label: t.appoint, href: "/dashboard/appointments" },
      { icon: CalendarClock, label: t.updates, href: "/dashboard/updates" },
      { icon: MessageSquare, label: t.messages, href: "/dashboard/messages" },
    ],
  },
  client: { 
    icon: User,
    color: "bg-blue-600",
    navItems: (t: any) => [
      { icon: Home, label: t.dashboard, href: "/dashboard" },
      { icon: FileText, label: t.cases, href: "/dashboard/my-cases" },
      { icon: CalendarClock, label: t.updates, href: "/dashboard/updates" },
      { icon: MessageSquare, label: t.messages, href: "/dashboard/messages" },
    ],
  },
  lawyer: {
    icon: Briefcase,
    color: "bg-secondary", 
    navItems: (t: any) => [
      { icon: Home, label: t.dashboard, href: "/lawyer-dashboard" },
      { icon: FileText, label: t.cases, href: "/lawyer-dashboard/my-cases" },
      { icon: Bot, label: t.ai, href: "/lawyer-dashboard/ai-assistant" },
      { icon: Users, label: t.clients, href: "/lawyer-dashboard/clients" },
      { icon: Calendar, label: t.appoint, href: "/lawyer-dashboard/appointments" },
      { icon: MessageSquare, label: t.messages, href: "/lawyer-dashboard/messages" },
    ],
  },
  judge: {
    icon: Gavel,
    color: "bg-blue-900",
    navItems: (t: any) => [
      { icon: Home, label: t.dashboard, href: "/judge-dashboard" },
      { icon: FileText, label: t.cases, href: "/judge-dashboard/my-cases" },
      { icon: Calendar, label: t.appoint, href: "/appointments" },
    ],
  },
  clerk: {
    icon: FileText,
    color: "bg-primary",
    navItems: (t: any) => [
      { icon: Home, label: t.dashboard, href: "/clerk-dashboard" },
      { icon: FileText, label: t.allCases, href: "/clerk-dashboard/all-cases" },
      { icon: Calendar, label: t.appoint, href: "/appointments" },
      { icon: MessageSquare, label: t.messages, href: "/clerk-dashboard/messages" },
      { icon: Users, label: t.registry, href: "/clerk-dashboard/registry" },
    ],
  },
  court_admin: {
    icon: Scale,
    color: "bg-blue-900",
    navItems: (t: any) => [
      { icon: Home, label: t.dashboard, href: "/court-admin-dashboard" },
      { icon: Scale, label: t.administration, href: "/court-admin-dashboard" },
      { icon: MessageSquare, label: t.messages, href: "/court-admin-dashboard/messages" },
    ],
  },
};

const DashboardLayout = ({ children, role, userName }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { language, setLanguage } = useLanguage();
  
  const t = sidebarTranslations[language] || sidebarTranslations.en;
  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.citizen;
  const navItems = config.navItems(t);
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("loggedInUser") || "null");
    } catch {
      return null;
    }
  })();
  const userPhoto = storedUser?.profilePhoto || storedUser?.profile_photo || null;

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/auth");
  };

  const portalBase =
    role === "lawyer" ? "/lawyer-dashboard" :
    role === "judge" ? "/judge-dashboard" :
    role === "clerk" ? "/clerk-dashboard" :
    role === "court_admin" ? "/court-admin-dashboard" :
    role === "citizen" || role === "client" ? "/dashboard" :
    "";
  const portalPath = (path: string) => `${portalBase}${path}`;

  const getSearchTarget = () => {
    if (role === "citizen" || role === "client") return "/dashboard/my-cases";
    if (role === "lawyer") return "/lawyer-dashboard/my-cases";
    if (role === "judge") return "/judge-dashboard/my-cases";
    if (role === "clerk") return "/clerk-dashboard/all-cases";
    if (role === "court_admin") return "/court-admin-dashboard";
    return "/dashboard/my-cases";
  };

  const submitSearch = () => {
    const q = searchQuery.trim();
    const target = getSearchTarget();
    navigate(q ? `${target}?q=${encodeURIComponent(q)}` : target);
  };

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'rw', label: 'Kinyarwanda', flag: '🇷🇼' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' }
  ];

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await getNotifications();
        if (!mounted) return;
        setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
        setUnreadCount(Number(data.unreadCount || 0));
      } catch {
        if (!mounted) return;
        setNotifications([]);
        setUnreadCount(0);
      }
    };
    load();
    const timer = window.setInterval(load, 15000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  const openNotification = async (item: any) => {
    try {
      if (!item?.isRead) {
        await markNotificationRead(item.id);
        setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {}

    const metadata = item?.metadata || {};
    if (metadata.conversationId) {
      navigate(`${portalPath("/messages") || "/messages"}?conversationId=${encodeURIComponent(metadata.conversationId)}`);
      return;
    }
    if (metadata.caseNumber || metadata.caseId) {
      const q = metadata.caseNumber || metadata.caseId;
      const target =
        role === "lawyer" ? "/lawyer-dashboard/my-cases" :
        role === "judge" ? "/judge-dashboard/my-cases" :
        role === "clerk" ? "/clerk-dashboard/all-cases" :
        role === "court_admin" ? "/court-admin-dashboard" :
        String(item?.type || "").startsWith("court_") ? "/dashboard/updates" :
        "/dashboard/my-cases";
      navigate(`${target}?q=${encodeURIComponent(q)}`);
      return;
    }
    navigate(portalPath("/messages") || "/messages");
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

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
              <span className="text-lg font-semibold tracking-tight uppercase">
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
              to={portalPath("/settings") || "/settings"} 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(portalPath("/settings") || "/settings")
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>{t.settings}</span>
            </Link>
            <Link 
              to={portalPath("/help-center") || "/help-center"} 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(portalPath("/help-center") || "/help-center")
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitSearch();
              }}
              className="pl-9 bg-background border-border focus:ring-primary focus:border-primary" 
            />
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="px-2 py-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notifications</span>
                  <Button variant="ghost" size="sm" onClick={handleMarkAllNotificationsRead}>
                    Mark all read
                  </Button>
                </div>
                <DropdownMenuSeparator />
                {notifications.slice(0, 8).map((item) => (
                  <DropdownMenuItem key={item.id} onClick={() => openNotification(item)} className="cursor-pointer items-start py-2">
                    <div className="w-full">
                      <div className="flex items-center gap-2">
                        {!item.isRead && <span className="w-2 h-2 rounded-full bg-primary" />}
                        <p className="text-sm font-medium">{item.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.body}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
                {notifications.length === 0 && <div className="px-2 py-3 text-sm text-muted-foreground">No notifications yet.</div>}
              </DropdownMenuContent>
            </DropdownMenu>

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

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-3 p-1 px-2 rounded-full hover:bg-muted transition-colors outline-none border border-transparent focus:border-border">
                <UserPhoto src={userPhoto} alt={userName} className="h-8 w-8 shadow-md shadow-primary/20" />
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold leading-none mb-1">{userName}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t.roleNames[role] || role}</p>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 bg-card border-border shadow-xl">
                <div className="px-2 py-2 font-semibold text-[10px] uppercase tracking-[0.15em] text-muted-foreground opacity-70">
                  Account Management
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(portalPath("/settings") || "/settings")} className="cursor-pointer focus:bg-primary/10">
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
