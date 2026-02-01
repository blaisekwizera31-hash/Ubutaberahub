import { Scale, Github, Twitter, Linkedin, Mail } from "lucide-react";

const translations = {
  en: {
    tagline: "Improving access to justice in Rwanda through AI-powered legal assistance.",
    col1Title: "Platform",
    col1Links: ["Features", "How It Works", "AI Assistant", "Find a Lawyer"],
    col2Title: "For Users",
    col2Links: ["Citizens Portal", "Lawyers Portal", "Court Officials", "Admin Dashboard"],
    col3Title: "Legal",
    col3Links: ["Privacy Policy", "Terms of Service", "Data Protection", "Accessibility"],
    copyright: "© 2026 UBUTABERAhub. ",
    madeWith: "Made with ❤️ for Rwanda"
  },
  rw: {
    tagline: "Kuvugurura uburyo bwo kugera ku butabera mu Rwanda hifashishijwe ikoranabuhanga rya AI.",
    col1Title: "Urubuga",
    col1Links: ["Ibiranga porogaramu", "Uko bikora", "Umufasha wa AI", "Shaka Umunyamategeko"],
    col2Title: "Abakoresha",
    col2Links: ["Abaturage", "Abanyamategeko", "Abakozi b'inkiko", "Abayobozi"],
    col3Title: "Amategeko",
    col3Links: ["Amategeko agenga ibanga", "Amategeko n'amabwiriza", "Kurinda amakuru", "Uburyo bworoshye"],
    copyright: "© 2026 UBUTABERAhub. ",
    madeWith: "Byakozwe n'urukundo ❤️ ku bw'u Rwanda"
  },
  fr: {
    tagline: "Améliorer l'accès à la justice au Rwanda grâce à l'assistance juridique de l'IA.",
    col1Title: "Plateforme",
    col1Links: ["Fonctionnalités", "Comment ça marche", "Assistant IA", "Trouver un avocat"],
    col2Title: "Pour les utilisateurs",
    col2Links: ["Portail Citoyens", "Portail Avocats", "Officiels de la cour", "Tableau de bord Admin"],
    col3Title: "Juridique",
    col3Links: ["Politique de confidentialité", "Conditions d'utilisation", "Protection des données", "Accessibilité"],
    copyright: "© 2026 UBUTABERAhub. ",
    madeWith: "Fait avec ❤️ pour le Rwanda"
  }
};

interface FooterSectionProps {
  lang: string;
}

export function FooterSection({ lang }: FooterSectionProps) {
  const t = translations[lang as keyof typeof translations] || translations.en;

  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 gradient-gold rounded-lg flex items-center justify-center">
                <Scale className="w-5 h-5 text-primary" />
              </div>
              <span className="font-display text-xl font-bold">
                UBUTABERA<span className="text-accent">hub</span>
              </span>
            </a>
            <p className="text-primary-foreground/70 text-sm mb-4">
              {t.tagline}
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 1 */}
          <div>
            <h4 className="font-semibold mb-4">{t.col1Title}</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              {t.col1Links.map(link => (
                <li key={link}><a href="#" className="hover:text-primary-foreground transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="font-semibold mb-4">{t.col2Title}</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              {t.col2Links.map(link => (
                <li key={link}><a href="#" className="hover:text-primary-foreground transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="font-semibold mb-4">{t.col3Title}</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              {t.col3Links.map(link => (
                <li key={link}><a href="#" className="hover:text-primary-foreground transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/70">
            {t.copyright}
          </p>
          <p className="text-sm text-primary-foreground/70">
            {t.madeWith}
          </p>
        </div>
      </div>
    </footer>
  );
}