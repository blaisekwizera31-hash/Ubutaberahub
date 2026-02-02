import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Book, MessageCircle, Phone, Mail, FileText, Scale, Users, HelpCircle, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

// 1. Hand-written translation dictionary
const translations = {
  en: {
    title: "How can we help you?",
    subtitle: "Search our help center or browse categories below",
    searchPlaceholder: "Search for help...",
    browseCategories: "Browse Categories",
    popularArticles: "Popular Articles",
    needMoreHelp: "Still need help?",
    categories: [
      { title: "Getting Started", description: "Learn the basics of using UBUTABERAhub" },
      { title: "Case Management", description: "How to track and manage your legal cases" },
      { title: "Legal Resources", description: "Accessing templates and laws" },
      { title: "Account & Security", description: "Manage your profile and privacy" },
      { title: "AI Assistant", description: "Getting the most out of your AI legal aid" },
      { title: "Billing & Plans", description: "Pricing and subscription information" },
    ],
    articles: [
      "How to file a new case",
      "Finding the right lawyer for your needs",
      "Resetting your password",
      "Understanding court fees in Rwanda",
    ],
    contactOptions: {
      chat: { title: "AI Assistant", description: "Get instant answers from AI", button: "Start Chat" },
      email: { title: "Email Support", description: "Response within 24 hours", button: "Send Email" },
      phone: { title: "Call Us", description: "Mon-Fri, 8am - 5pm", button: "Call Now" }
    }
  },
  rw: {
    title: "Twagufasha ute?",
    subtitle: "Shaka ubufasha cyangwa urebe ibyiciro biri hano munsi",
    searchPlaceholder: "Shaka ubufasha...",
    browseCategories: "Reba Ibyiciro",
    popularArticles: "Inyandiko zikunzwe",
    needMoreHelp: "Uracyakeneye ubufasha?",
    categories: [
      { title: "Gutangira", description: "Iga uburyo bw'ibanze bwo gukoresha UBUTABERAhub" },
      { title: "Gucunga Imanza", description: "Uko wakurikira kandi ugacunga imanza zawe" },
      { title: "Amategeko", description: "Gushaka inyandiko n'amategeko" },
      { title: "Konti n'Umutekano", description: "Cunga umwirondoro n'ubuzima bwite" },
      { title: "Umufasha wa AI", description: "Uko wakoresha neza ubufasha bw'ubwenge bw'ubukorano" },
      { title: "Kwishura", description: "Ibijyanye n'ibiciro n'uburyo bwo kwishura" },
    ],
    articles: [
      "Uko wafungura urubanza rushya",
      "Gushaka umunyamategeko ugukwiriye",
      "Guhindura ijambo ry'ibanga",
      "Sobanukirwa amafaranga y'urukiko mu Rwanda",
    ],
    contactOptions: {
      chat: { title: "Umufasha wa AI", description: "Baza ibibazo usubizwe ako kanya", button: "Tangira" },
      email: { title: "Imeyili", description: "Gusubizwa mu masaha 24", button: "Ohereza" },
      phone: { title: "Duhamagare", description: "Kuva ku wa mbere-wa gatanu", button: "Hamagara" }
    }
  }
};

const HelpCenter = () => {
  // 2. Language state (In a real app, this should match your Sidebar's state)
  const [lang, setLang] = useState<'en' | 'rw'>('en');
  
  // 3. Translation helper
  const t = translations[lang];

  const categoryIcons = [Book, FileText, Scale, Users, MessageCircle, HelpCircle];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Passing a toggle function to sidebar or using global state is recommended */}
      <DashboardSidebar activePage="help-center" />
      
      <main className="flex-1 overflow-auto">
        <DashboardHeader searchPlaceholder={t.searchPlaceholder} />
        
        <div className="p-6 space-y-8">
          {/* Language Toggle for Demo purposes */}
          <div className="flex justify-end">
             <Button variant="ghost" size="sm" onClick={() => setLang(lang === 'en' ? 'rw' : 'en')}>
               {lang === 'en' ? "Kinyarwanda" : "English"}
             </Button>
          </div>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h1 className="text-3xl font-display font-bold mb-3">{t.title}</h1>
            <p className="text-muted-foreground mb-6">{t.subtitle}</p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={t.searchPlaceholder}
                className="pl-12 py-6 text-lg"
              />
            </div>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-xl font-semibold mb-4">{t.browseCategories}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {t.categories.map((category, index) => {
                const Icon = categoryIcons[index] || HelpCircle;
                return (
                  <div
                    key={index}
                    className="bg-card rounded-xl border border-border p-5 hover:shadow-soft hover:border-accent/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium mb-1 group-hover:text-accent transition-colors">
                          {category.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Popular Articles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold mb-4">{t.popularArticles}</h2>
            <div className="bg-card rounded-xl border border-border divide-y divide-border">
              {t.articles.map((article, index) => (
                <div
                  key={index}
                  className="p-4 hover:bg-muted/50 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">{article}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contact Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold mb-4">{t.needMoreHelp}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card rounded-xl border border-border p-5 text-center">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-medium mb-1">{t.contactOptions.chat.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {t.contactOptions.chat.description}
                </p>
                <Link to="/ai-assistant">
                  <Button variant="outline" size="sm">
                    {t.contactOptions.chat.button}
                  </Button>
                </Link>
              </div>

              <div className="bg-card rounded-xl border border-border p-5 text-center">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-medium mb-1">{t.contactOptions.email.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {t.contactOptions.email.description}
                </p>
                <Button variant="outline" size="sm">
                  {t.contactOptions.email.button}
                </Button>
              </div>

              <div className="bg-card rounded-xl border border-border p-5 text-center">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-medium mb-1">{t.contactOptions.phone.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {t.contactOptions.phone.description}
                </p>
                <Button variant="outline" size="sm">
                  {t.contactOptions.phone.button}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default HelpCenter;