import { motion } from "framer-motion";
import { 
  MessageSquare, 
  Shield, 
  Clock, 
  FileText, 
  Users, 
  Mic,
  Globe,
  Lock
} from "lucide-react";

const translations = {
  en: {
    sectionBadge: "Features",
    sectionTitle: "Everything You Need for Legal Access",
    sectionDesc: "A comprehensive platform designed to bridge the gap between citizens and the justice system.",
    items: {
      assistant: { title: "AI Legal Assistant", desc: "Get instant guidance on legal matters in your preferred language." },
      voice: { title: "Voice Input", desc: "Speak naturally in Kinyarwanda, English, or French to describe your questions." },
      multi: { title: "Multilingual Support", desc: "Full support for Kinyarwanda, English, and French across all features." },
      case: { title: "Case Management", desc: "Submit, track, and manage your legal cases with complete transparency." },
      lawyer: { title: "Lawyer Directory", desc: "Find and connect with qualified lawyers based on expertise." },
      clock: { title: "Hearing Scheduling", desc: "Book consultations and receive hearing notifications automatically." },
      secure: { title: "Secure Communication", desc: "End-to-end encrypted messaging between all parties involved." },
      privacy: { title: "Privacy First", desc: "Your data is protected with enterprise-grade security and compliance." },
    }
  },
  rw: {
    sectionBadge: "Ibiranga Porogaramu",
    sectionTitle: "Ibyo ukeneye byose kugira ngo ubone ubutabera",
    sectionDesc: "Urubuga rwuzuye rwagenewe guhuza abaturage n'urwego rw'ubutabera.",
    items: {
      assistant: { title: "Umufasha wa AI mu mategeko", desc: "Habwa amabwiriza ako kanya ku bibazo by'amategeko mu rurimi wihitiyemo." },
      voice: { title: "Gukoresha Ijwi", desc: "Vuga mu Kinyarwanda, Icyongereza, cyangwa Igifaransa usobanure ikibazo cyawe." },
      multi: { title: "Indimi Nyinshi", desc: "Gushyigikira mu buryo bwuzuye Ikinyarwanda, Icyongereza, n'Igifaransa." },
      case: { title: "Gukurikirana Dosiye", desc: "Ohereza, gukurikirana no gucunga dosiye zawe mu mucyo usesuye." },
      lawyer: { title: "Abanyamategeko", desc: "Shaka ukanahuza n'abanyamategeko b'abanyamwuga babishoboye." },
      clock: { title: "Guhanga Gahunda", desc: "Gufata gahunda zo kugisha inama no kwakira imenyesha ry'imiburanishirize." },
      secure: { title: "Itumanaho Ririnzwe", desc: "Ubutumwa bwawe burinzwe cyane hagati y'impande zose bireba." },
      privacy: { title: "Umukiro w'Amakuru", desc: "Amakuru yawe arinzwe mu buryo bukomeye n'umutekano wo mu rwego rwo hejuru." },
    }
  },
  fr: {
    sectionBadge: "Fonctionnalités",
    sectionTitle: "Tout ce dont vous avez besoin pour l'accès au droit",
    sectionDesc: "Une plateforme complète conçue pour combler le fossé entre les citoyens et le système judiciaire.",
    items: {
      assistant: { title: "Assistant Juridique IA", desc: "Obtenez des conseils instantanés sur les questions juridiques dans votre langue." },
      voice: { title: "Entrée Vocale", desc: "Parlez naturellement en kinyarwanda, anglais ou français pour poser vos questions." },
      multi: { title: "Support Multilingue", desc: "Support complet du kinyarwanda, de l'anglais et du français." },
      case: { title: "Gestion des Dossiers", desc: "Soumettez, suivez et gérez vos dossiers juridiques en toute transparence." },
      lawyer: { title: "Annuaire des Avocats", desc: "Trouvez et contactez des avocats qualifiés selon leur expertise." },
      clock: { title: "Planification des Audiences", desc: "Prenez rendez-vous et recevez des notifications d'audience." },
      secure: { title: "Communication Sécurisée", desc: "Messagerie cryptée de bout en bout entre toutes les parties." },
      privacy: { title: "Confidentialité d'Abord", desc: "Vos données sont protégées par une sécurité de niveau entreprise." },
    }
  }
};

interface FeaturesSectionProps {
  lang: string;
}

export function FeaturesSection({ lang }: FeaturesSectionProps) {
  // Select the language object based on the lang prop
  const t = translations[lang as keyof typeof translations] || translations.en;

  // Re-map the features array to use the translated titles and descriptions
  const features = [
    { icon: MessageSquare, color: "bg-accent", ...t.items.assistant },
    { icon: Mic, color: "bg-secondary", ...t.items.voice },
    { icon: Globe, color: "bg-primary", ...t.items.multi },
    { icon: FileText, color: "bg-accent", ...t.items.case },
    { icon: Users, color: "bg-secondary", ...t.items.lawyer },
    { icon: Clock, color: "bg-primary", ...t.items.clock },
    { icon: Lock, color: "bg-accent", ...t.items.secure },
    { icon: Shield, color: "bg-secondary", ...t.items.privacy },
  ];

  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 bg-muted/30" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">
            {t.sectionBadge}
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold mt-2 mb-4">
            {t.sectionTitle}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t.sectionDesc}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-card rounded-2xl p-6 h-full shadow-soft hover:shadow-elevated transition-all duration-300 border border-border/50 hover:border-accent/30">
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}