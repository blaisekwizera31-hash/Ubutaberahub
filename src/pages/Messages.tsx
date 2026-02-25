import { motion } from "framer-motion";
import { Search, Send, Paperclip, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useState } from "react";

interface MessagesProps {
  lang?: string;
}

const translations = {
  en: {
    title: "Messages",
    subtitle: "Communicate with lawyers and court officials",
    search: "Search messages...",
    typeMessage: "Type a message...",
    send: "Send",
    online: "Online",
    offline: "Offline"
  },
  rw: {
    title: "Ubutumwa",
    subtitle: "Vugana n'abanyamategeko n'abakozi b'urukiko",
    search: "Shakisha ubutumwa...",
    typeMessage: "Andika ubutumwa...",
    send: "Ohereza",
    online: "Kuri interineti",
    offline: "Ntakuri interineti"
  },
  fr: {
    title: "Messages",
    subtitle: "Communiquer avec les avocats et les fonctionnaires",
    search: "Rechercher des messages...",
    typeMessage: "Tapez un message...",
    send: "Envoyer",
    online: "En ligne",
    offline: "Hors ligne"
  }
};

const Messages = ({ lang = "en" }: MessagesProps) => {
  const t = translations[lang as keyof typeof translations] || translations.en;
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;
  const [selectedChat, setSelectedChat] = useState(0);

  const conversations = [
    {
      id: 1,
      name: "Me. Jean Habimana",
      role: "Lawyer",
      lastMessage: "I've reviewed your case documents...",
      time: "2h ago",
      unread: 2,
      online: true,
      avatar: "/avatar/avatar.png"
    },
    {
      id: 2,
      name: "Court Clerk - Kigali",
      role: "Court Official",
      lastMessage: "Your hearing is scheduled for...",
      time: "5h ago",
      unread: 0,
      online: false,
      avatar: "/avatar/avatar.png"
    },
    {
      id: 3,
      name: "Me. Marie Uwimana",
      role: "Lawyer",
      lastMessage: "Thank you for the information",
      time: "1d ago",
      unread: 0,
      online: true,
      avatar: "/avatar/avatar.png"
    }
  ];

  const messages = [
    {
      id: 1,
      sender: "Me. Jean Habimana",
      content: "Good morning! I've reviewed your case documents and everything looks in order.",
      time: "10:30 AM",
      isOwn: false
    },
    {
      id: 2,
      sender: "You",
      content: "Thank you! When can we schedule a meeting to discuss the next steps?",
      time: "10:35 AM",
      isOwn: true
    },
    {
      id: 3,
      sender: "Me. Jean Habimana",
      content: "How about tomorrow at 2 PM? We can meet at my office or have a video call.",
      time: "10:40 AM",
      isOwn: false
    }
  ];

  return (
    <DashboardLayout role="citizen" userName={user?.name || "User"} lang={lang}>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-slate-900">{t.title}</h1>
          <p className="text-muted-foreground mt-1">{t.subtitle}</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder={t.search}
                  className="pl-10 bg-slate-50 border-slate-200"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conv, index) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedChat(index)}
                  className={`p-4 border-b cursor-pointer hover:bg-slate-50 transition-colors ${
                    selectedChat === index ? "bg-slate-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <img
                        src={conv.avatar}
                        alt={conv.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {conv.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm text-slate-900 truncate">
                          {conv.name}
                        </h4>
                        <span className="text-xs text-slate-500">{conv.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-1">{conv.role}</p>
                      <p className="text-sm text-slate-600 truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unread > 0 && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">{conv.unread}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={conversations[selectedChat].avatar}
                    alt={conversations[selectedChat].name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {conversations[selectedChat].online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {conversations[selectedChat].name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {conversations[selectedChat].online ? t.online : t.offline}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.isOwn
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-900"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.isOwn ? "text-blue-100" : "text-slate-500"
                      }`}
                    >
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex items-end gap-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="w-5 h-5" />
                </Button>
                <Textarea
                  placeholder={t.typeMessage}
                  className="min-h-[44px] max-h-32 resize-none"
                  rows={1}
                />
                <Button size="icon" className="bg-blue-600 hover:bg-blue-700">
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
