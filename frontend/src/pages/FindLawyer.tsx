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
import { useEffect, useMemo, useState } from "react";
import { getLawyers } from "@/services/backend";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// 1. Full Translation Object for 3 Languages
const translations = {
  en: {
    title: "Find a Lawyer",
    subtitle: "Browse verified legal professionals to assist with your case.",
    searchPlaceholder: "Search lawyers by name, specialization...",
    moreFilters: "More Filters",
    lessFilters: "Hide Filters",
    availabilityOnly: "Available Only",
    sort: "Sort",
    sortRecommended: "Recommended",
    sortRating: "Highest Rating",
    sortPriceLow: "Lowest Price",
    sortPriceHigh: "Highest Price",
    exp: "yrs",
    rate: "RWF/hour",
    book: "Book Now",
    empty: "No registered lawyer accounts found yet.",
    status: { available: "Available", busy: "Busy" },
    specs: ["All", "Family Law", "Criminal Law", "Property Law", "Corporate Law", "Immigration Law", "Human Rights"],
  },
  rw: {
    title: "Shaka Umunyamategeko",
    subtitle: "Shakisha abanyamategeko babifitiye uburenganzira bakufasha mu rubanza rwawe.",
    searchPlaceholder: "Shakisha izina cyangwa isomo...",
    moreFilters: "Gushungura bindi",
    lessFilters: "Hisha gushungura",
    availabilityOnly: "Ariho gusa",
    sort: "Itondekanya",
    sortRecommended: "Bisabwa",
    sortRating: "Amanota menshi",
    sortPriceLow: "Igiciro gito",
    sortPriceHigh: "Igiciro kinini",
    exp: "imyaka",
    rate: "RWF/isaha",
    book: "Saba gahunda",
    empty: "Nta konti z'abanyamategeko zanditswe ziboneka ubu.",
    status: { available: "Arahari", busy: "Arabyize" },
    specs: ["Byose", "Amategeko y'umuryango", "Amategeko mpanabyaha", "Amategeko y'ubutaka", "Amategeko y'ubucuruzi", "Amategeko y'abinjira n'abasohoka", "Uburenganzira bwa muntu"],
  },
  fr: {
    title: "Trouver un Avocat",
    subtitle: "Parcourez les professionnels du droit vérifiés pour vous aider dans votre affaire.",
    searchPlaceholder: "Rechercher par nom, spécialisation...",
    moreFilters: "Plus de filtres",
    lessFilters: "Masquer filtres",
    availabilityOnly: "Disponibles seulement",
    sort: "Trier",
    sortRecommended: "Recommandés",
    sortRating: "Mieux notés",
    sortPriceLow: "Prix croissant",
    sortPriceHigh: "Prix décroissant",
    exp: "ans",
    rate: "RWF/heure",
    book: "Prendre RDV",
    empty: "Aucun compte avocat enregistre n'est disponible pour l'instant.",
    status: { available: "Disponible", busy: "Occupé" },
    specs: ["Tout", "Droit de la famille", "Droit pénal", "Droit de la propriété", "Droit des sociétés", "Droit de l'immigration", "Droits de l'homme"],
  }
};

interface FindLawyerProps {
  lang?: string;
}

