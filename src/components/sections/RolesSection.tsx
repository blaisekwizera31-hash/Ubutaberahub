import { motion } from "framer-motion";
import { 
  User, 
  Scale, 
  Briefcase, 
  FileCheck, 
  BarChart3,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const translations = {
  en: {
    badge: "For Everyone",
    title: "Designed for Every Role in Justice",
    description: "Tailored dashboards and tools for citizens, legal professionals, and administrators.",
    getStarted: "Get Started",
    roles: [
      { id: "citizen", title: "Citizens", desc: "Submit legal issues, explore laws, find lawyers, and track your case progress.", features: ["Submit legal questions", "Find qualified lawyers", "Track case status", "Access legal resources"] },
      { id: "lawyer", title: "Lawyers", desc: "Manage consultations, upload evidence, and receive AI-generated case summaries.", features: ["Manage client cases", "AI case summaries", "Document management", "Consultation scheduling"] },
      { id: "clerk", title: "Court Clerks", desc: "Verify cases, schedule hearings, and manage court documentation efficiently.", features: ["Case verification", "Hearing scheduling", "Document processing", "Status updates"] },
      { id: "judge", title: "Judges", desc: "Review cases with AI assistance, access summaries, and manage proceedings.", features: ["Case review tools", "AI-powered insights", "Legal precedents", "Decision support"] },
      { id: "admin", title: "Administrators", desc: "Monitor system analytics, manage users, and oversee platform operations.", features: ["Analytics dashboard", "User management", "System monitoring", "Audit trails"] },
    ],
  },
  rw: {
    badge: "Kuri Bose",
    title: "Yagenewe Buri Role mu Butabera",
    description: "Dashibodi n'ibikoresho bigenewe abaturage, abanyamategeko, n'abayobozi.",
    getStarted: "Tangira",
    roles: [
      { id: "citizen", title: "Abaturage", desc: "Ohereza ibibazo by'amategeko, shakisha amategeko, shaka abanyamategeko, ukanakurikirana aho dosiye yawe igeze.", features: ["Ohereza ibibazo by'amategeko", "Shaka abanyamategeko b'inzobere", "Kurikirana uko dosiye ihagaze", "Gera ku bikoresho by'amategeko"] },
      { id: "lawyer", title: "Abanyamategeko", desc: "Cunga inama, shyiraho ibimenyetso, ukanahabwe incamake ya dosiye yakozwe na AI.", features: ["Cunga dosiye z'abakiriya", "Incamake za dosiye na AI", "Gucunga inyandiko", "Gupanga gahunda z'inama"] },
      { id: "clerk", title: "Abanditsi b'Inkiko", desc: "Genzura amadosiye, panga amatariki y'imiburanishirize, ukanacunge inyandiko z'inkiko neza.", features: ["Kugenzura dosiye", "Gupanga imiburanishirize", "Gutunganya inyandiko", "Kuvugurura uko dosiye ihagaze"] },
      { id: "judge", title: "Abacamanza", desc: "Genzura amadosiye ubinyujije kuri AI, gera ku ncamake, ukanacunge imigendekere y'urubanza.", features: ["Ibikoresho byo gusuzuma dosiye", "Inama zitanzwe na AI", "Ingero z'imanza zabaye", "Ubufasha mu gufata imyanzuro"] },
      { id: "admin", title: "Abayobozi", desc: "Genzura imibare ya sisitemu, cunga abakoresha, ukanagenzure imikorere y'urubuga.", features: ["Dashibodi y'imibare", "Gucunga abakoresha", "Kugenzura sisitemu", "Gukurikirana ibyakozwe"] },
    ],
  },
  fr: {
    badge: "Pour tous",
    title: "Conçu pour chaque rôle dans la justice",
    description: "Tableaux de bord et outils adaptés aux citoyens, aux professionnels du droit et aux administrateurs.",
    getStarted: "Commencer",
    roles: [
      { id: "citizen", title: "Citoyens", desc: "Soumettez des problèmes juridiques, explorez les lois, trouvez des avocats et suivez vos dossiers.", features: ["Soumettre des questions", "Trouver des avocats qualifiés", "Suivre le statut du dossier", "Accéder aux ressources"] },
      { id: "lawyer", title: "Avocats", desc: "Gérez les consultations, téléchargez des preuves et recevez des résumés générés par l'IA.", features: ["Gérer les dossiers clients", "Résumés de cas par l'IA", "Gestion documentaire", "Planification de consultations"] },
      { id: "clerk", title: "Greffiers", desc: "Vérifiez les dossiers, planifiez les audiences et gérez efficacement la documentation du tribunal.", features: ["Vérification des dossiers", "Planification d'audiences", "Traitement des documents", "Mises à jour du statut"] },
      { id: "judge", title: "Juges", desc: "Examinez les dossiers avec l'aide de l'IA, accédez aux résumés et gérez les procédures.", features: ["Outils d'examen de cas", "Aperçus alimentés par l'IA", "Précédents juridiques", "Aide à la décision"] },
      { id: "admin", title: "Administrateurs", desc: "Surveillez les analyses du système, gérez les utilisateurs et supervisez les opérations.", features: ["Tableau de bord analytique", "Gestion des utilisateurs", "Surveillance du système", "Pistes d'audit"] },
    ],
  },
};

// Professional Solid Colors for Legal Roles
const roleStyles = [
  { icon: User, color: "bg-accent" },        // Citizen - Gold
  { icon: Briefcase, color: "bg-secondary" }, // Lawyer - Emerald
  { icon: FileCheck, color: "bg-primary" },   // Clerk - Navy Blue
  { icon: Scale, color: "bg-primary" },       // Judge - Navy Blue
  { icon: BarChart3, color: "bg-destructive" }, // Admin - Red
];

interface RolesSectionProps {
  lang: string;
}

export function RolesSection({ lang }: RolesSectionProps) {
  const t = translations[lang as keyof typeof translations] || translations.en;

  return (
    <section id="roles" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">{t.badge}</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold mt-2 mb-4">
            {t.title}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t.description}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.roles.map((role, index) => {
            const style = roleStyles[index];
            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`${index === 0 ? 'md:col-span-2 lg:col-span-1' : ''}`}
              >
                <div className="bg-card rounded-2xl p-8 h-full shadow-soft border border-border/50 hover:shadow-elevated transition-all duration-300 group">
                  <div className={`w-14 h-14 rounded-xl ${style.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <style.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-3">{role.title}</h3>
                  <p className="text-muted-foreground mb-6">{role.desc}</p>
                  <ul className="space-y-2 mb-6">
                    {role.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* RESTORED VIBRANT BUTTON WITH WORKING LINK */}
                  <Button 
                    variant="ghost" 
                    className="group/btn p-0 h-auto text-accent hover:bg-transparent hover:text-accent font-semibold"
                    asChild
                  >
                    <Link to={`/auth?role=${role.id}`}>
                      {t.getStarted} 
                      <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}