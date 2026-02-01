import { motion } from "framer-motion";
import {
  Scale,
  MessageSquare,
  FileText,
  Search,
  User,
  Bell,
  Calendar,
  Home,
  Briefcase,
  HelpCircle,
  Settings,
  LogOut,
  Plus,
  Video,
  MapPin,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const Appointments = () => {
  const upcomingAppointments = [
    {
      id: 1,
      lawyer: "Me. Jean Habimana",
      type: "Video Consultation",
      date: "Jan 15, 2024",
      time: "10:00 AM",
      duration: "30 min",
      status: "Confirmed",
      caseId: "CASE-2024-001",
    },
    {
      id: 2,
      lawyer: "Me. Marie Uwimana",
      type: "Document Review",
      date: "Jan 18, 2024",
      time: "2:30 PM",
      duration: "1 hour",
      status: "Pending",
      caseId: "CASE-2024-002",
    },
  ];

  const pastAppointments = [
    {
      id: 3,
      lawyer: "Me. Patrick Niyonzima",
      type: "In-Person Meeting",
      date: "Jan 5, 2024",
      time: "11:00 AM",
      duration: "45 min",
      status: "Completed",
      caseId: "CASE-2023-089",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
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
          {[
            { icon: Home, label: "Dashboard", href: "/dashboard" },
            { icon: FileText, label: "My Cases", href: "/my-cases" },
            { icon: MessageSquare, label: "AI Assistant", href: "/ai-assistant" },
            { icon: Briefcase, label: "Find Lawyers", href: "/find-lawyer" },
            { icon: Calendar, label: "Appointments", active: true, href: "/appointments" },
            { icon: HelpCircle, label: "Legal Resources", href: "/legal-resources" },
          ].map((item) => (
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
          <Link to="/settings" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
            <Settings className="w-5 h-5" />
            Settings
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
            <LogOut className="w-5 h-5" />
            Sign Out
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
                <Input placeholder="Search appointments..." className="pl-10" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <User className="w-5 h-5 text-accent-foreground" />
              </div>
            </div>
          </div>
        </header>

        {/* Appointments Content */}
        <div className="p-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-2xl font-display font-bold mb-1">Appointments</h1>
              <p className="text-muted-foreground">Manage your legal consultations</p>
            </div>
            <Link to="/find-lawyer">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Book Appointment
              </Button>
            </Link>
          </motion.div>

          {/* Upcoming Appointments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-lg font-semibold mb-4">Upcoming</h2>
            <div className="grid gap-4">
              {upcomingAppointments.map((apt, index) => (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-card rounded-2xl border border-border shadow-soft p-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <Video className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{apt.lawyer}</h3>
                        <p className="text-sm text-muted-foreground">{apt.type}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {apt.date}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {apt.time} ({apt.duration})
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Case: {apt.caseId}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        apt.status === "Confirmed" 
                          ? "bg-green-500/10 text-green-500" 
                          : "bg-amber-500/10 text-amber-500"
                      }`}>
                        {apt.status}
                      </span>
                      <Button size="sm" variant="outline">
                        {apt.type.includes("Video") ? "Join Call" : "View Details"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Past Appointments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-lg font-semibold mb-4">Past Appointments</h2>
            <div className="grid gap-4">
              {pastAppointments.map((apt, index) => (
                <div
                  key={apt.id}
                  className="bg-card rounded-2xl border border-border shadow-soft p-5 opacity-75"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{apt.lawyer}</h3>
                        <p className="text-sm text-muted-foreground">{apt.type}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {apt.date}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {apt.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Appointments;