const FindLawyer = ({ lang = "en" }: FindLawyerProps) => {
  const t = translations[lang as keyof typeof translations] || translations.en;
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Get User Data safely
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : { name: "User" };
  const [apiLawyers, setApiLawyers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpec, setSelectedSpec] = useState(t.specs[0]);
  const [showFilters, setShowFilters] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortMode, setSortMode] = useState<"recommended" | "rating" | "priceLow" | "priceHigh">("recommended");

  useEffect(() => {
    const q = new URLSearchParams(location.search).get("q") || "";
    if (q) setSearchQuery(q);
  }, [location.search]);

  useEffect(() => {
    getLawyers()
      .then((data) => {
        if (Array.isArray(data.lawyers)) setApiLawyers(data.lawyers);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setSelectedSpec(t.specs[0]);
  }, [t.specs]);

  const displayedLawyers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filtered = apiLawyers.filter((lawyer) => {
      const specs = Array.isArray(lawyer.specialization) ? lawyer.specialization : [];
      const matchesSpec = selectedSpec === t.specs[0] || specs.some((spec) => String(spec).toLowerCase() === selectedSpec.toLowerCase());
      const haystack = `${lawyer.name || ""} ${lawyer.location || ""} ${specs.join(" ")}`.toLowerCase();
      const matchesSearch = !normalizedQuery || haystack.includes(normalizedQuery);
      const matchesAvailability = !availableOnly || lawyer.available;
      return matchesSpec && matchesSearch && matchesAvailability;
    });

    if (sortMode === "rating") {
      return [...filtered].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    }
    if (sortMode === "priceLow") {
      return [...filtered].sort((a, b) => Number(a.hourlyRate || 0) - Number(b.hourlyRate || 0));
    }
    if (sortMode === "priceHigh") {
      return [...filtered].sort((a, b) => Number(b.hourlyRate || 0) - Number(a.hourlyRate || 0));
    }
    return filtered;
  }, [apiLawyers, availableOnly, searchQuery, selectedSpec, sortMode, t.specs]);

  return (
    <DashboardLayout 
      role="citizen" // Updated to "citizen" to match your LayoutConfig and fix the error
      userName={user?.name} 
      lang={lang}
    >
      <div className="space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-semibold mb-1">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </motion.div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t.searchPlaceholder}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap gap-2"
          >
            {t.specs.map((spec) => (
              <Button
                key={spec}
                variant={selectedSpec === spec ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setSelectedSpec(spec)}
              >
                {spec}
              </Button>
            ))}
            <Button variant="outline" size="sm" className="rounded-full" onClick={() => setShowFilters((v) => !v)}>
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? t.lessFilters : t.moreFilters}
            </Button>
          </motion.div>
          {showFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={availableOnly ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setAvailableOnly((v) => !v)}
              >
                {t.availabilityOnly}
              </Button>
              <Button
                variant={sortMode === "recommended" ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setSortMode("recommended")}
              >
                {t.sort}: {t.sortRecommended}
              </Button>
              <Button
                variant={sortMode === "rating" ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setSortMode("rating")}
              >
                {t.sortRating}
              </Button>
              <Button
                variant={sortMode === "priceLow" ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setSortMode("priceLow")}
              >
                {t.sortPriceLow}
              </Button>
              <Button
                variant={sortMode === "priceHigh" ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setSortMode("priceHigh")}
              >
                {t.sortPriceHigh}
              </Button>
            </div>
          )}
        </div>

        {/* Lawyer Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {displayedLawyers.map((lawyer, index) => (
            <motion.div
              key={lawyer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl border border-border shadow-soft p-5 hover:shadow-elevated transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <span className="text-xl font-semibold text-primary">{lawyer.name.charAt(4)}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{lawyer.name}</h3>
                    <BadgeCheck className="w-4 h-4 text-secondary flex-shrink-0" />
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(Array.isArray(lawyer.specialization) ? lawyer.specialization : []).map((spec) => (
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
                  <span className="text-lg font-semibold text-foreground">
                    {Number(lawyer.hourlyRate || 0).toLocaleString()}
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
                  <Button
                    size="sm"
                    className="gap-1"
                    onClick={() => {
                      navigate(`/submit-case?lawyerId=${encodeURIComponent(lawyer.id)}&lawyerName=${encodeURIComponent(lawyer.name)}`);
                      toast({
                        title: t.book,
                        description: `${lawyer.name}`,
                      });
                    }}
                  >
                    {t.book} <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
          {displayedLawyers.length === 0 && (
            <div className="bg-card rounded-2xl border border-border shadow-soft p-5 text-muted-foreground">
              {t.empty}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FindLawyer;
