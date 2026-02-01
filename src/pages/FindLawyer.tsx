import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  ChevronRight,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";

// 1. Translation Object
const translations = {
  en: {
    title: "Find a Lawyer",
    subtitle: "Browse verified legal professionals to assist with your case.",
    searchPlaceholder: "Search lawyers by name, specialization...",
    moreFilters: "More Filters",
    exp: "yrs",
    rate: "RWF/hour",
    book: "Book Now",
    status: { available: "Available", busy: "Busy" },
    specs: ["All", "Family Law", "Criminal Law", "Property Law", "Corporate Law", "Immigration Law", "Human Rights"],
  },
  rw: {
    title: "Shaka Umunyamategeko",
    subtitle: "Shakisha abanyamategeko babifitiye uburenganzira bakufasha mu rubanza rwawe.",
    searchPlaceholder: "Shakisha izina cyamasomo...",
    moreFilters: "Gushungura bindi",
    exp: "imyaka",
    rate: "RWF/isaha",
    book: "Saba gahunda",
    status: { available: "Arahari", busy: "Arabyize" },
    specs: ["Byose", "Amategeko y'umuryango", "Amategeko mpanabyaha", "Amategeko y'ubutaka", "Amategeko y'ubucuruzi", "Amategeko y'abinjira n'abasohoka", "Uburenganzira bwa muntu"],
  },
  fr: {
    title: "Trouver un Avocat",
    subtitle: "Parcourez les professionnels du droit vérifiés pour vous aider dans votre affaire.",
    searchPlaceholder: "Rechercher par nom, spécialisation...",
    moreFilters: "Plus de filtres",
    exp: "ans",
    rate: "RWF/heure",
    book: "Prendre RDV",
    status: { available: "Disponible", busy: "Occupé" },
    specs: ["Tout", "Droit de la famille", "Droit pénal", "Droit de la propriété", "Droit des sociétés", "Droit de l'immigration", "Droits de l'homme"],
  }
};

interface FindLawyerProps {
  lang?: string;
}

const FindLawyer = ({ lang = "en" }: FindLawyerProps) => {
  const t = translations[lang as keyof typeof translations] || translations.en;

  // Get User Data
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;

  const lawyers = [
    {
      id: 1,
      name: "Me. Jean Habimana",
      specialization: [t.specs[1], t.specs[3]],
      experience: 12,
      rating: 4.9,
      reviews: 127,
      location: "Kigali, Rwanda",
      hourlyRate: 50000,
      available: true,
    },
    {
      id: 2,
      name: "Me. Marie Uwimana",
      specialization: [t.specs[2], t.specs[6]],
      experience: 8,
      rating: 4.8,
      reviews: 89,
      location: "Kigali, Rwanda",
      hourlyRate: 45000,
      available: true,
    },
    {
      id: 3,
      name: "Me. Patrick Niyonzima",
      specialization: [t.specs[4]],
      experience: 15,
      rating: 4.7,
      reviews: 156,
      location: "Huye, Rwanda",
      hourlyRate: 60000,
      available: false,
    },
  ];

  return (
    <DashboardLayout 
      role="client" 
      userName={user?.name} 
      lang={lang}
    >
      <div className="space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold mb-1">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </motion.div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={t.searchPlaceholder} className="pl-10" />
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap gap-2"
          >
            {t.specs.map((spec, index) => (
              <Button
                key={spec}
                variant={index === 0 ? "default" : "outline"}
                size="sm"
                className="rounded-full"
              >
                {spec}
              </Button>
            ))}
            <Button variant="outline" size="sm" className="rounded-full">
              <Filter className="w-4 h-4 mr-2" />
              {t.moreFilters}
            </Button>
          </motion.div>
        </div>

        {/* Lawyer Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {lawyers.map((lawyer, index) => (
            <motion.div
              key={lawyer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl border border-border shadow-soft p-5 hover:shadow-elevated transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <span className="text-xl font-bold text-primary">{lawyer.name.charAt(4)}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{lawyer.name}</h3>
                    <BadgeCheck className="w-4 h-4 text-secondary flex-shrink-0" />
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {lawyer.specialization.map((spec) => (
                      <Badge key={spec} variant="secondary" className="text-[10px] px-2 py-0">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      {lawyer.rating} ({lawyer.reviews})
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {lawyer.experience} {t.exp}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-4 h-4" />
                    {lawyer.location}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div>
                  <span className="text-lg font-bold text-foreground">
                    {lawyer.hourlyRate.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">{t.rate}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  {lawyer.available ? (
                    <Badge className="bg-green-500/10 text-green-600 border-none hover:bg-green-500/10">
                      {t.status.available}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      {t.status.busy}
                    </Badge>
                  )}
                  <Button size="sm" className="gap-1">
                    {t.book} <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FindLawyer;