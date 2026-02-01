import { motion } from "framer-motion";
import { ArrowRight, MessageSquare, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const translations = {
  en: {
    badge: "AI-Powered Legal Access for Rwanda",
    title: "Justice Made",
    titleHighlight: "Accessible",
    subtitle: "Connect with legal professionals, understand your rights, and navigate the justice system with AI-powered assistance in Kinyarwanda, English, and French.",
    cta: "Start Your Journey",
    ctaSecondary: "Explore Features",
    stats: [
      { value: "24/7", label: "AI Assistance" },
      { value: "3", label: "Languages" },
      { value: "100%", label: "Confidential" },
    ],
  },
  rw: {
    badge: "Ubutabera Bukoresheje AI mu Rwanda",
    title: "Ubutabera",
    titleHighlight: "Bugezweho",
    subtitle: "Huza n'abanyamategeko, menya uburenganzira bwawe, kandi unyure mu buryo bw'ubutabera ukoresheje ubufasha bwa AI mu Kinyarwanda, Icyongereza, n'Igifaransa.",
    cta: "Tangira Urugendo Rwawe",
    ctaSecondary: "Reba Ibikorwa",
    stats: [
      { value: "24/7", label: "Ubufasha bwa AI" },
      { value: "3", label: "Indimi" },
      { value: "100%", label: "Ibanga" },
    ],
  },
  fr: {
    badge: "Accès Juridique Alimenté par l'IA pour le Rwanda",
    title: "La Justice Rendue",
    titleHighlight: "Accessible",
    subtitle: "Connectez-vous avec des professionnels du droit, comprenez vos droits et naviguez dans le système judiciaire avec l'assistance de l'IA en Kinyarwanda, anglais et français.",
    cta: "Commencez Votre Parcours",
    ctaSecondary: "Explorer les Fonctionnalités",
    stats: [
      { value: "24/7", label: "Assistance IA" },
      { value: "3", label: "Langues" },
      { value: "100%", label: "Confidentiel" },
    ],
  },
};

interface HeroSectionProps {
  lang: string;
}

export function HeroSection({ lang }: HeroSectionProps) {
  const t = translations[lang as keyof typeof translations] || translations.en;

  return (
    <section className="relative min-h-screen flex items-center pt-20">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero opacity-[0.03]" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass shadow-soft mb-8"
          >
            <Shield className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">{t.badge}</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6"
          >
            {t.title}{" "}
            <span className="text-gradient">{t.titleHighlight}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            {t.subtitle}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Button variant="hero" size="xl" className="group" asChild>
              <Link to="/auth">
                {t.cta}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="outline" size="xl">
              {t.ctaSecondary}
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-3 gap-8 max-w-lg mx-auto"
          >
            {t.stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Floating Icons */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-10 hidden lg:block"
        >
          <div className="w-14 h-14 gradient-hero rounded-2xl flex items-center justify-center shadow-elevated">
            <MessageSquare className="w-7 h-7 text-primary-foreground" />
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-10 hidden lg:block"
        >
          <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center shadow-elevated">
            <Users className="w-7 h-7 text-secondary-foreground" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
