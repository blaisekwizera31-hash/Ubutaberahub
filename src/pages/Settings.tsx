import { motion } from "framer-motion";
import {
  Scale,
  MessageSquare,
  FileText,
  User,
  Bell,
  Calendar,
  Home,
  Briefcase,
  HelpCircle,
  Settings as SettingsIcon,
  LogOut,
  Shield,
  Globe,
  Moon,
  Smartphone,
  Key,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";

const Settings = () => {
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
            { icon: HelpCircle, label: "Legal Resources", href: "/legal-resources" },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-1">
          <Link to="/settings" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-accent/10 text-accent transition-all">
            <SettingsIcon className="w-5 h-5" />
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
            <h1 className="text-xl font-semibold">Settings</h1>
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

        {/* Settings Content */}
        <div className="p-6 space-y-6 max-w-3xl">
          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-2xl border border-border shadow-soft p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <UserCircle className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-semibold">Profile</h2>
            </div>
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center">
                <User className="w-10 h-10 text-accent-foreground" />
              </div>
              <Button variant="outline">Change Photo</Button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Full Name</label>
                <Input defaultValue="Amahoro Jean" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input defaultValue="amahoro@example.com" type="email" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Phone Number</label>
                <Input defaultValue="+250 788 123 456" type="tel" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">National ID</label>
                <Input defaultValue="1 1990 8 0123456 7 89" />
              </div>
            </div>
            <Button className="mt-4">Save Changes</Button>
          </motion.div>

          {/* Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card rounded-2xl border border-border shadow-soft p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-semibold">Preferences</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Language</p>
                    <p className="text-xs text-muted-foreground">Select your preferred language</p>
                  </div>
                </div>
                <select className="bg-muted rounded-lg px-3 py-2 text-sm border-none">
                  <option>English</option>
                  <option>Français</option>
                  <option>Kinyarwanda</option>
                </select>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Dark Mode</p>
                    <p className="text-xs text-muted-foreground">Toggle dark theme</p>
                  </div>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">SMS Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive updates via SMS</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </motion.div>

          {/* Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-card rounded-2xl border border-border shadow-soft p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-semibold">Security</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Change Password</p>
                    <p className="text-xs text-muted-foreground">Update your password</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Change</Button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Two-Factor Authentication</p>
                    <p className="text-xs text-muted-foreground">Add extra security to your account</p>
                  </div>
                </div>
                <Switch />
              </div>
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-destructive/5 rounded-2xl border border-destructive/20 p-6"
          >
            <h2 className="text-lg font-semibold text-destructive mb-4">Danger Zone</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <Button variant="destructive">Delete Account</Button>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
