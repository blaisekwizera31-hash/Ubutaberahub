import { motion } from "framer-motion";
import { UserPlus, FileQuestion, MessageSquare, CheckCircle } from "lucide-react";

const translations = {
  en: {
    badge: "Simple Process",
    title: "How It Works",
    description: "Get started in minutes with our intuitive four-step process.",
    steps: [
      {
        title: "Create Account",
        desc: "Sign up and select your role - citizen, lawyer, clerk, judge, or admin.",
      },
      {
        title: "Submit Your Case",
        desc: "Describe your legal issue using text or voice in your preferred language.",
      },
      {
        title: "Get AI Guidance",
        desc: "Receive instant AI-powered insights and connect with relevant professionals.",
      },
      {
        title: "Track Progress",
        desc: "Monitor your case status and communicate securely through the platform.",
      },
    ],
  },
  rw: {
    badge: "Uburyo Bworoshye",
    title: "Uko Bikora",
    description: "Tangira mu minota mike ukoresheje uburyo bwacu bworoshye bw'intambwe enye.",
    steps: [
      {
        title: "Fungura Konti",
        desc: "Iyongere muri sisitemu maze uhitemo inshingano zawe - umuturage, umunyamategeko, umwanditsi, umucamanza, cyangwa umuyobozi.",
      },
      {
        title: "Ohereza Ikibazo Cyawe",
        desc: "Sobanura ikibazo cyawe mu buryo bw'inyandiko cyangwa ijwi mu rurimi wihitiyemo.",
      },
      {
        title: "Habwa Ubufasha bwa AI",
        desc: "Akira inama zihuse zitanzwe na AI ukanahuzwa n'inzobere zibishoboye.",
      },
      {
        title: "Kurikirana Aho Bigeze",
        desc: "Genenzura uko ikibazo cyawe gihagaze ukanavugana n'abandi mu buryo bwizewe.",
      },
    ],
  },
  fr: {
    badge: "Processus Simple",
    title: "Comment ça marche",
    description: "Commencez en quelques minutes grâce à notre processus intuitif en quatre étapes.",
    steps: [
      {
        title: "Créer un compte",
        desc: "Inscrivez-vous et sélectionnez votre rôle - citoyen, avocat, greffier, juge ou administrateur.",
      },
      {
        title: "Soumettre votre dossier",
        desc: "Décrivez votre problème juridique par écrit ou par voix dans la langue de votre choix.",
      },
      {
        title: "Obtenir l'aide de l'IA",
        desc: "Recevez des conseils instantanés de l'IA et connectez-vous avec des professionnels.",
      },
      {
        title: "Suivre la progression",
        desc: "Surveillez l'état de votre dossier et communiquez en toute sécurité via la plateforme.",
      },
    ],
  },
};

// Map the icons and step numbers separately so we can reuse them with translations
const stepIcons = [
  { icon: UserPlus, nr: "01" },
  { icon: FileQuestion, nr: "02" },
  { icon: MessageSquare, nr: "03" },
  { icon: CheckCircle, nr: "04" },
];

interface HowItWorksSectionProps {
  lang: string;
}

export function HowItWorksSection({ lang }: HowItWorksSectionProps) {
  const t = translations[lang as keyof typeof translations] || translations.en;

  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">
            {t.badge}
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold mt-2 mb-4">
            {t.title}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t.description}
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {t.steps.map((step, index) => {
              const IconComp = stepIcons[index].icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="relative"
                >
                  <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 text-center relative z-10 hover:shadow-elevated transition-all duration-300">
                    <div className="w-16 h-16 gradient-gold rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
                      <IconComp className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-accent font-bold text-sm mb-2">
                      {stepIcons[index].nr}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-muted-foreground text-sm">{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}