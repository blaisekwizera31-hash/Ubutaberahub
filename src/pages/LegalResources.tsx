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
  BookOpen,
  FileQuestion,
  GraduationCap,
  ExternalLink,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const LegalResources = () => {
  const categories = [
    { name: "Family Law", count: 24, icon: "👨‍👩‍👧‍👦" },
    { name: "Property Law", count: 18, icon: "🏠" },
    { name: "Employment Law", count: 15, icon: "💼" },
    { name: "Business Law", count: 21, icon: "📈" },
    { name: "Criminal Law", count: 12, icon: "⚖️" },
    { name: "Civil Rights", count: 9, icon: "🗽" },
  ];

  const guides = [
    {
      title: "Understanding Your Rights in Rwanda",
      description: "A comprehensive guide to fundamental rights guaranteed by the Rwandan constitution.",
      type: "Guide",
      readTime: "15 min read",
    },
    {
      title: "How to File a Civil Case",
      description: "Step-by-step instructions for initiating civil proceedings in Rwandan courts.",
      type: "Tutorial",
      readTime: "10 min read",
    },
    {
      title: "Property Registration Process",
      description: "Complete guide to registering property and understanding land rights.",
      type: "Guide",
      readTime: "20 min read",
    },
    {
      title: "Marriage and Divorce Laws",
      description: "Overview of matrimonial laws, rights, and procedures in Rwanda.",
      type: "Article",
      readTime: "12 min read",
    },
  ];

  const faqs = [
    "How do I get legal aid if I can't afford a lawyer?",
    "What are the steps to register a business in Rwanda?",
    "How long does a typical court case take?",
    "What documents do I need for child custody proceedings?",
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
            { icon: Calendar, label: "Appointments", href: "/appointments" },
            { icon: HelpCircle, label: "Legal Resources", active: true, href: "/legal-resources" },
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
                <Input placeholder="Search legal resources..." className="pl-10" />
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

        {/* Resources Content */}
        <div className="p-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-display font-bold mb-1">Legal Resources</h1>
            <p className="text-muted-foreground">Educational materials and guides to help you understand your legal rights</p>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-lg font-semibold mb-4">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat, index) => (
                <motion.button
                  key={cat.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-card rounded-2xl border border-border shadow-soft p-4 text-center hover:shadow-elevated hover:scale-105 transition-all"
                >
                  <span className="text-3xl mb-2 block">{cat.icon}</span>
                  <h3 className="font-medium text-sm">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground">{cat.count} articles</p>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Popular Guides */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent" />
                Popular Guides
              </h2>
              <Button variant="ghost" size="sm" className="text-accent">
                View All
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {guides.map((guide, index) => (
                <motion.div
                  key={guide.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-card rounded-2xl border border-border shadow-soft p-5 hover:shadow-elevated transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <span className="px-2 py-1 rounded-full text-xs bg-accent/10 text-accent">
                        {guide.type}
                      </span>
                      <h3 className="font-semibold mt-2 group-hover:text-accent transition-colors">
                        {guide.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{guide.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">{guide.readTime}</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* FAQs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-card rounded-2xl border border-border shadow-soft p-6"
          >
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <FileQuestion className="w-5 h-5 text-accent" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <button
                  key={index}
                  className="w-full text-left p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors flex items-center justify-between group"
                >
                  <span className="text-sm">{faq}</span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Download Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="gradient-hero rounded-2xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Citizen's Legal Handbook</h3>
                  <p className="text-white/70 text-sm">Complete guide to understanding your rights in Rwanda</p>
                </div>
              </div>
              <Button variant="secondary" className="gap-2">
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default LegalResources;
