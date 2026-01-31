import { Scale, Home, FileText, MessageSquare, Briefcase, Calendar, HelpCircle, Settings, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "@/i18n";

interface DashboardSidebarProps {
  activePage?: string;
}

export function DashboardSidebar({ activePage }: DashboardSidebarProps) {
  const t = useTranslation("common");
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: t.dashboard, href: "/dashboard" },
    { icon: FileText, label: t.myCases, href: "/my-cases" },
    { icon: MessageSquare, label: t.aiAssistant, href: "/ai-assistant" },
    { icon: Briefcase, label: t.findLawyers, href: "/find-lawyer" },
    { icon: Calendar, label: t.appointments, href: "/appointments" },
    { icon: HelpCircle, label: t.legalResources, href: "/legal-resources" },
  ];

  const isActive = (href: string) => {
    if (activePage) {
      return href.includes(activePage);
    }
    return location.pathname === href;
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card">
      <div className="p-6 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 gradient-hero rounded-lg flex items-center justify-center">
            <Scale className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold">
            UBUTABERA<span className="text-accent">hub</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isActive(item.href)
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
        <Link
          to="/settings"
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            isActive("/settings")
              ? "bg-accent/10 text-accent"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Settings className="w-5 h-5" />
          {t.settings}
        </Link>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
          <LogOut className="w-5 h-5" />
          {t.signOut}
        </button>
      </div>
    </aside>
  );
}
