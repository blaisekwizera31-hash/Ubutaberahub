import { motion } from "framer-motion";
import { ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const translations = {
  en: {
    badge: "Secure & Confidential",
    title: "Ready to Access Justice?",
    description: "Join thousands of Rwandans who are using UBUTABERAhub to understand their rights, connect with legal professionals, and navigate the justice system with confidence.",
    ctaPrimary: "Get Started Free",
    ctaSecondary: "Schedule Demo"
  },
  rw: {
    badge: "Umutekano n'Ibanga",
    title: "Witeguye kugera ku Butabera?",
    description: "Sanga ibihumbi by'Abanyarwanda bakoresha UBUTABERAhub kugira ngo basobanukirwe n'uburenganzira bwabo, bahure n'abanyamategeko, kandi banyure mu buryo bw'ubutabera bafite icyizere.",
    ctaPrimary: "Tangira Ku buntu",
    ctaSecondary: "Saba Imbonankubone"
  },
  fr: {
    badge: "Sécurisé et Confidentiel",
    title: "Prêt à accéder à la justice ?",
    description: "Rejoignez des milliers de Rwandais qui utilisent UBUTABERAhub pour comprendre leurs droits, se connecter avec des professionnels du droit et naviguer dans le système judiciaire en toute confiance.",
    ctaPrimary: "Commencer gratuitement",
    ctaSecondary: "Planifier une démo"
  }
};

interface CTASectionProps {
  lang: string;
}

export function CTASection({ lang }: CTASectionProps) {
  // Select the correct language object
  const t = translations[lang as keyof typeof translations] || translations.en;

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-8">
            <Shield className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-white">{t.badge}</span>
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
            {t.title}
          </h2>

          {/* Description */}
          <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
            {t.description}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" className="group">
              {t.ctaPrimary}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="glass" size="xl" className="text-white border-white/20">
              {t.ctaSecondary}
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}