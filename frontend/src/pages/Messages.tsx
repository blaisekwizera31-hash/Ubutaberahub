import { motion } from "framer-motion";
import { Search, Send, MoreVertical, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { UserPhoto } from "@/components/ui/UserPhoto";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createConversation, getConversationMessages, getConversations, getMessageUsers, sendConversationMessage } from "@/services/backend";
import { useToast } from "@/hooks/use-toast";

interface MessagesProps {
  lang?: string;
}

const translations = {
  en: {
    title: "Messages",
    subtitle: "Communicate directly with your assigned attorney or citizen",
    search: "Search messages...",
    typeMessage: "Type a message...",
    send: "Send",
    online: "Online",
    offline: "Offline",
    noConversations: "No conversations yet. Submit a case to start chatting.",
    newMessage: "New Message",
    chooseUser: "Choose User",
    noUsers: "No users found.",
    loadingUsers: "Loading users...",
    typing: "is typing...",
  },
};

const groupConversationsByContact = (items: any[]) => {
  const grouped = new Map<string, any>();
  for (const conv of items) {
    const key = conv.contactId || conv.contact || conv.id;
    const existing = grouped.get(key);
    if (!existing) {
      grouped.set(key, { ...conv, conversationIds: conv.conversationIds || [conv.id] });
      continue;
    }

    const currentTime = new Date(conv.lastMessageAt || conv.updatedAt || conv.createdAt || 0).getTime();
    const existingTime = new Date(existing.lastMessageAt || existing.updatedAt || existing.createdAt || 0).getTime();
    existing.conversationIds = [...new Set([...(existing.conversationIds || [existing.id]), conv.id])];
    existing.unread = Number(existing.unread || 0) + Number(conv.unread || 0);
    if (currentTime > existingTime) {
      grouped.set(key, {
        ...existing,
        id: conv.id,
        subject: conv.subject,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
      });
    }
  }

  return [...grouped.values()].sort(
    (a, b) => new Date(b.lastMessageAt || b.updatedAt || b.createdAt || 0).getTime() - new Date(a.lastMessageAt || a.updatedAt || a.createdAt || 0).getTime(),
  );
};

const matchesConversationTarget = (conv: any, conversationId?: string | null, peerId?: string | null) => {
  const ids = Array.isArray(conv.conversationIds) ? conv.conversationIds : [conv.id];
  return Boolean(
    (conversationId && (conv.id === conversationId || ids.includes(conversationId))) ||
      (peerId && conv.contactId === peerId),
  );
};

