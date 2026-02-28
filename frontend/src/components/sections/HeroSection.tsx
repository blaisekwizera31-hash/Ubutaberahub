import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
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
    <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
      {/* Clean White Background */}
      <div className="absolute inset-0 bg-white" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Two Column Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight text-black"
            >
              {t.title}{" "}
              <span className="text-black">{t.titleHighlight}</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-600"
            >
              {t.subtitle}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button variant="hero" size="xl" className="group" asChild>
                <Link to="/auth">
                  {t.cta}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <a href="#features">
                  {t.ctaSecondary}
                </a>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200"
            >
              {t.stats.map((stat, index) => (
                <div key={index}>
                  <div className="text-2xl md:text-3xl font-bold text-black">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column - Lady Justice Photo Only */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative h-[600px] hidden lg:flex items-center justify-center"
          >
            {/* Main Illustration Container */}
            <div className="relative w-full h-full flex items-center justify-center">
              
              {/* Circular Glow Background */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[450px] h-[450px] rounded-full bg-gray-100 blur-3xl" />
              </div>

              {/* Central Lady Justice Photo */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="relative z-10 flex items-center justify-center"
              >
                {/* Photo container with effects */}
                <div className="relative w-[500px] h-[650px] flex items-center justify-center">
                  {/* Glow effect behind photo */}
                  <div className="absolute inset-0 bg-gray-100 rounded-full blur-3xl scale-110" />
                  
                  {/* Lady Justice Photo */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src="/p.png"
                      alt="Lady Justice with Rwanda Flag"
                      className="w-full h-full object-contain"
                      style={{ 
                        filter: 'drop-shadow(0 30px 60px rgba(0, 0, 0, 0.3))',
                      }}
                    />
                  </div>
                </div>
              </motion.div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
