import { Github, Twitter, Linkedin, Mail, Instagram } from "lucide-react"; // Removed Scale import

const translations = {
  en: {
    tagline: "Improving access to justice in Rwanda through AI-powered legal assistance.",
    col1Title: "Platform",
    col1Links: ["Features", "How It Works", "AI Assistant", "Find a Lawyer"],
    col2Title: "For Users",
    col2Links: ["Citizens Portal", "Lawyers Portal", "Court Officials", "Admin Dashboard"],
    col3Title: "Legal",
    col3Links: ["Privacy Policy", "Terms of Service", "Data Protection", "Accessibility"],
    copyright: "© 2026 UBUTABERA",
    copyrightHub: "hub",
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
    copyright: "© 2026 UBUTABERA",
    copyrightHub: "hub",
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
    copyright: "© 2026 UBUTABERA",
    copyrightHub: "hub",
    madeWith: "Fait avec ❤️ pour le Rwanda"
  }
};

interface FooterSectionProps {
  lang: string;
}

export function FooterSection({ lang }: FooterSectionProps) {
  const t = translations[lang as keyof typeof translations] || translations.en;

  return (
    <footer className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <a href="/" className="flex items-center gap-2 mb-4">
              {/* FIXED: Replaced Scale icon with your logo from public folder */}
              <div className="w-10 h-10 flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  className="w-full h-full object-contain"
                  style={{ filter: 'brightness(0)' }}
                />
              </div>
              <span className="font-display text-xl font-bold text-black">
                <span className="text-black">UBUTABERA</span><span className="text-black">hub</span>
              </span>
            </a>
            <p className="text-black text-sm mb-4">
              {t.tagline}
            </p>
            
            {/* Social Media Links - Replace "DEMO_LINK" with your real URLs later */}
            <div className="flex gap-3">
              <a href="https://twitter.com/@blaiseikb" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors text-black">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/blaiseikb" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors text-black">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://github.com/blaisekwizera31-hash/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors text-black">
                <Github className="w-4 h-4" />
              </a>
              <a href="mailto:blaisekwizera31@gmail.com" className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors text-black">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 1 - Platform */}
          <div>
            <h4 className="font-semibold mb-4 text-black">{t.col1Title}</h4>
            <ul className="space-y-2 text-sm text-black">
              <li><a href="#features" className="hover:text-gray-700 transition-colors">{t.col1Links[0]}</a></li>
              <li><a href="#how-it-works" className="hover:text-gray-700 transition-colors">{t.col1Links[1]}</a></li>
              <li><a href="#features" className="hover:text-gray-700 transition-colors">{t.col1Links[2]}</a></li>
              <li><a href="/find-lawyer" className="hover:text-gray-700 transition-colors">{t.col1Links[3]}</a></li>
            </ul>
          </div>

          {/* Column 2 - For Users */}
          <div>
            <h4 className="font-semibold mb-4 text-black">{t.col2Title}</h4>
            <ul className="space-y-2 text-sm text-black">
              <li><a href="/auth?role=citizen" className="hover:text-gray-700 transition-colors">{t.col2Links[0]}</a></li>
              <li><a href="/auth?role=lawyer" className="hover:text-gray-700 transition-colors">{t.col2Links[1]}</a></li>
              <li><a href="/auth?role=judge" className="hover:text-gray-700 transition-colors">{t.col2Links[2]}</a></li>
              <li><a href="/auth?role=clerk" className="hover:text-gray-700 transition-colors">{t.col2Links[3]}</a></li>
            </ul>
          </div>

          {/* Column 3 - Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-black">{t.col3Title}</h4>
            <ul className="space-y-2 text-sm text-black">
              <li><a href="/legal/privacy" className="hover:text-gray-700 transition-colors">{t.col3Links[0]}</a></li>
              <li><a href="/legal/terms" className="hover:text-gray-700 transition-colors">{t.col3Links[1]}</a></li>
              <li><a href="/legal/data-protection" className="hover:text-gray-700 transition-colors">{t.col3Links[2]}</a></li>
              <li><a href="/legal/accessibility" className="hover:text-gray-700 transition-colors">{t.col3Links[3]}</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-black/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-black">
            {t.copyright}<span className="text-black font-semibold">{t.copyrightHub}</span>. 
          </p>
          <p className="text-sm text-black">
            {t.madeWith}
          </p>
        </div>
      </div>
    </footer>
  );
}