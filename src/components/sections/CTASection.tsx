import { motion } from "framer-motion";
import { ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const translations = {
  en: {
    badge: "Secure & Confidential",
    title: "Ready to Access Justice?",
    description:
      "Join thousands of Rwandans who are using UBUTABERA to understand their rights, connect with legal professionals, and navigate the justice system with confidence.",
    descriptionHub: "hub",
    ctaPrimary: "Get Started Free",
    ctaSecondary: "Schedule Demo",
  },
  rw: {
    badge: "Umutekano n'Ibanga",
    title: "Witeguye kugera ku Butabera?",
    description:
      "Sanga ibihumbi by'Abanyarwanda bakoresha UBUTABERA kugira ngo basobanukirwe n'uburenganzira bwabo, bahure n'abanyamategeko, kandi banyure mu buryo bw'ubutabera bafite icyizere.",
    descriptionHub: "hub",
    ctaPrimary: "Tangira Ku buntu",
    ctaSecondary: "Saba Imbonankubone",
  },
  fr: {
    badge: "Sécurisé et Confidentiel",
    title: "Prêt à accéder à la justice ?",
    description:
      "Rejoignez des milliers de Rwandais qui utilisent UBUTABERA pour comprendre leurs droits, se connecter avec des professionnels du droit et naviguer dans le système judiciaire en toute confiance.",
    descriptionHub: "hub",
    ctaPrimary: "Commencer gratuitement",
    ctaSecondary: "Planifier une démo",
  },
};

interface CTASectionProps {
  lang: string;
}

export function CTASection({ lang }: CTASectionProps) {
  // Select the correct language object
  const t = translations[lang as keyof typeof translations] || translations.en;

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background - Lighter Gray RGB(230,230,230) */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgb(230, 230, 230)" }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/10 backdrop-blur-sm mb-8">
            <Shield className="w-4 h-4 text-black" />
            <span className="text-sm font-medium text-black">{t.badge}</span>
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-5xl font-display font-bold text-black mb-6">
            {t.title}
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-800 mb-10 max-w-2xl mx-auto">
            {t.description}
            <span className="text-black font-semibold">{t.descriptionHub}</span>
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" className="group">
              <Link to="/auth">
                {t.ctaPrimary}
              
              </Link>
            </Button>
            <Button variant="outline" size="xl" className="border-black/30">
              {t.ctaSecondary}
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
