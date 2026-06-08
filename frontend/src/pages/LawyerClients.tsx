import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, MessageSquare, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { getConversations, getMyCases } from "@/services/backend";

interface LawyerClientsProps {
  lang?: string;
}

const translations = {
  en: {
    title: "My Clients",
    subtitle: "Clients who contacted you or selected you as their lawyer",
    search: "Search clients...",
    activeCases: "Active Cases",
    noClients: "No client connections found yet.",
    openChat: "Open Chat",
  },
};

const LawyerClients = ({ lang = "en" }: LawyerClientsProps) => {
  const t = translations.en;
  const navigate = useNavigate();
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;

  const [query, setQuery] = useState("");
  const [conversations, setConversations] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);

  useEffect(() => {
    getConversations()
      .then((data) => {
        setConversations(Array.isArray(data.conversations) ? data.conversations : []);
      })
      .catch(() => setConversations([]));

    getMyCases()
      .then((data) => {
        const all = Array.isArray(data.cases) ? data.cases : [];
        const active = all.filter((c) => !/completed|resolved|closed/i.test(String(c.status || "")));
        setCases(active);
      })
      .catch(() => setCases([]));
  }, []);

  const clients = useMemo(() => {
    const byKey = new Map<string, any>();

    for (const conv of conversations) {
      if (String(conv.role || "").toLowerCase() !== "citizen") continue;
      const key = conv.contactId || `name:${String(conv.contact || "").toLowerCase()}`;
      if (!byKey.has(key)) {
        byKey.set(key, {
          key,
          id: conv.contactId || null,
          name: conv.contact || "Citizen",
          activeCases: 0,
          conversationId: conv.id,
          lastMessage: conv.lastMessage || "",
        });
      } else if (!byKey.get(key).conversationId) {
        byKey.get(key).conversationId = conv.id;
      }
    }

    for (const c of cases) {
      const clientName = c.citizen || c.requestedBy || "Citizen";
      const key = `name:${String(clientName).toLowerCase()}`;
      if (!byKey.has(key)) {
        byKey.set(key, {
          key,
          id: null,
          name: clientName,
          activeCases: 1,
          conversationId: null,
          lastMessage: "",
        });
      } else {
        byKey.get(key).activeCases += 1;
      }
    }

    return Array.from(byKey.values());
  }, [cases, conversations]);

  const displayedClients = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((client) => {
      const haystack = `${client.name} ${client.lastMessage}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [clients, query]);

  return (
    <DashboardLayout role="lawyer" userName={user?.name || "Advocate"} lang={lang}>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-semibold text-slate-900">{t.title}</h1>
          <p className="text-muted-foreground mt-1">{t.subtitle}</p>
        </motion.div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder={t.search} className="pl-10 bg-white border-slate-200" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedClients.map((client, index) => (
            <motion.div
              key={client.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-semibold">
                  {String(client.name || "C").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-900">{client.name}</h3>
                  <Badge variant="secondary" className="mt-1 gap-1">
                    <Briefcase className="w-3 h-3" />
                    {client.activeCases} {t.activeCases}
                  </Badge>
                </div>
              </div>

              <div className="text-sm text-slate-600 min-h-10">
                {client.lastMessage ? client.lastMessage : "No recent message"}
              </div>

              <div className="mt-4">
                <Button
                  size="sm"
                  className="w-full gap-2 bg-[#1a2b4b] hover:bg-[#111c32]"
                  onClick={() => navigate(client.conversationId ? `/messages?conversationId=${encodeURIComponent(client.conversationId)}` : "/messages")}
                >
                  <MessageSquare className="w-4 h-4" />
                  {t.openChat}
                </Button>
              </div>
            </motion.div>
          ))}
          {displayedClients.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 text-sm text-muted-foreground">{t.noClients}</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LawyerClients;
