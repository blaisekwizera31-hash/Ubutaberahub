import { ReactNode, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Scale, 
  Home, 
  FileText, 
  MessageSquare, 
  Users, 
  Settings, 
  Bell, 
  Search,
  Menu,
  X,
  LogOut,
  User,
  Briefcase,
  Gavel,
  Bot,
  Calendar,
  HelpCircle
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

type Role = "citizen" | "lawyer" | "judge" | "clerk";

interface DashboardLayoutProps {
  children: ReactNode;
  role: Role;
  userName: string;
}

const roleConfig = {
  citizen: {
    icon: User,
    color: "bg-primary",
    navItems: [
      { icon: Home, label: "Dashboard", href: "/dashboard/citizen" },
      { icon: FileText, label: "My Cases", href: "#" },
      { icon: Search, label: "Find Lawyer", href: "#" },
      { icon: MessageSquare, label: "Messages", href: "#" },
      { icon: Bot, label: "AI Assistant", href: "#" },
      { icon: FileText, label: "Documents", href: "#" },
    ],
  },
  lawyer: {
    icon: Briefcase,
    color: "bg-secondary",
    navItems: [
      { icon: Home, label: "Dashboard", href: "/dashboard/lawyer" },
      { icon: FileText, label: "Cases", href: "#" },
      { icon: Users, label: "Clients", href: "#" },
      { icon: Calendar, label: "Schedule", href: "#" },
      { icon: MessageSquare, label: "Messages", href: "#" },
      { icon: FileText, label: "Documents", href: "#" },
    ],
  },
  judge: {
    icon: Gavel,
    color: "bg-accent",
    navItems: [
      { icon: Home, label: "Dashboard", href: "/dashboard/judge" },
      { icon: FileText, label: "Cases for Review", href: "#" },
      { icon: Calendar, label: "Court Calendar", href: "#" },
      { icon: Gavel, label: "Rulings", href: "#" },
      { icon: FileText, label: "Documents", href: "#" },
    ],
  },
  clerk: {
    icon: FileText,
    color: "bg-primary",
    navItems: [
      { icon: Home, label: "Dashboard", href: "/dashboard/clerk" },
      { icon: FileText, label: "Filings", href: "#" },
      { icon: Calendar, label: "Schedule Hearings", href: "#" },
      { icon: Users, label: "Registry", href: "#" },
      { icon: FileText, label: "Documents", href: "#" },
    ],
  },
};

const DashboardLayout = ({ children, role, userName }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const config = roleConfig[role];
  const RoleIcon = config.icon;

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg gradient-hero flex items-center justify-center">
                <Scale className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">
                UBUTABERA<span className="text-primary">hub</span>
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {config.navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Bottom Section */}
          <div className="p-4 border-t space-y-1">
            <Link
              to="#"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
            <Link
              to="#"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
              <span>Help Center</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-lg border-b">
          <div className="flex items-center justify-between px-4 md:px-6 h-16">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 -ml-2"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Search */}
            <div className="hidden md:block flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search cases, documents..."
                  className="pl-9 bg-muted/50"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1 rounded-full hover:bg-muted transition-colors">
                    <div className={`w-8 h-8 rounded-full ${config.color} flex items-center justify-center`}>
                      <RoleIcon className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="hidden md:block text-sm font-medium">{userName}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="font-medium">{userName}</p>
                    <p className="text-sm text-muted-foreground capitalize">{role}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2">
                    <User className="w-4 h-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
