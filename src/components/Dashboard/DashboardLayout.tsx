import { ReactNode, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Home, FileText, MessageSquare, Users, Settings, 
  Search, Menu, X, LogOut, User, Briefcase, Gavel, 
  Bot, Calendar, HelpCircle 
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

// REMOVED: import Logo from "@/assets/logo.png"; 

type Role = "citizen" | "lawyer" | "judge" | "clerk" | "client";

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
      { icon: Home, label: t.dashboard, href: "/dashboard/citizen" },
      { icon: FileText, label: t.cases, href: "#" },
      { icon: Search, label: t.lawyers, href: "#" },
      { icon: MessageSquare, label: t.messages, href: "#" },
      { icon: Bot, label: t.ai, href: "#" },
    ],
  },
  client: { 
    icon: User,
    color: "bg-blue-600",
    navItems: (t: any) => [
      { icon: Home, label: t.dashboard, href: "/dashboard/client" },
      { icon: FileText, label: t.cases, href: "#" },
      { icon: MessageSquare, label: t.messages, href: "#" },
    ],
  },
  lawyer: {
    icon: Briefcase,
    color: "bg-secondary", 
    navItems: (t: any) => [
      { icon: Home, label: t.dashboard, href: "/dashboard/lawyer" },
      { icon: FileText, label: t.cases, href: "#" },
      { icon: Users, label: t.clients, href: "#" },
      { icon: Calendar, label: t.appoint, href: "#" },
    ],
  },
  judge: {
    icon: Gavel,
    color: "bg-blue-900",
    navItems: (t: any) => [
      { icon: Home, label: t.dashboard, href: "/dashboard/judge" },
      { icon: FileText, label: t.cases, href: "#" },
      { icon: Calendar, label: t.appoint, href: "#" },
    ],
  },
  clerk: {
    icon: FileText,
    color: "bg-primary",
    navItems: (t: any) => [
      { icon: Home, label: t.dashboard, href: "/dashboard/clerk" },
      { icon: FileText, label: t.cases, href: "#" },
      { icon: Calendar, label: t.appoint, href: "#" },
      { icon: Users, label: t.registry, href: "#" },
    ],
  },
};

const DashboardLayout = ({ children, role, userName, lang = "en" }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const t = sidebarTranslations[lang] || sidebarTranslations.en;
  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.citizen;
  const RoleIcon = config.icon;
  const navItems = config.navItems(t);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/auth");
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
                {/* UPDATED: Path points to public/logo.png */}
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform" 
                />
              </div>
              <span className="text-lg font-bold tracking-tight uppercase">
                UBUTABERA<span className="text-primary">hub</span>
              </span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item: any) => (
              <Link 
                key={item.label} 
                to={item.href} 
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-primary transition-all duration-200"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-border space-y-1">
            <Link to="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-primary transition-colors">
              <Settings className="w-5 h-5" />
              <span className="text-sm font-medium">{t.settings}</span>
            </Link>
            <Link to="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              <HelpCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{t.help}</span>
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

          <div className="flex items-center gap-4">
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