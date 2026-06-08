import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, MessageSquare, Briefcase, Eye, X, Mail, Phone, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { getCaseDetails, getConversations, getMyCases } from "@/services/backend";
import { UserPhoto } from "@/components/ui/UserPhoto";

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
    viewDetails: "View Details",
    clientDetails: "Client Details",
    filedCases: "Filed Cases",
    viewCase: "View Case",
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
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedCaseDetails, setSelectedCaseDetails] = useState<any>(null);

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
      if (String(conv.contactRole || conv.role || "").toLowerCase() !== "citizen") continue;
      const key = conv.contactId || `name:${String(conv.contact || "").toLowerCase()}`;
      if (!byKey.has(key)) {
        byKey.set(key, {
          key,
          id: conv.contactId || null,
          name: conv.contact || "Citizen",
          activeCases: 0,
          conversationId: conv.id,
          lastMessage: conv.lastMessage || "",
          photo: conv.contactPhoto || null,
          email: conv.contactEmail || null,
          phone: conv.contactPhone || null,
          cases: [],
        });
      } else if (!byKey.get(key).conversationId) {
        byKey.get(key).conversationId = conv.id;
      }
    }

    for (const c of cases) {
      const clientName = c.citizen || c.requestedBy || "Citizen";
      const key = c.citizenId || `name:${String(clientName).toLowerCase()}`;
      if (!byKey.has(key)) {
        byKey.set(key, {
          key,
          id: c.citizenId || null,
          name: clientName,
          activeCases: 1,
          conversationId: null,
          lastMessage: "",
          photo: c.citizenPhoto || null,
          email: c.citizenEmail || null,
          phone: c.citizenPhone || null,
          cases: [c],
        });
      } else {
        const current = byKey.get(key);
        current.activeCases += 1;
        current.photo = current.photo || c.citizenPhoto || null;
        current.email = current.email || c.citizenEmail || null;
        current.phone = current.phone || c.citizenPhone || null;
        current.cases = [...(current.cases || []), c];
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

  const openCaseDetails = async (caseId: string) => {
    const details = await getCaseDetails(caseId);
    setSelectedCaseDetails(details);
  };

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
                <UserPhoto src={client.photo} alt={client.name} className="h-12 w-12" />
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

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setSelectedClient(client)}>
                  <Eye className="w-4 h-4" />
                  {t.viewDetails}
                </Button>
                <Button
                  size="sm"
                  className="gap-2 bg-[#1a2b4b] hover:bg-[#111c32]"
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
        {selectedClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <UserPhoto src={selectedClient.photo} alt={selectedClient.name} className="h-16 w-16" />
                  <div>
                    <h2 className="text-xl font-semibold">{selectedClient.name}</h2>
                    <p className="text-sm text-muted-foreground">{t.clientDetails}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedClient(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border p-4 text-sm">
                  <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                  <p className="font-medium">{selectedClient.email || "No email available"}</p>
                </div>
                <div className="rounded-xl border border-border p-4 text-sm">
                  <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    Phone
                  </div>
                  <p className="font-medium">{selectedClient.phone || "No phone available"}</p>
                </div>
              </div>

              <div className="mt-5">
                <h3 className="mb-3 font-semibold">{t.filedCases}</h3>
                {selectedClient.cases?.length ? (
                  <div className="space-y-2">
                    {selectedClient.cases.map((caseItem: any) => (
                      <div key={caseItem.id} className="rounded-xl border border-border p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-xs font-mono text-muted-foreground">{caseItem.caseNumber || caseItem.id}</p>
                            <h4 className="font-semibold">{caseItem.title}</h4>
                            <p className="text-sm text-muted-foreground">{caseItem.status} · {caseItem.caseType || caseItem.type || "Case"}</p>
                          </div>
                          <Button variant="outline" size="sm" className="gap-2" onClick={() => openCaseDetails(caseItem.id)}>
                            <FileText className="h-4 w-4" />
                            {t.viewCase}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No cases found for this client.</p>
                )}
              </div>
            </div>
          </div>
        )}
        {selectedCaseDetails && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-mono text-muted-foreground">{selectedCaseDetails.case.caseNumber}</p>
                  <h2 className="text-xl font-semibold">{selectedCaseDetails.case.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedCaseDetails.case.status} - {selectedCaseDetails.case.caseType}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedCaseDetails(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                <div className="rounded-xl border border-border p-4">
                  <UserPhoto
                    src={selectedCaseDetails.citizen?.profile_photo}
                    alt={selectedCaseDetails.citizen?.name || "Citizen"}
                    className="mb-3 h-20 w-20"
                  />
                  <h3 className="font-semibold">{selectedCaseDetails.citizen?.name || "Citizen"}</h3>
                  <p className="text-sm text-muted-foreground">{selectedCaseDetails.citizen?.email}</p>
                  <p className="text-sm text-muted-foreground">{selectedCaseDetails.citizen?.phone || "No phone"}</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-1 font-semibold">Case Description</h3>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">{selectedCaseDetails.case.description}</p>
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold">Uploaded Files</h3>
                    {selectedCaseDetails.evidence?.length ? (
                      <div className="space-y-2">
                        {selectedCaseDetails.evidence.map((doc: any) =>
                          doc.file_url ? (
                            <a
                              key={doc.id}
                              href={doc.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="block rounded-lg border border-border p-3 text-sm hover:bg-muted"
                            >
                              {doc.file_name || "Document"}
                            </a>
                          ) : (
                            <div key={doc.id} className="rounded-lg border border-border p-3 text-sm">
                              {doc.file_name || "Document"}
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No documents were uploaded yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LawyerClients;
