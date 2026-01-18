import { motion } from "framer-motion";
import {
  Scale,
  Search,
  Bell,
  User,
  Filter,
  Star,
  MapPin,
  Clock,
  ChevronRight,
  Home,
  FileText,
  MessageSquare,
  Briefcase,
  Calendar,
  HelpCircle,
  Settings,
  LogOut,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const FindLawyer = () => {
  const lawyers = [
    {
      id: 1,
      name: "Me. Jean Habimana",
      specialization: ["Family Law", "Property Law"],
      experience: 12,
      rating: 4.9,
      reviews: 127,
      location: "Kigali, Rwanda",
      hourlyRate: 50000,
      available: true,
      avatar: null,
    },
    {
      id: 2,
      name: "Me. Marie Uwimana",
      specialization: ["Criminal Law", "Human Rights"],
      experience: 8,
      rating: 4.8,
      reviews: 89,
      location: "Kigali, Rwanda",
      hourlyRate: 45000,
      available: true,
      avatar: null,
    },
    {
      id: 3,
      name: "Me. Patrick Niyonzima",
      specialization: ["Corporate Law", "Contract Law"],
      experience: 15,
      rating: 4.7,
      reviews: 156,
      location: "Huye, Rwanda",
      hourlyRate: 60000,
      available: false,
      avatar: null,
    },
    {
      id: 4,
      name: "Me. Diane Mukamana",
      specialization: ["Immigration Law", "Civil Rights"],
      experience: 6,
      rating: 4.6,
      reviews: 64,
      location: "Musanze, Rwanda",
      hourlyRate: 40000,
      available: true,
      avatar: null,
    },
  ];

  const specializations = [
    "All",
    "Family Law",
    "Criminal Law",
    "Property Law",
    "Corporate Law",
    "Immigration Law",
    "Human Rights",
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
            { icon: FileText, label: "My Cases", href: "/dashboard" },
            { icon: MessageSquare, label: "AI Assistant", href: "/dashboard" },
            { icon: Briefcase, label: "Find Lawyers", active: true, href: "/find-lawyer" },
            { icon: Calendar, label: "Appointments", href: "/dashboard" },
            { icon: HelpCircle, label: "Legal Resources", href: "/dashboard" },
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
                <Input placeholder="Search lawyers by name, specialization..." className="pl-10" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  2
                </span>
              </Button>
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <User className="w-5 h-5 text-accent-foreground" />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-display font-bold mb-1">Find a Lawyer</h1>
            <p className="text-muted-foreground">Browse verified legal professionals to assist with your case.</p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap gap-2"
          >
            {specializations.map((spec) => (
              <Button
                key={spec}
                variant={spec === "All" ? "default" : "outline"}
                size="sm"
                className="rounded-full"
              >
                {spec}
              </Button>
            ))}
            <Button variant="outline" size="sm" className="rounded-full">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </motion.div>

          {/* Lawyer Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {lawyers.map((lawyer) => (
              <div
                key={lawyer.id}
                className="bg-card rounded-2xl border border-border shadow-soft p-5 hover:shadow-elevated transition-all cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{lawyer.name}</h3>
                      <BadgeCheck className="w-4 h-4 text-secondary flex-shrink-0" />
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {lawyer.specialization.map((spec) => (
                        <Badge key={spec} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        {lawyer.rating} ({lawyer.reviews})
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {lawyer.experience} yrs
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-4 h-4" />
                      {lawyer.location}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div>
                    <span className="text-lg font-semibold">{lawyer.hourlyRate.toLocaleString()} RWF</span>
                    <span className="text-sm text-muted-foreground">/hour</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {lawyer.available ? (
                      <Badge className="bg-secondary/10 text-secondary border-secondary/20">Available</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Busy</Badge>
                    )}
                    <Button size="sm">
                      Book Now <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default FindLawyer;
