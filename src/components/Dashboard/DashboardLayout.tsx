import { ReactNode, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Scale, Home, FileText, MessageSquare, Users, Settings, 
  Bell, Search, Menu, X, LogOut, User, Briefcase, Gavel, 
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

type Role = "citizen" | "lawyer" | "judge" | "clerk"| "client";

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
    roleNames: { judge: "Judge", clerk: "Clerk", lawyer: "Lawyer", citizen: "Citizen" }
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
    roleNames: { judge: "Umucamanza", clerk: "Umwanditsi", lawyer: "Umunyamategeko", citizen: "Umwenyegihugu" }
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
    roleNames: { judge: "Juge", clerk: "Greffier", lawyer: "Avocat", citizen: "Citoyen" }
  }
};

// This maps icons and colors to roles and generates the nav links
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
    color: "bg-accent",
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
  
  const t = sidebarTranslations[lang as keyof typeof sidebarTranslations] || sidebarTranslations.en;
  const config = roleConfig[role];
  const RoleIcon = config.icon;
  const navItems = config.navItems(t);

  const handleLogout = () => navigate("/login");

  return (
    <div className="min-h-screen bg-background">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <span className="text-lg font-bold">UBUTABERA<span className="text-primary">hub</span></span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item: any) => (
              <Link key={item.label} to={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t space-y-1">
            <Link to="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted"><Settings className="w-5 h-5" /><span>{t.settings}</span></Link>
            <Link to="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted"><HelpCircle className="w-5 h-5" /><span>{t.help}</span></Link>
          </div>
        </div>
      </aside>

      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-lg border-b h-16 flex items-center justify-between px-6">
          <button className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X /> : <Menu />}
          </button>

          <div className="hidden md:block flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={t.search} className="pl-9" />
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
                <div className={`w-8 h-8 rounded-full ${config.color} flex items-center justify-center`}>
                  <RoleIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium">{userName}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 font-medium">{t.roleNames[role]}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive"><LogOut className="mr-2 w-4 h-4" />{t.signOut}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;