import { motion } from "framer-motion";
import {
  Scale,
  MessageSquare,
  FileText,
  Calendar,
  Bell,
  Search,
  User,
  ChevronRight,
  Plus,
  Mic,
  Send,
  Home,
  Briefcase,
  HelpCircle,
  Settings,
  LogOut,
} from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const CitizenDashboard = () => {
  // Get logged-in citizen from localStorage
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;

  const recentCases = [
    {
      id: "CASE-2024-001",
      title: "Property Dispute Resolution",
      status: "In Progress",
      statusColor: "bg-amber-500",
      date: "Jan 10, 2024",
    },
    {
      id: "CASE-2024-002",
      title: "Employment Contract Review",
      status: "Completed",
      statusColor: "bg-secondary",
      date: "Jan 5, 2024",
    },
    {
      id: "CASE-2023-089",
      title: "Family Law Consultation",
      status: "Pending",
      statusColor: "bg-muted-foreground",
      date: "Dec 28, 2023",
    },
  ];

  const upcomingAppointments = [
    {
      lawyer: "Me. Jean Habimana",
      type: "Video Consultation",
      date: "Jan 15, 2024",
      time: "10:00 AM",
    },
    {
      lawyer: "Me. Marie Uwimana",
      type: "Document Review",
      date: "Jan 18, 2024",
      time: "2:30 PM",
    },
  ];

  const notifications = [
    { message: "Your case CASE-2024-001 has been updated", time: "2h ago", unread: true },
    { message: "New message from Me. Jean Habimana", time: "5h ago", unread: true },
    { message: "Appointment reminder for tomorrow", time: "1d ago", unread: false },
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
            { icon: Home, label: "Dashboard", active: true },
            { icon: FileText, label: "My Cases" },
            { icon: MessageSquare, label: "AI Assistant" },
            { icon: Briefcase, label: "Find Lawyers" },
            { icon: Calendar, label: "Appointments" },
            { icon: HelpCircle, label: "Legal Resources" },
          ].map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                item.active
                  ? "bg-accent/10 text-accent"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
            <Settings className="w-5 h-5" />
            Settings
          </button>
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
                <Input placeholder="Search cases, lawyers, resources..." className="pl-10" />
              </div>
            </div>
  {/* <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors pt-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link> */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  {notifications.filter(n => n.unread).length}
                </span>
              </Button>

              {/* Profile photo dynamically */}
              <div className="w-10 h-10 rounded-full overflow-hidden">
                
                  <img src={user.profilePhoto || "/avatar/avatar.png"} 
                  alt={user.name} className="w-full h-full object-cover" />
                 : (
                  <div className="w-full h-full bg-accent flex items-center justify-center text-accent-foreground">
                    <User className="w-5 h-5" />
                  </div>
                )
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            
              <img
                src={user.profilePhoto || "/avatar/avatar.png"}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-primary"
              />
            
            <div>
              <h1 className="text-2xl font-display font-bold mb-1">
                Welcome back, {user?.name || "Citizen"}!
              </h1>
              <p className="text-muted-foreground">
                Here's what's happening with your cases today.
              </p>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[ 
              { icon: Plus, label: "Submit New Case", color: "gradient-gold text-primary" },
              { icon: MessageSquare, label: "Ask AI Assistant", color: "bg-secondary text-secondary-foreground" },
              { icon: Briefcase, label: "Find a Lawyer", color: "bg-primary text-primary-foreground" },
              { icon: Calendar, label: "Book Consultation", color: "bg-accent text-accent-foreground" },
            ].map((action, i) => (
              <button
                key={action.label}
                className={`flex items-center gap-3 p-4 rounded-xl ${action.color} shadow-soft hover:shadow-elevated transition-all hover:scale-[1.02]`}
              >
                <action.icon className="w-5 h-5" />
                <span className="font-medium">{action.label}</span>
              </button>
            ))}
          </motion.div>

          {/* Recent Cases and Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Cases */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="bg-card rounded-2xl border border-border shadow-soft">
                <div className="flex items-center justify-between p-5 border-b border-border">
                  <h2 className="font-semibold">Recent Cases</h2>
                  <Button variant="ghost" size="sm" className="text-accent">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
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

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* AI Assistant */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden"
              >
                <div className="gradient-hero p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">AI Legal Assistant</h3>
                      <p className="text-white/70 text-sm">Online • Ready to help</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="relative">
                    <Input placeholder="Ask a legal question..." className="pr-20" />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Mic className="w-4 h-4" />
                      </Button>
                      <Button size="icon" className="h-8 w-8">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Upcoming Appointments */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-card rounded-2xl border border-border shadow-soft"
              >
                <div className="p-5 border-b border-border">
                  <h2 className="font-semibold">Upcoming Appointments</h2>
                </div>
                <div className="divide-y divide-border">
                  {upcomingAppointments.map((apt, i) => (
                    <div key={i} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{apt.lawyer}</h4>
                          <p className="text-sm text-muted-foreground">{apt.type}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {apt.date} at {apt.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Notifications */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-card rounded-2xl border border-border shadow-soft"
              >
                <div className="p-5 border-b border-border">
                  <h2 className="font-semibold">Notifications</h2>
                </div>
                <div className="divide-y divide-border">
                  {notifications.map((notif, i) => (
                    <div key={i} className={`p-4 ${notif.unread ? "bg-accent/5" : ""}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${notif.unread ? "bg-accent" : "bg-muted"}`} />
                        <div>
                          <p className="text-sm">{notif.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
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
