import { motion } from "framer-motion";
import { Calendar, Check, Clock, MessageSquare, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useEffect, useMemo, useState } from "react";
import { createConversation, getAppointments, updateAppointmentStatus } from "@/services/backend";
import { useToast } from "@/hooks/use-toast";
import { UserPhoto } from "@/components/ui/UserPhoto";

type Role = "citizen" | "lawyer" | "judge" | "clerk";

const translations = {
  en: {
    title: "Appointments",
    subtitleCitizen: "Track your appointment requests.",
    subtitleRole: "Track your real appointments.",
    searchPlaceholder: "Search appointments...",
    appointmentsTitle: "Your Appointments",
    noAppointments: "No appointments yet.",
    availableTime: "Lawyer Available Time",
    accept: "Accept",
    reject: "Reject",
    message: "Message",
    joinCall: "Join Call",
    status: { confirmed: "Confirmed", pending: "Pending", cancelled: "Rejected", completed: "Completed" },
  },
};

interface AppointmentsProps {
  lang?: string;
}

const Appointments = ({ lang = "en" }: AppointmentsProps) => {
  const t = translations.en;
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : { name: "User", role: "citizen" };
  const role: Role = ["citizen", "lawyer", "judge", "clerk"].includes(user?.role) ? user.role : "citizen";

  const [searchQuery, setSearchQuery] = useState("");
  const [apiAppointments, setApiAppointments] = useState<any[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(location.search).get("q") || "";
    if (q) setSearchQuery(q);
  }, [location.search]);

  useEffect(() => {
    getAppointments(role)
      .then((data) => setApiAppointments(Array.isArray(data.appointments) ? data.appointments : []))
      .catch(() => setApiAppointments([]));
  }, [role]);

  const normalizedAppointments = useMemo(
    () =>
      apiAppointments.map((apt) => ({
        id: apt.id,
        lawyer: apt.lawyer || apt.contact || "Contact",
        type: apt.type || "Consultation",
        date: apt.date || "",
        time: apt.time || "",
        duration: apt.duration || (apt.durationMins ? `${apt.durationMins} min` : ""),
        status:
          apt.status === "confirmed"
            ? t.status.confirmed
            : apt.status === "pending"
              ? t.status.pending
              : apt.status === "cancelled"
                ? t.status.cancelled
                : t.status.completed,
        caseId: apt.caseId || "",
        isVideo: !!apt.isVideo,
        contactPhoto: apt.contactPhoto || apt.profilePhoto || apt.profile_photo || null,
        availableTime: apt.lawyerAvailableTime || apt.availableTime || "",
        rawStatus: apt.status || "pending",
        contactId: apt.contactId || null,
        conversationId: apt.conversationId || null,
      })),
    [apiAppointments, t.status.cancelled, t.status.completed, t.status.confirmed, t.status.pending],
  );

  const filteredAppointments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return normalizedAppointments;
    return normalizedAppointments.filter((apt) =>
      `${apt.lawyer} ${apt.type} ${apt.date} ${apt.caseId}`.toLowerCase().includes(q),
    );
  }, [normalizedAppointments, searchQuery]);

  const portalBase = role === "lawyer" ? "/lawyer-dashboard" : "/dashboard";

  const handleAccept = async (appointmentId: string) => {
    setUpdatingId(appointmentId);
    try {
      const result = await updateAppointmentStatus(appointmentId, "confirmed");
      setApiAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId
            ? { ...apt, status: "confirmed", conversationId: result.conversation?.id || apt.conversationId }
            : apt,
        ),
      );
      toast({ title: "Appointment accepted", description: "The citizen can now message you." });
    } catch (error: any) {
      toast({ title: "Could not accept appointment", description: error.message || "Unknown error", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReject = async (appointmentId: string) => {
    setUpdatingId(appointmentId);
    try {
      await updateAppointmentStatus(appointmentId, "cancelled");
      setApiAppointments((prev) =>
        prev.map((apt) => (apt.id === appointmentId ? { ...apt, status: "cancelled" } : apt)),
      );
      toast({ title: "Appointment rejected", description: "The citizen has been notified." });
    } catch (error: any) {
      toast({ title: "Could not reject appointment", description: error.message || "Unknown error", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const openMessage = async (apt: any) => {
    try {
      let conversationId = apt.conversationId;
      if (!conversationId && apt.contactId) {
        const result = await createConversation({ peerId: apt.contactId, subject: `Appointment with ${apt.lawyer}` });
        conversationId = result.conversation.id;
      }
      const params = new URLSearchParams();
      if (conversationId) params.set("conversationId", conversationId);
      if (apt.contactId) params.set("peerId", apt.contactId);
      navigate(`${portalBase}/messages${params.toString() ? `?${params.toString()}` : ""}`);
    } catch (error: any) {
      toast({ title: "Could not open messages", description: error.message || "Unknown error", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout role={role} userName={user?.name || "User"} lang={lang}>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-semibold">{t.title}</h1>
          <p className="text-muted-foreground">{role === "citizen" ? t.subtitleCitizen : t.subtitleRole}</p>
        </motion.div>

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
                    <UserPhoto src={apt.contactPhoto} alt={apt.lawyer} className="h-12 w-12 flex-shrink-0" />
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
                        {apt.availableTime && (
                          <span>
                            {t.availableTime}: {apt.availableTime}
                          </span>
                        )}
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
                    {apt.isVideo && (
                    <Button
                      size="sm"
                      variant={apt.isVideo ? "default" : "outline"}
                      className="ml-auto sm:ml-0"
                      onClick={() => {
                        if (apt.isVideo) {
                          toast({ title: t.joinCall, description: `${apt.lawyer} • ${apt.time}` });
                          return;
                        }
                      }}
                    >
                      {t.joinCall}
                    </Button>
                    )}
                    {role === "lawyer" && apt.rawStatus === "pending" && (
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button size="sm" className="gap-2" onClick={() => handleAccept(apt.id)} disabled={updatingId === apt.id}>
                          <Check className="h-4 w-4" />
                          {updatingId === apt.id ? "..." : t.accept}
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2" onClick={() => handleReject(apt.id)} disabled={updatingId === apt.id}>
                          <X className="h-4 w-4" />
                          {updatingId === apt.id ? "..." : t.reject}
                        </Button>
                      </div>
                    )}
                    {apt.rawStatus === "confirmed" && (
                      <Button size="sm" variant="outline" className="gap-2" onClick={() => openMessage(apt)}>
                        <MessageSquare className="h-4 w-4" />
                        {t.message}
                      </Button>
                    )}
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
