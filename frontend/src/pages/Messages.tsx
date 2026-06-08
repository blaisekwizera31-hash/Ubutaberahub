import { motion } from "framer-motion";
import { Search, Send, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getConversationMessages, getConversations, sendConversationMessage } from "@/services/backend";

interface MessagesProps {
  lang?: string;
}

const translations = {
  en: {
    title: "Messages",
    subtitle: "Communicate directly with your assigned lawyer or citizen",
    search: "Search messages...",
    typeMessage: "Type a message...",
    send: "Send",
    online: "Online",
    offline: "Offline",
    noConversations: "No conversations yet. Submit a case to start chatting.",
  },
};

const Messages = ({ lang = "en" }: MessagesProps) => {
  const t = translations.en;
  const location = useLocation();
  const navigate = useNavigate();
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;
  const currentRole = user?.role === "lawyer" ? "lawyer" : "citizen";

  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, any[]>>({});

  useEffect(() => {
    getConversations()
      .then((data) => {
        const convs = Array.isArray(data.conversations) ? data.conversations : [];
        setConversations(convs);

        const params = new URLSearchParams(location.search);
        const byQuery = params.get("conversationId");
        if (byQuery && convs.some((c) => c.id === byQuery)) {
          setSelectedConversationId(byQuery);
        } else if (convs.length > 0) {
          setSelectedConversationId(convs[0].id);
        }
      })
      .catch(() => {
        setConversations([]);
      });
  }, [location.search]);

  useEffect(() => {
    const q = new URLSearchParams(location.search).get("q") || "";
    if (q) setSearchQuery(q);
  }, [location.search]);

  useEffect(() => {
    if (!selectedConversationId) return;
    getConversationMessages(selectedConversationId)
      .then((data) => {
        setMessagesByConversation((prev) => ({
          ...prev,
          [selectedConversationId]: Array.isArray(data.messages) ? data.messages : [],
        }));
      })
      .catch(() => {
        setMessagesByConversation((prev) => ({ ...prev, [selectedConversationId]: [] }));
      });
  }, [selectedConversationId]);

  const displayedConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((conv) => {
      const haystack = `${conv.contact || ""} ${conv.subject || ""} ${conv.lastMessage || ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [conversations, searchQuery]);

  const activeMessages = selectedConversationId ? messagesByConversation[selectedConversationId] || [] : [];
  const selectedConversation =
    conversations.find((conv) => conv.id === selectedConversationId) || displayedConversations[0] || null;

  const handleSend = async () => {
    const body = newMessage.trim();
    if (!body || !selectedConversationId || isSending) return;
    setIsSending(true);
    try {
      const sent = await sendConversationMessage(selectedConversationId, body);
      const item = sent.message;
      setMessagesByConversation((prev) => ({
        ...prev,
        [selectedConversationId]: [...(prev[selectedConversationId] || []), item],
      }));
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversationId
            ? { ...c, lastMessage: body, lastMessageAt: item.createdAt, unread: 0 }
            : c,
        ),
      );
      setNewMessage("");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <DashboardLayout role={currentRole} userName={user?.name || "User"} lang={lang}>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-semibold text-slate-900">{t.title}</h1>
          <p className="text-muted-foreground mt-1">{t.subtitle}</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
          <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder={t.search}
                  className="pl-10 bg-slate-50 border-slate-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {displayedConversations.map((conv, index) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06 }}
                  onClick={() => setSelectedConversationId(conv.id)}
                  className={`p-4 border-b cursor-pointer hover:bg-slate-50 transition-colors ${
                    selectedConversationId === conv.id ? "bg-slate-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <img src="/avatar/avatar.png" alt={conv.contact} className="w-12 h-12 rounded-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm text-slate-900 truncate">{conv.contact}</h4>
                        <span className="text-xs text-slate-500">
                          {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString() : ""}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-1">{conv.role}</p>
                      <p className="text-sm text-slate-600 truncate">{conv.lastMessage || conv.subject}</p>
                    </div>
                    {Number(conv.unread || 0) > 0 && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-semibold">{conv.unread}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {displayedConversations.length === 0 && (
                <div className="p-4 text-sm text-muted-foreground">{t.noConversations}</div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/avatar/avatar.png"
                  alt={selectedConversation?.contact || "Contact"}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-slate-900">{selectedConversation?.contact || "Contact"}</h3>
                  <p className="text-xs text-slate-500">{selectedConversation?.online ? t.online : t.offline}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.isOwn ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-900"
                    }`}
                  >
                    <p className="text-sm">{msg.body}</p>
                    <p className={`text-xs mt-1 ${msg.isOwn ? "text-blue-100" : "text-slate-500"}`}>
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t">
              <div className="flex items-end gap-2">
                <Textarea
                  placeholder={t.typeMessage}
                  className="min-h-[44px] max-h-32 resize-none"
                  rows={1}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Button size="icon" className="bg-blue-600 hover:bg-blue-700" onClick={handleSend} disabled={isSending}>
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
