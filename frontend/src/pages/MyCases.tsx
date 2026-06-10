import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Eye, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { getCaseDetails, getMyCases } from "@/services/backend";
import { UserPhoto } from "@/components/ui/UserPhoto";

const MyCases = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : { name: "User", role: "citizen" };
  const t =
    language === "rw"
      ? {
          title: "Imanza zanjye",
          subtitle: "Imanza washizemo uruhare",
          unassigned: "Nta munyamategeko",
          searchPlaceholder: "Shakisha imanza...",
          filed: "Byatanzwe",
          filedBy: "Byatanzwe na",
          lawyer: "Umunyamategeko",
          assignedLawyer: "Umunyamategeko wahawe urubanza",
          noLawyer: "Nta munyamategeko urahabwa urubanza",
          phone: "Telefone",
          email: "Imeyili",
          viewDetails: "Reba amakuru",
          empty: "Nta manza ufitemo uruhare ziraboneka.",
          newCase: "Urubanza rushya",
        }
      : language === "fr"
        ? {
            title: "Mes dossiers",
            subtitle: "Dossiers auxquels vous participez",
            unassigned: "Non attribue",
            searchPlaceholder: "Rechercher des dossiers...",
            filed: "Depose",
            filedBy: "Depose par",
            lawyer: "Avocat",
            assignedLawyer: "Avocat assigne",
            noLawyer: "Aucun avocat assigne",
            phone: "Telephone",
            email: "Email",
            viewDetails: "Voir details",
            empty: "Aucun dossier de participation trouve.",
            newCase: "Nouveau dossier",
          }
        : {
            title: "My Cases",
            subtitle: "Cases you participate in",
            unassigned: "Unassigned",
            searchPlaceholder: "Search cases...",
            filed: "Filed",
            filedBy: "Filed by",
            lawyer: "Attorney",
            assignedLawyer: "Assigned Attorney",
            noLawyer: "No attorney assigned yet",
            phone: "Phone",
            email: "Email",
            viewDetails: "View Details",
            empty: "No participating cases found yet.",
            newCase: "New Case",
          };

  const [cases, setCases] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [selectedDetails, setSelectedDetails] = useState<any>(null);

  useEffect(() => {
    const q = new URLSearchParams(location.search).get("q") || "";
    setQuery(q);
  }, [location.search]);

  useEffect(() => {
    getMyCases()
      .then((data) => {
        setCases(Array.isArray(data.cases) ? data.cases : []);
      })
      .catch(() => {
        setCases([]);
      });
  }, []);

  const displayedCases = useMemo(() => {
    const q = query.trim().toLowerCase();
    const normalized = cases.map((c) => ({
      id: c.id,
      caseNumber: c.caseNumber || c.id,
      title: c.title,
      status: c.status || "Pending",
      statusColor: /completed|resolved|closed/i.test(c.status) ? "bg-secondary" : /pending|awaiting|review/i.test(c.status) ? "bg-muted-foreground" : "bg-amber-500",
      date: c.date || (c.filedAt ? new Date(c.filedAt).toLocaleDateString() : ""),
      type: c.caseType || c.type || "Other",
      lawyer: c.lawyer || t.unassigned,
      citizen: c.citizen || c.requestedBy || "Citizen",
      citizenPhoto: c.citizenPhoto || null,
      citizenEmail: c.citizenEmail || null,
      citizenPhone: c.citizenPhone || null,
    }));
    if (!q) return normalized;
    return normalized.filter((item) =>
      `${item.id} ${item.title} ${item.type} ${item.lawyer} ${item.status}`.toLowerCase().includes(q),
    );
  }, [cases, query, t.unassigned]);

  const openDetails = async (caseId: string) => {
    const details = await getCaseDetails(caseId);
    setSelectedDetails(details);
  };

  return (
    <DashboardLayout role="citizen" userName={user?.name || "User"} lang={language}>
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-2xl font-display font-semibold mb-1">{t.title}</h1>
              <p className="text-muted-foreground">{t.subtitle}</p>
            </div>
            <Link to="/dashboard/submit-case">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                {t.newCase}
              </Button>
            </Link>
          </motion.div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.searchPlaceholder} className="pl-10" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card rounded-2xl border border-border shadow-soft"
          >
            <div className="divide-y divide-border">
              {displayedCases.map((caseItem, index) => (
                <motion.div
                  key={caseItem.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.06 }}
                  className="p-5 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => openDetails(caseItem.id)}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs text-white ${caseItem.statusColor}`}>{caseItem.status}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">{caseItem.type}</span>
                      </div>
                      <h3 className="font-medium text-lg">{caseItem.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                        <span>
                          {t.filed}: {caseItem.date}
                        </span>
                        <span>
                          {t.filedBy}: {caseItem.citizen}
                        </span>
                        <span>
                          {t.lawyer}: {caseItem.lawyer}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2 sm:w-auto"
                      onClick={(event) => {
                        event.stopPropagation();
                        openDetails(caseItem.id);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                      {t.viewDetails}
                    </Button>
                  </div>
                </motion.div>
              ))}
              {displayedCases.length === 0 && <div className="p-5 text-sm text-muted-foreground">{t.empty}</div>}
            </div>
          </motion.div>
          {selectedDetails && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedDetails.case.title}</h2>
                    <p className="text-sm text-muted-foreground">{selectedDetails.case.status} · {selectedDetails.case.caseType}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedDetails(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                  <div className="rounded-xl border border-border p-4">
                    <UserPhoto
                      src={selectedDetails.lawyer?.profile_photo}
                      alt={selectedDetails.lawyer?.name || "Attorney"}
                      className="mb-3 h-20 w-20"
                    />
                    <p className="mb-2 text-sm font-semibold">{t.assignedLawyer}</p>
                    {selectedDetails.lawyer ? (
                      <>
                        <h3 className="font-semibold">{selectedDetails.lawyer.name || "Attorney"}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t.email}: {selectedDetails.lawyer.email || "Not provided"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t.phone}: {selectedDetails.lawyer.phone || "Not provided"}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t.noLawyer}</p>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="mb-1 font-semibold">Case Description</h3>
                      <p className="whitespace-pre-wrap text-sm text-muted-foreground">{selectedDetails.case.description}</p>
                    </div>
                    <div>
                      <h3 className="mb-2 font-semibold">Submitted Documents</h3>
                      {selectedDetails.evidence?.length ? (
                        <div className="space-y-2">
                          {selectedDetails.evidence.map((doc: any) => (
                            doc.file_url ? (
                              <a key={doc.id} href={doc.file_url} target="_blank" rel="noreferrer" className="block rounded-lg border border-border p-3 text-sm hover:bg-muted">
                                {doc.file_name || "Document"}
                              </a>
                            ) : (
                              <div key={doc.id} className="rounded-lg border border-border p-3 text-sm text-muted-foreground">
                                {doc.file_name || "Document"}
                              </div>
                            )
                          ))}
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

export default MyCases;

