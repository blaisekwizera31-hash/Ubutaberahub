import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X, Globe, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const languages = [
  { code: "rw", name: "Kinyarwanda" },
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
];

const translations = {
  en: {
    features: "Features",
    howItWorks: "How It Works",
    roles: "For You",
    aiAssistant: "AI Assistant",
    signIn: "Sign In",
    getStarted: "Get Started",
  },
  rw: {
    features: "Ibiranga porogaramu",
    howItWorks: "Uko bikora",
    roles: "Kuri wowe",
    aiAssistant: "Umufasha wa AI",
    signIn: "Injira",
    getStarted: "Tangira",
  },
  fr: {
    features: "Fonctionnalités",
    howItWorks: "Comment ça marche",
    roles: "Pour vous",
    aiAssistant: "Assistant IA",
    signIn: "Se connecter",
    getStarted: "Commencer",
  },
};

interface HeaderProps {
  currentLang: string;
  onLanguageChange: (lang: string) => void;
}

export function Header({ currentLang, onLanguageChange }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Select the correct language object
  const t = translations[currentLang as keyof typeof translations] || translations.en;
  const currentLanguage = languages.find((l) => l.code === currentLang) || languages[1];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="glass border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <motion.a
              href="/"
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-10 h-10 gradient-hero rounded-lg flex items-center justify-center">
                <Scale className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-foreground">
                UBUTABERA<span className="text-accent">hub</span>
              </span>
            </motion.a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {t.features}
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {t.howItWorks}
              </a>
              <a href="#roles" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {t.roles}
              </a>
              <a href="#ai-assistant" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {t.aiAssistant}
              </a>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Globe className="w-4 h-4" />
                    <span className="hidden sm:inline">{currentLanguage.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => onLanguageChange(lang.code)}
                      className={currentLang === lang.code ? "bg-accent/10" : ""}
                    >
                      {lang.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="sm" className="hidden md:inline-flex" asChild>
                <Link to="/auth">{t.signIn}</Link>
              </Button>
              <Button variant="hero" size="sm" className="hidden md:inline-flex" asChild>
                <Link to="/auth">{t.getStarted}</Link>
              </Button>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden glass border-b border-border/50"
        >
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <a href="#features" className="text-sm font-medium py-2">{t.features}</a>
            <a href="#how-it-works" className="text-sm font-medium py-2">{t.howItWorks}</a>
            <a href="#roles" className="text-sm font-medium py-2">{t.roles}</a>
            <a href="#ai-assistant" className="text-sm font-medium py-2">{t.aiAssistant}</a>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" asChild>
                <Link to="/auth">{t.signIn}</Link>
              </Button>
              <Button variant="hero" className="flex-1" asChild>
                <Link to="/auth">{t.getStarted}</Link>
              </Button>
            </div>
          </nav>
        </motion.div>
      )}
    </header>
  );
}