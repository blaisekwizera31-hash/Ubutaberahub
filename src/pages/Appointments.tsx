import { motion } from "framer-motion";
import {
  Calendar,
  Plus,
  Video,
  MapPin,
  Clock,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";

// 1. Translation Object
const translations = {
  en: {
    title: "Appointments",
    subtitle: "Manage your legal consultations",
    bookBtn: "Book Appointment",
    upcoming: "Upcoming",
    past: "Past Appointments",
    searchPlaceholder: "Search appointments...",
    joinCall: "Join Call",
    viewDetails: "View Details",
    caseLabel: "Case",
    status: {
      confirmed: "Confirmed",
      pending: "Pending",
      completed: "Completed"
    },
    types: {
      video: "Video Consultation",
      docReview: "Document Review",
      inPerson: "In-Person Meeting"
    }
  },
  rw: {
    title: "Gahunda",
    subtitle: "Genzura gahunda zawe n'abanyamategeko",
    bookBtn: "Saba Gahunda",
    upcoming: "Iziyaza",
    past: "Izahise",
    searchPlaceholder: "Shakisha gahunda...",
    joinCall: "Injira muri videwo",
    viewDetails: "Reba birambuye",
    caseLabel: "Urubanza",
    status: {
      confirmed: "Byemejwe",
      pending: "Birategereje",
      completed: "Byarangiye"
    },
    types: {
      video: "Kuvugana binyuze kuri videwo",
      docReview: "Gusuzuma inyandiko",
      inPerson: "Guhura imbonankubone"
    }
  },
  fr: {
    title: "Rendez-vous",
    subtitle: "Gérez vos consultations juridiques",
    bookBtn: "Prendre RDV",
    upcoming: "À venir",
    past: "Rendez-vous passés",
    searchPlaceholder: "Rechercher des rendez-vous...",
    joinCall: "Rejoindre l'appel",
    viewDetails: "Voir les détails",
    caseLabel: "Affaire",
    status: {
      confirmed: "Confirmé",
      pending: "En attente",
      completed: "Terminé"
    },
    types: {
      video: "Consultation Vidéo",
      docReview: "Examen de documents",
      inPerson: "Réunion en personne"
    }
  }
};

interface AppointmentsProps {
  lang?: string;
}

const Appointments = ({ lang = "en" }: AppointmentsProps) => {
  const t = translations[lang as keyof typeof translations] || translations.en;

  // Get User Data for the Layout
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;

  const upcomingAppointments = [
    {
      id: 1,
      lawyer: "Me. Jean Habimana",
      type: t.types.video,
      date: "Jan 15, 2024",
      time: "10:00 AM",
      duration: "30 min",
      status: t.status.confirmed,
      caseId: "CASE-2024-001",
      isVideo: true,
    },
    {
      id: 2,
      lawyer: "Me. Marie Uwimana",
      type: t.types.docReview,
      date: "Jan 18, 2024",
      time: "2:30 PM",
      duration: "1 hour",
      status: t.status.pending,
      caseId: "CASE-2024-002",
      isVideo: false,
    },
  ];

  const pastAppointments = [
    {
      id: 3,
      lawyer: "Me. Patrick Niyonzima",
      type: t.types.inPerson,
      date: "Jan 5, 2024",
      time: "11:00 AM",
      duration: "45 min",
      status: t.status.completed,
      caseId: "CASE-2023-089",
    },
  ];

  return (
    <DashboardLayout 
      role="client" 
      userName={user?.name} 
      lang={lang}
    >
      <div className="space-y-6">
        {/* Top Header / Search bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={t.searchPlaceholder} className="pl-10" />
          </div>
          <Link to="/find-lawyer">
            <Button className="gap-2 w-full md:w-auto">
              <Plus className="w-4 h-4" />
              {t.bookBtn}
            </Button>
          </Link>
        </div>

        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </motion.div>

        {/* Upcoming Appointments */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">{t.upcoming}</h2>
          <div className="grid gap-4">
            {upcomingAppointments.map((apt, index) => (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl border border-border shadow-soft p-5"
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {apt.isVideo ? (
                        <Video className="w-6 h-6 text-primary" />
                      ) : (
                        <Calendar className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{apt.lawyer}</h3>
                      <p className="text-sm text-muted-foreground">{apt.type}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {apt.date}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {apt.time} ({apt.duration})
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t.caseLabel}: {apt.caseId}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      apt.status === t.status.confirmed 
                        ? "bg-green-500/10 text-green-500" 
                        : "bg-amber-500/10 text-amber-500"
                    }`}>
                      {apt.status}
                    </span>
                    <Button size="sm" variant={apt.isVideo ? "default" : "outline"} className="ml-auto sm:ml-0">
                      {apt.isVideo ? t.joinCall : t.viewDetails}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Past Appointments */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">{t.past}</h2>
          <div className="grid gap-4">
            {pastAppointments.map((apt) => (
              <div
                key={apt.id}
                className="bg-card rounded-2xl border border-border shadow-soft p-5 opacity-70 hover:opacity-100 transition-opacity"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{apt.lawyer}</h3>
                      <p className="text-sm text-muted-foreground">{apt.type}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {apt.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {apt.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                    {apt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Appointments;