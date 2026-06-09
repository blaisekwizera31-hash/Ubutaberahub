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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useEffect, useMemo, useState } from "react";
import { bookAppointment, getLawyers, getMyAppointments } from "@/services/backend";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { UserPhoto } from "@/components/ui/UserPhoto";
import { SPECIALIZATION_FILTERS } from "@/lib/legalSpecializations";

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
    consultationTitle: "Request Consultation",
    consultationName: "Your Name",
    consultationPhone: "Phone Number",
    consultationPurpose: "Purpose",
    consultationSend: "Send Request",
    empty: "No registered lawyer accounts found yet.",
    status: { available: "Available", busy: "Busy" },
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
  const [selectedSpec, setSelectedSpec] = useState(SPECIALIZATION_FILTERS[0]);
  const [showFilters, setShowFilters] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortMode, setSortMode] = useState<"recommended" | "rating" | "priceLow" | "priceHigh">("recommended");
  const [selectedLawyer, setSelectedLawyer] = useState<any>(null);
  const [consultation, setConsultation] = useState({ name: user?.name || "", phone: user?.phone || "", purpose: "" });
  const [isBooking, setIsBooking] = useState(false);
  const [myAppointments, setMyAppointments] = useState<any[]>([]);

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

    getMyAppointments()
      .then((data) => setMyAppointments(Array.isArray(data.appointments) ? data.appointments : []))
      .catch(() => setMyAppointments([]));
  }, []);

  useEffect(() => {
    setSelectedSpec(SPECIALIZATION_FILTERS[0]);
  }, [lang]);

  const displayedLawyers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filtered = apiLawyers.filter((lawyer) => {
      const specs = Array.isArray(lawyer.specialization) ? lawyer.specialization : [];
      const matchesSpec = selectedSpec === SPECIALIZATION_FILTERS[0] || specs.some((spec) => String(spec).toLowerCase() === selectedSpec.toLowerCase());
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
  }, [apiLawyers, availableOnly, searchQuery, selectedSpec, sortMode]);

  const sendConsultationRequest = async () => {
    if (!selectedLawyer || !consultation.name || !consultation.phone || !consultation.purpose) return;
    setIsBooking(true);
    try {
      const startsAt = new Date();
      startsAt.setDate(startsAt.getDate() + 1);
      startsAt.setHours(9, 0, 0, 0);
      const notes = `Consultation request\nName: ${consultation.name}\nPhone: ${consultation.phone}\nPurpose: ${consultation.purpose}`;
      await bookAppointment({
        lawyerId: selectedLawyer.id,
        appointmentType: "Consultation",
        startsAt: startsAt.toISOString(),
        durationMinutes: 30,
        mode: "phone",
        notes,
      });
      toast({ title: "Appointment requested", description: selectedLawyer.name });
      navigate("/dashboard/appointments");
    } catch (error: any) {
      toast({
        title: error?.response?.status === 409 ? "Already booked" : "Failed to send request",
        description: error?.response?.data?.message || error.message || "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  const hasRecentBooking = (lawyerId: string) => {
    const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
    return myAppointments.some((apt) => {
      const createdAt = new Date(apt.bookedAt || apt.createdAt || apt.startsAt || 0).getTime();
      return apt.lawyerId === lawyerId && ["pending", "confirmed"].includes(apt.status) && createdAt >= twoDaysAgo;
    });
  };

  const openBooking = (lawyer: any) => {
    if (hasRecentBooking(lawyer.id)) {
      toast({
        title: "Already booked",
        description: "You have already booked this lawyer in the last 2 days.",
        variant: "destructive",
      });
      return;
    }

    setSelectedLawyer(lawyer);
    setConsultation((prev) => ({ ...prev, name: user?.name || prev.name, phone: user?.phone || prev.phone }));
  };

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
            {SPECIALIZATION_FILTERS.map((spec) => (
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
                <UserPhoto src={lawyer.avatarUrl} alt={lawyer.name} className="h-16 w-16 flex-shrink-0" />
                
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
                  {lawyer.availableTime && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Available: {lawyer.availableTime}
                    </p>
                  )}
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
                    onClick={() => openBooking(lawyer)}
                    disabled={!lawyer.available}
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
        {selectedLawyer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
              <div className="mb-5 flex items-center gap-3">
                <UserPhoto src={selectedLawyer.avatarUrl} alt={selectedLawyer.name} className="h-12 w-12" />
                <div>
                  <h2 className="text-lg font-semibold">{t.consultationTitle}</h2>
                  <p className="text-sm text-muted-foreground">{selectedLawyer.name}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t.consultationName}</Label>
                  <Input value={consultation.name} onChange={(e) => setConsultation({ ...consultation, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{t.consultationPhone}</Label>
                  <Input value={consultation.phone} onChange={(e) => setConsultation({ ...consultation, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{t.consultationPurpose}</Label>
                  <Textarea value={consultation.purpose} onChange={(e) => setConsultation({ ...consultation, purpose: e.target.value })} rows={4} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedLawyer(null)}>Cancel</Button>
                  <Button onClick={sendConsultationRequest} disabled={isBooking || !consultation.name || !consultation.phone || !consultation.purpose}>
                    {isBooking ? "..." : t.consultationSend}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FindLawyer;