const Messages = ({ lang = "en" }: MessagesProps) => {
  const t = translations.en;
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;
  const currentRole = ["lawyer", "judge", "clerk", "court_admin", "citizen"].includes(user?.role) ? user.role : "citizen";
  const portalBase =
    currentRole === "lawyer" ? "/lawyer-dashboard" :
    currentRole === "judge" ? "/judge-dashboard" :
    currentRole === "clerk" ? "/clerk-dashboard" :
    currentRole === "court_admin" ? "/court-admin-dashboard" :
    "/dashboard";

  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, any[]>>({});
  const [messageUsers, setMessageUsers] = useState<any[]>([]);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [isStartingConversation, setIsStartingConversation] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [typingByConversation, setTypingByConversation] = useState<Record<string, boolean>>({});
  const socketRef = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  const appendMessage = useCallback((conversationId: string, message: any) => {
    setMessagesByConversation((prev) => {
      const existing = prev[conversationId] || [];
      if (existing.some((item) => item.id === message.id)) return prev;
      return { ...prev, [conversationId]: [...existing, message] };
    });
  }, []);

  const refreshConversations = useCallback(async () => {
    try {
      const data = await getConversations();
      const convs = groupConversationsByContact(Array.isArray(data.conversations) ? data.conversations : []);
      setConversations(convs);

      const params = new URLSearchParams(location.search);
      const byQuery = params.get("conversationId");
      const byPeer = params.get("peerId");
      setSelectedConversationId((current) => {
        const targeted = convs.find((c) => matchesConversationTarget(c, byQuery, byPeer));
        if (targeted) return targeted.id;
        const currentTarget = current ? convs.find((c) => matchesConversationTarget(c, current, null)) : null;
        if (currentTarget) return currentTarget.id;
        return convs[0]?.id || null;
      });
    } catch {
      setConversations([]);
    }
  }, [location.search]);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  const loadMessageUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    setUsersError("");
    try {
      const data = await getMessageUsers("all");
      setMessageUsers(Array.isArray(data.users) ? data.users : []);
    } catch (error: any) {
      setMessageUsers([]);
      const status = error?.response?.status;
      setUsersError(
        status === 404
          ? "User list route is not active. Restart the backend, then try again."
          : error?.response?.data?.message || error?.response?.data?.error || error?.message || "Failed to load users",
      );
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    loadMessageUsers();
  }, [loadMessageUsers]);

  useEffect(() => {
    const q = new URLSearchParams(location.search).get("q") || "";
    if (q) setSearchQuery(q);
  }, [location.search]);

  useEffect(() => {
    if (!selectedConversationId) return;
    const loadMessages = () => {
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
    };
    loadMessages();
    const timer = window.setInterval(loadMessages, 5000);
    return () => window.clearInterval(timer);
  }, [selectedConversationId]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5173/api";
    const wsBase = apiBase.replace(/^http/i, "ws").replace(/\/api\/?$/, "");
    const socket = new WebSocket(`${wsBase}/ws?token=${encodeURIComponent(token)}`);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "typing" && payload.conversationId) {
          setTypingByConversation((prev) => ({ ...prev, [payload.conversationId]: payload.isTyping === true }));
          return;
        }

        if (payload.type !== "new_message" || !payload.conversationId || !payload.message) return;
        appendMessage(payload.conversationId, payload.message);
        setMessagesByConversation((prev) => ({
          ...prev,
          [payload.conversationId]: [
            ...(prev[payload.conversationId] || []).filter((item) => item.id !== payload.message.id),
            payload.message,
          ],
        }));
        refreshConversations();
      } catch {}
    };

    return () => {
      socketRef.current = null;
      socket.close();
    };
  }, [appendMessage, refreshConversations]);

  const sendTypingState = useCallback((isTyping: boolean) => {
    if (!selectedConversationId || socketRef.current?.readyState !== WebSocket.OPEN) return;
    socketRef.current.send(JSON.stringify({
      type: "typing",
      conversationId: selectedConversationId,
      isTyping,
    }));
  }, [selectedConversationId]);

  const handleMessageChange = (value: string) => {
    setNewMessage(value);
    if (!selectedConversationId) return;

    sendTypingState(value.trim().length > 0);
    if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(() => {
      sendTypingState(false);
    }, 1200);
  };

  const displayedConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((conv) => {
      const haystack = `${conv.contact || ""} ${conv.subject || ""} ${conv.lastMessage || ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [conversations, searchQuery]);

  const activeMessages = selectedConversationId ? messagesByConversation[selectedConversationId] || [] : [];
  const activePeerIsTyping = selectedConversationId ? typingByConversation[selectedConversationId] === true : false;
  const selectedConversation =
    conversations.find((conv) => conv.id === selectedConversationId) || displayedConversations[0] || null;

  const filteredMessageUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    if (!q) return messageUsers;
    return messageUsers.filter((messageUser) =>
      `${messageUser.name || ""} ${messageUser.email || ""} ${messageUser.subtitle || ""}`.toLowerCase().includes(q),
    );
  }, [messageUsers, userQuery]);

  const startConversation = async (messageUser: any) => {
    if (!messageUser?.id || isStartingConversation) return;
    setIsStartingConversation(true);
    try {
      const result = await createConversation({
        peerId: messageUser.id,
        subject: `Conversation with ${messageUser.name || "User"}`,
      });
      await refreshConversations();
      setSelectedConversationId(result.conversation.id);
      setShowUserPicker(false);
      setUserQuery("");
      const params = new URLSearchParams();
      params.set("conversationId", result.conversation.id);
      params.set("peerId", messageUser.id);
      navigate(`${portalBase}/messages?${params.toString()}`);
    } catch (error: any) {
      toast({ title: "Could not start conversation", description: error.message || "Unknown error", variant: "destructive" });
    } finally {
      setIsStartingConversation(false);
    }
  };

  const handleSend = async () => {
    const body = newMessage.trim();
    if (!body || !selectedConversationId || isSending) return;
    setIsSending(true);
    try {
      const sent = await sendConversationMessage(selectedConversationId, body);
      const item = sent.message;
      appendMessage(selectedConversationId, item);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversationId
            ? { ...c, lastMessage: body, lastMessageAt: item.createdAt, unread: 0 }
            : c,
        ),
      );
      setNewMessage("");
      sendTypingState(false);
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
              <Button
                className="mb-3 w-full gap-2"
                onClick={() => {
                  setShowUserPicker(true);
                  loadMessageUsers();
                }}
              >
                <Plus className="h-4 w-4" />
                {t.newMessage}
              </Button>
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
                      <UserPhoto src={conv.contactPhoto} alt={conv.contact} className="h-12 w-12" />
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
                <UserPhoto
                  src={selectedConversation?.contactPhoto}
                  alt={selectedConversation?.contact || "Contact"}
                  className="h-10 w-10"
                />
                <div>
                  <h3 className="font-semibold text-slate-900">{selectedConversation?.contact || "Contact"}</h3>
                  <p className="text-xs text-slate-500">{selectedConversation?.online ? t.online : t.offline}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => navigate(`${portalBase}/settings`)}>
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
              {activePeerIsTyping && (
                <div className="text-xs text-slate-500">
                  {selectedConversation?.contact || "Contact"} {t.typing}
                </div>
              )}
            </div>

            <div className="p-4 border-t">
              <div className="flex items-end gap-2">
                <Textarea
                  placeholder={t.typeMessage}
                  className="min-h-[44px] max-h-32 resize-none"
                  rows={1}
                  value={newMessage}
                  onChange={(e) => handleMessageChange(e.target.value)}
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
          {showUserPicker && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="max-h-[85vh] w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
                <div className="flex items-center justify-between border-b border-border p-4">
                  <h2 className="font-semibold">{t.chooseUser}</h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowUserPicker(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      placeholder={t.search}
                      value={userQuery}
                      onChange={(event) => setUserQuery(event.target.value)}
                    />
                  </div>
                </div>
                <div className="max-h-[55vh] overflow-y-auto border-t border-border">
                  {isLoadingUsers && (
                    <div className="p-4 text-sm text-muted-foreground">{t.loadingUsers}</div>
                  )}
                  {!isLoadingUsers && usersError && (
                    <div className="p-4 text-sm text-destructive">{usersError}</div>
                  )}
                  {!isLoadingUsers && !usersError && filteredMessageUsers.map((messageUser) => (
                    <button
                      key={messageUser.id}
                      type="button"
                      className="flex w-full items-center gap-3 border-b border-border p-4 text-left hover:bg-muted/50"
                      onClick={() => startConversation(messageUser)}
                      disabled={isStartingConversation}
                    >
                      <UserPhoto src={messageUser.profilePhoto} alt={messageUser.name || "User"} className="h-11 w-11 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">{messageUser.name || "User"}</p>
                        <p className="truncate text-sm text-muted-foreground">{messageUser.subtitle || messageUser.email || messageUser.role}</p>
                      </div>
                    </button>
                  ))}
                  {!isLoadingUsers && !usersError && filteredMessageUsers.length === 0 && (
                    <div className="p-4 text-sm text-muted-foreground">{t.noUsers}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
