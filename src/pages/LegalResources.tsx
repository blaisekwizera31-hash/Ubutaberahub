import { motion } from "framer-motion";
import {
  BookOpen,
  FileQuestion,
  GraduationCap,
  ExternalLink,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";

const translations = {
  en: {
    title: "Legal Resources",
    subtitle: "Educational materials and guides to help you understand your legal rights",
    browse: "Browse by Category",
    popular: "Popular Guides",
    viewAll: "View All",
    handbookTitle: "Citizen's Legal Handbook",
    handbookSub: "Complete guide to understanding your rights in Rwanda",
    downloadBtn: "Download PDF",
    faqTitle: "Frequently Asked Questions",
    readTime: "min read",
    articles: "articles",
    categories: [
      { name: "Family Law", count: 24, icon: "👨‍👩‍👧‍👦" },
      { name: "Property Law", count: 18, icon: "🏠" },
      { name: "Employment Law", count: 15, icon: "💼" },
      { name: "Business Law", count: 21, icon: "📈" },
      { name: "Criminal Law", count: 12, icon: "⚖️" },
      { name: "Civil Rights", count: 9, icon: "🗽" },
    ],
    guides: [
      { title: "Understanding Your Rights", desc: "A comprehensive guide to fundamental rights guaranteed by the constitution.", type: "Guide", time: "15" },
      { title: "How to File a Civil Case", desc: "Step-by-step instructions for initiating civil proceedings.", type: "Tutorial", time: "10" },
      { title: "Property Registration", desc: "Complete guide to registering property and land rights.", type: "Guide", time: "20" },
      { title: "Marriage Laws", desc: "Overview of matrimonial laws and procedures in Rwanda.", type: "Article", time: "12" },
    ],
    faqs: [
      "How do I get legal aid if I can't afford a lawyer?",
      "What are the steps to register a business in Rwanda?",
      "How long does a typical court case take?",
      "What documents do I need for child custody?",
    ],
  },
  rw: {
    title: "Ibikoresho by'Amategeko",
    subtitle: "Inyigisho n'amategeko bigufasha gusobanukirwa uburenganzira bwawe",
    browse: "Shakira mu byiciro",
    popular: "Inyoborabumenyi zikunzwe",
    viewAll: "Reba byose",
    handbookTitle: "Igitabo cy'uburenganzira bw'umuturage",
    handbookSub: "Inyoborabumenyi irambuye ku burenganzira bwawe mu Rwanda",
    downloadBtn: "Kuramo PDF",
    faqTitle: "Ibibazo bikunze kubazwa",
    readTime: "iminota yo gusoma",
    articles: "inyandiko",
    categories: [
      { name: "Amategeko y'umuryango", count: 24, icon: "👨‍👩‍👧‍👦" },
      { name: "Imitungo n'ubutaka", count: 18, icon: "🏠" },
      { name: "Amategeko y'umurimo", count: 15, icon: "💼" },
      { name: "Ubucuruzi", count: 21, icon: "📈" },
      { name: "Ibyaha", count: 12, icon: "⚖️" },
      { name: "Uburenganzira bwa muntu", count: 9, icon: "🗽" },
    ],
    guides: [
      { title: "Gusobanukirwa Uburenganzira Bwawe", desc: "Inyoborabumenyi ku burenganzira bw'ibanze bwishingiwe n'itegeko nshinga.", type: "Inyobora", time: "15" },
      { title: "Gufungura urubanza rw'imbonezamubano", desc: "Amabwiriza y'uko batangira urubanza mu nkiko.", type: "Inyigisho", time: "10" },
      { title: "Kwiyandikisha ku mutungo", desc: "Uburyo bwo kwandikisha imitungo n'uburenganzira ku butaka.", type: "Inyobora", time: "20" },
      { title: "Amategeko y'ishyingirwa", desc: "Incamake ku mategeko agenga ishyingirwa n'ubutane.", type: "Inyandiko", time: "12" },
    ],
    faqs: [
      "Nafashwa n'iki kubona umunyamategeko ntabishoboye?",
      "Ni ayahe matambwe yo kwandikisha ubucuruzi mu Rwanda?",
      "Urubanza mu rukiko rufata igihe kingana iki?",
      "Ni izihe nyandiko nkeneye mu rubanza rwo kurera abana?",
    ],
  },
  fr: {
    title: "Ressources Juridiques",
    subtitle: "Documents éducatifs et guides pour comprendre vos droits",
    browse: "Parcourir par catégorie",
    popular: "Guides Populaires",
    viewAll: "Voir Tout",
    handbookTitle: "Manuel Juridique du Citoyen",
    handbookSub: "Guide complet pour comprendre vos droits au Rwanda",
    downloadBtn: "Télécharger PDF",
    faqTitle: "Foire Aux Questions",
    readTime: "min de lecture",
    articles: "articles",
    categories: [
      { name: "Droit de la famille", count: 24, icon: "👨‍👩‍👧‍👦" },
      { name: "Droit foncier", count: 18, icon: "🏠" },
      { name: "Droit du travail", count: 15, icon: "💼" },
      { name: "Droit des affaires", count: 21, icon: "📈" },
      { name: "Droit pénal", count: 12, icon: "⚖️" },
      { name: "Droits civiques", count: 9, icon: "🗽" },
    ],
    guides: [
      { title: "Comprendre vos Droits", desc: "Un guide complet sur les droits fondamentaux garantis par la constitution.", type: "Guide", time: "15" },
      { title: "Déposer une plainte civile", desc: "Instructions étape par étape pour initier une procédure civile.", type: "Tutoriel", time: "10" },
      { title: "Enregistrement de propriété", desc: "Guide complet sur l'enregistrement des biens fonciers.", type: "Guide", time: "20" },
      { title: "Lois sur le mariage", desc: "Aperçu des lois et procédures matrimoniales au Rwanda.", type: "Article", time: "12" },
    ],
    faqs: [
      "Comment obtenir une aide juridique gratuite ?",
      "Quelles sont les étapes pour enregistrer une entreprise ?",
      "Combien de temps dure un procès type ?",
      "Quels documents pour la garde des enfants ?",
    ],
  },
};

interface LegalResourcesProps {
  lang?: string;
}

const LegalResources = ({ lang = "en" }: LegalResourcesProps) => {
  const t = translations[lang as keyof typeof translations] || translations.en;
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : { name: "User" };

  return (
    <DashboardLayout 
      role="citizen" 
      userName={user?.name || "User"} 
      lang={lang}
    >
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-1">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-lg font-semibold mb-4">{t.browse}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {t.categories.map((cat, index) => (
              <motion.button
                key={cat.name}
                whileHover={{ scale: 1.05 }}
                className="bg-card rounded-2xl border border-border p-4 text-center shadow-sm hover:shadow-md transition-all"
              >
                <span className="text-3xl mb-2 block">{cat.icon}</span>
                <h3 className="font-medium text-sm">{cat.name}</h3>
                <p className="text-xs text-muted-foreground">{cat.count} {t.articles}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Popular Guides */}
        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div 
            className="lg:col-span-2 space-y-4"
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                {t.popular}
              </h2>
              <Button variant="ghost" size="sm" className="text-primary">{t.viewAll}</Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {t.guides.map((guide, index) => (
                <div key={index} className="bg-card rounded-2xl border border-border p-5 hover:border-primary/50 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-1 rounded-full text-[10px] uppercase font-bold bg-primary/10 text-primary">
                      {guide.type}
                    </span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <h3 className="font-semibold mt-3 group-hover:text-primary transition-colors">{guide.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{guide.desc}</p>
                  <p className="text-xs text-muted-foreground mt-3 font-medium">{guide.time} {t.readTime}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* FAQ Sidebar */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileQuestion className="w-5 h-5 text-primary" />
              {t.faqTitle}
            </h2>
            <div className="space-y-3">
              {t.faqs.map((faq, index) => (
                <button key={index} className="w-full text-left p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-all text-sm flex items-center justify-between">
                  {faq}
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Download Call to Action */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="bg-primary rounded-2xl p-8 text-primary-foreground shadow-lg flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-xl">{t.handbookTitle}</h3>
              <p className="text-primary-foreground/80">{t.handbookSub}</p>
            </div>
          </div>
          <Button variant="secondary" size="lg" className="font-bold gap-2">
            <Download className="w-5 h-5" />
            {t.downloadBtn}
          </Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default LegalResources;