import { motion } from "framer-motion";
import { Calendar, Clock, Search, Video, UserRound, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useEffect, useMemo, useState } from "react";
import { getAppointments, getLawyers } from "@/services/backend";
import { useToast } from "@/hooks/use-toast";

type Role = "citizen" | "lawyer" | "judge" | "clerk";

const translations = {
  en: {
    title: "Appointments",
    subtitleCitizen: "Track your appointments and book from registered lawyers.",
    subtitleRole: "Track your real appointments.",
    searchPlaceholder: "Search appointments...",
    lawyersTitle: "Registered Lawyers",
    appointmentsTitle: "Your Appointments",
    noLawyers: "No registered lawyers available yet.",
    noAppointments: "No appointments yet.",
    book: "Book Consultation",
    joinCall: "Join Call",
    viewDetails: "View Details",
    status: { confirmed: "Confirmed", pending: "Pending", completed: "Completed" },
  },
};

interface AppointmentsProps {
  lang?: string;
}

const Appointments = ({ lang = "en" }: AppointmentsProps) => {
  const t = translations.en;
  const navigate = useNavigate();
  const { toast } = useToast();

  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : { name: "User", role: "citizen" };
  const role: Role = ["citizen", "lawyer", "judge", "clerk"].includes(user?.role) ? user.role : "citizen";

  const [searchQuery, setSearchQuery] = useState("");
  const [apiAppointments, setApiAppointments] = useState<any[]>([]);
  const [apiLawyers, setApiLawyers] = useState<any[]>([]);

  useEffect(() => {
    getAppointments(role)
      .then((data) => setApiAppointments(Array.isArray(data.appointments) ? data.appointments : []))
      .catch(() => setApiAppointments([]));

    if (role === "citizen") {
      getLawyers()
        .then((data) => setApiLawyers(Array.isArray(data.lawyers) ? data.lawyers : []))
        .catch(() => setApiLawyers([]));
    } else {
      setApiLawyers([]);
    }
  }, [role]);

  const normalizedAppointments = useMemo(
    () =>
      apiAppointments.map((apt) => ({
        id: apt.id,
        lawyer: apt.lawyer || apt.contact || "Contact",
        type: apt.type || "Consultation",
        date: apt.date || "",
        time: apt.time || "",
        duration: apt.duration || "",
        status:
          apt.status === "confirmed"
            ? t.status.confirmed
            : apt.status === "pending"
              ? t.status.pending
              : t.status.completed,
        caseId: apt.caseId || "",
        isVideo: !!apt.isVideo,
      })),
    [apiAppointments, t.status.completed, t.status.confirmed, t.status.pending],
  );

  const filteredAppointments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return normalizedAppointments;
    return normalizedAppointments.filter((apt) =>
      `${apt.lawyer} ${apt.type} ${apt.date} ${apt.caseId}`.toLowerCase().includes(q),
    );
  }, [normalizedAppointments, searchQuery]);

  return (
    <DashboardLayout role={role} userName={user?.name || "User"} lang={lang}>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground">{role === "citizen" ? t.subtitleCitizen : t.subtitleRole}</p>
        </motion.div>

        {role === "citizen" && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">{t.lawyersTitle}</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {apiLawyers.map((lawyer, index) => (
                <motion.div
                  key={lawyer.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="bg-card rounded-2xl border border-border p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{lawyer.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4" />
                        {lawyer.location || "Rwanda"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() =>
                        navigate(`/submit-case?lawyerId=${encodeURIComponent(lawyer.id)}&lawyerName=${encodeURIComponent(lawyer.name)}`)
                      }
                    >
                      {t.book}
                    </Button>
                  </div>
                </motion.div>
              ))}
              {apiLawyers.length === 0 && (
                <div className="bg-card rounded-2xl border border-border p-5 text-muted-foreground">{t.noLawyers}</div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={t.searchPlaceholder} className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <h2 className="text-lg font-semibold">{t.appointmentsTitle}</h2>
          <div className="grid gap-4">
            {filteredAppointments.map((apt, index) => (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-2xl border border-border p-5"
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {apt.isVideo ? <Video className="w-6 h-6 text-primary" /> : <UserRound className="w-6 h-6 text-primary" />}
                    </div>
                    <div>
                      <h3 className="font-semibold">{apt.lawyer}</h3>
                      <p className="text-sm text-muted-foreground">{apt.type}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {apt.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {apt.time} ({apt.duration})
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        apt.status === t.status.confirmed
                          ? "bg-green-500/10 text-green-500"
                          : apt.status === t.status.pending
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {apt.status}
                    </span>
                    <Button
                      size="sm"
                      variant={apt.isVideo ? "default" : "outline"}
                      className="ml-auto sm:ml-0"
                      onClick={() => {
                        if (apt.isVideo) {
                          toast({ title: t.joinCall, description: `${apt.lawyer} • ${apt.time}` });
                          return;
                        }
                        navigate(`/messages?contact=${encodeURIComponent(apt.lawyer)}`);
                      }}
                    >
                      {apt.isVideo ? t.joinCall : t.viewDetails}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
            {filteredAppointments.length === 0 && (
              <div className="bg-card rounded-2xl border border-border p-5 text-muted-foreground">{t.noAppointments}</div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Appointments;
