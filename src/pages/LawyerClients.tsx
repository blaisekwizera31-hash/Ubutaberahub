import { motion } from "framer-motion";
import { Plus, Search, Mail, Phone, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";

interface LawyerClientsProps {
  lang?: string;
}

const translations = {
  en: {
    title: "My Clients",
    subtitle: "Manage your client relationships",
    search: "Search clients...",
    newClient: "New Client",
    activeCases: "Active Cases",
    contact: "Contact",
    viewProfile: "View Profile"
  },
  rw: {
    title: "Abakiriya banjye",
    subtitle: "Cunga abakiriya bawe",
    search: "Shakisha abakiriya...",
    newClient: "Umukiriya mushya",
    activeCases: "Imanza zikurikirana",
    contact: "Vugana",
    viewProfile: "Reba umwirondoro"
  },
  fr: {
    title: "Mes clients",
    subtitle: "Gérer vos relations clients",
    search: "Rechercher des clients...",
    newClient: "Nouveau client",
    activeCases: "Dossiers actifs",
    contact: "Contact",
    viewProfile: "Voir le profil"
  }
};

const LawyerClients = ({ lang = "en" }: LawyerClientsProps) => {
  const t = translations[lang as keyof typeof translations] || translations.en;
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;

  const clients = [
    {
      id: 1,
      name: "Jean-Claude Mugisha",
      email: "jc.mugisha@email.com",
      phone: "+250 788 123 456",
      activeCases: 2,
      avatar: "/avatar/avatar.png"
    },
    {
      id: 2,
      name: "Marie Uwimana",
      email: "m.uwimana@email.com",
      phone: "+250 788 234 567",
      activeCases: 1,
      avatar: "/avatar/avatar.png"
    },
    {
      id: 3,
      name: "Patrick Mugabo",
      email: "p.mugabo@email.com",
      phone: "+250 788 345 678",
      activeCases: 1,
      avatar: "/avatar/avatar.png"
    },
    {
      id: 4,
      name: "ABC Corporation",
      email: "legal@abccorp.rw",
      phone: "+250 788 456 789",
      activeCases: 3,
      avatar: "/avatar/avatar.png"
    }
  ];

  return (
    <DashboardLayout role="lawyer" userName={user?.name || "Advocate"} lang={lang}>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{t.title}</h1>
            <p className="text-muted-foreground mt-1">{t.subtitle}</p>
          </div>
          <Button className="gap-2 bg-[#1a2b4b] hover:bg-[#111c32]">
            <Plus className="w-4 h-4" />
            {t.newClient}
          </Button>
        </motion.div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder={t.search}
            className="pl-10 bg-white border-slate-200"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client, index) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={client.avatar}
                  alt={client.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-slate-200"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-900">{client.name}</h3>
                  <Badge variant="secondary" className="mt-1">
                    {client.activeCases} {t.activeCases}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="w-4 h-4" />
                  <span>{client.phone}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  {t.contact}
                </Button>
                <Button size="sm" className="flex-1 bg-[#1a2b4b] hover:bg-[#111c32]">
                  {t.viewProfile}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LawyerClients;
