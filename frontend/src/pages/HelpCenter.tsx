import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, HelpCircle, MessageCircle, Phone, Mail, Send, FileText, Mic } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { chatWithAI } from "@/services/ai/gemini";
import { useVoiceInput } from "@/hooks/use-voice-input";

const translations = {
  en: {
    title: "Help Center",
    subtitle: "Search answers or ask your own question.",
    searchPlaceholder: "Search help topics...",
    askTitle: "Ask a Question",
    askPlaceholder: "Type your question here...",
    askButton: "Get Answer",
    faqTitle: "Main Questions",
    noFaq: "No matching help topics found.",
    answerTitle: "Answer",
    quickPrompt: "Try asking:",
    noAnswer: "Ask a question to get started.",
    contacts: {
      chat: "AI Assistant",
      email: "Email Support",
      phone: "Call Support",
    },
  },
  rw: {
    title: "Ikigo cy'Ubufasha",
    subtitle: "Shaka ibisubizo cyangwa ubaze ikibazo cyawe.",
    searchPlaceholder: "Shaka ubutabazi...",
    askTitle: "Baza Ikibazo",
    askPlaceholder: "Andika ikibazo cyawe hano...",
    askButton: "Habwa Igisubizo",
    faqTitle: "Ibibazo By'ingenzi",
    noFaq: "Nta bisubizo bihuye byabonetse.",
    answerTitle: "Igisubizo",
    quickPrompt: "Gerageza kubaza:",
    noAnswer: "Baza ikibazo kugira ngo utangire.",
    contacts: {
      chat: "Umufasha wa AI",
      email: "Ubufasha kuri Email",
      phone: "Hamagara Ubufasha",
    },
  },
  fr: {
    title: "Centre d'aide",
    subtitle: "Recherchez des reponses ou posez votre question.",
    searchPlaceholder: "Rechercher un sujet...",
    askTitle: "Poser une question",
    askPlaceholder: "Tapez votre question ici...",
    askButton: "Obtenir la reponse",
    faqTitle: "Questions principales",
    noFaq: "Aucun sujet correspondant trouve.",
    answerTitle: "Reponse",
    quickPrompt: "Essayez de demander :",
    noAnswer: "Posez une question pour commencer.",
    contacts: {
      chat: "Assistant IA",
      email: "Support email",
      phone: "Support telephonique",
    },
  },
};

const FAQS = [
  {
    id: "file-case",
    q: "How do I submit a case to a lawyer?",
    a: "Go to Find Lawyer, choose a registered lawyer, then open Submit Case. Fill title, type, priority, and description, then submit. Your case and first message are sent to that lawyer.",
  },
  {
    id: "messages",
    q: "How can I communicate with my lawyer?",
    a: "Open Messages. You can chat directly with your assigned lawyer in the case conversation created after submission.",
  },
  {
    id: "my-cases",
    q: "Why don't I see my case in My Cases?",
    a: "My Cases only shows cases where your account is a participant. Make sure you submitted while logged in with the same account.",
  },
  {
    id: "lawyer-visibility",
    q: "Why can't I find some lawyers?",
    a: "Only registered and approved lawyers appear in the directory. If a lawyer profile is incomplete or unverified, it is hidden.",
  },
  {
    id: "reset-password",
    q: "How do I reset my password?",
    a: "Use the Forgot Password flow on the Auth page. Enter your email, verify the code, then set a new password.",
  },
  {
    id: "appointments",
    q: "How do appointments work?",
    a: "Appointments display real records from your account. You can book by selecting a registered lawyer and submitting a case.",
  },
];

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/gi, " ").replace(/\s+/g, " ").trim();
}

const HelpCenter = () => {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;
  const role = user?.role || "citizen";

  const [searchQuery, setSearchQuery] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const voiceLang = (language === "rw" || language === "fr" ? language : "en") as "en" | "rw" | "fr";
  const { isSupported, isListening, toggleListening } = useVoiceInput(voiceLang, (text) => {
    setQuestion((prev) => `${prev}${prev ? " " : ""}${text}`.trim());
  });

  const visibleFaqs = useMemo(() => {
    const q = normalize(searchQuery);
    if (!q) return FAQS;
    return FAQS.filter((item) => normalize(`${item.q} ${item.a}`).includes(q));
  }, [searchQuery]);

  const findFaqAnswer = (input: string) => {
    const q = normalize(input);
    if (!q) return null;
    let best: { score: number; answer: string } = { score: 0, answer: "" };
    for (const item of FAQS) {
      const hay = normalize(`${item.q} ${item.a}`);
      let score = 0;
      for (const token of q.split(" ")) {
        if (token.length < 3) continue;
        if (hay.includes(token)) score += 1;
      }
      if (score > best.score) best = { score, answer: item.a };
    }
    return best.score >= 2 ? best.answer : null;
  };

  const handleAsk = async () => {
    const q = question.trim();
    if (!q) return;
    setIsLoading(true);
    try {
      const faqAnswer = findFaqAnswer(q);
      if (faqAnswer) {
        setAnswer(`Thank you for your question.\n\n${faqAnswer}`);
        return;
      }

      const ai = await chatWithAI(
        [
          {
            role: "user",
            content:
              `You are UbutaberaHub Help Center assistant. ` +
              `Answer politely, clearly, and practically. Keep it accurate to app usage and legal-service workflow. ` +
              `If uncertain, say what the user should check next. ` +
              `Question: ${q}`,
          },
        ],
        language === "rw" ? "rw" : language === "fr" ? "fr" : "en",
      );

      setAnswer(ai || "I could not generate an answer. Please try again.");
    } catch (e) {
      setAnswer("Sorry, I could not answer right now. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "How do I submit a case to a lawyer?",
    "How can I chat with my lawyer?",
    "Why is my case not visible in My Cases?",
  ];

  return (
    <DashboardLayout role={role} userName={user?.name || "User"} lang={language}>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </motion.div>

        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.searchPlaceholder} className="pl-12 py-6 text-base" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{t.faqTitle}</h2>
            <div className="space-y-3">
              {visibleFaqs.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setQuestion(item.q);
                    setAnswer(`Thank you for your question.\n\n${item.a}`);
                  }}
                  className="w-full text-left bg-card rounded-xl border border-border p-4 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-4 h-4 mt-1 text-primary" />
                    <div>
                      <p className="font-medium">{item.q}</p>
                      <p className="text-sm text-muted-foreground mt-1">{item.a}</p>
                    </div>
                  </div>
                </button>
              ))}
              {visibleFaqs.length === 0 && <div className="text-sm text-muted-foreground">{t.noFaq}</div>}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{t.askTitle}</h2>
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={t.askPlaceholder} rows={5} />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={isListening ? "destructive" : "outline"}
                  size="icon"
                  onClick={toggleListening}
                  disabled={!isSupported || isLoading}
                  title="Voice input"
                >
                  <Mic className={`w-4 h-4 ${isListening ? "animate-pulse" : ""}`} />
                </Button>
                <Button onClick={handleAsk} disabled={isLoading || !question.trim()} className="gap-2">
                  <Send className="w-4 h-4" />
                  {isLoading ? "..." : t.askButton}
                </Button>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">{t.quickPrompt}</div>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q) => (
                <Button key={q} variant="outline" size="sm" onClick={() => setQuestion(q)}>
                  {q}
                </Button>
              ))}
            </div>

            <div className="bg-card rounded-xl border border-border p-4 min-h-40">
              <h3 className="font-semibold mb-2">{t.answerTitle}</h3>
              <p className="text-sm whitespace-pre-wrap text-foreground">{answer || t.noAnswer}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/ai-assistant" className="bg-card rounded-xl border border-border p-4 hover:bg-muted/40 transition-colors">
            <div className="flex items-center gap-2 font-medium">
              <MessageCircle className="w-4 h-4 text-primary" />
              {t.contacts.chat}
            </div>
          </a>
          <a href="mailto:support@ubutaberahub.rw" className="bg-card rounded-xl border border-border p-4 hover:bg-muted/40 transition-colors">
            <div className="flex items-center gap-2 font-medium">
              <Mail className="w-4 h-4 text-primary" />
              {t.contacts.email}
            </div>
          </a>
          <a href="tel:+250700000000" className="bg-card rounded-xl border border-border p-4 hover:bg-muted/40 transition-colors">
            <div className="flex items-center gap-2 font-medium">
              <Phone className="w-4 h-4 text-primary" />
              {t.contacts.phone}
            </div>
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HelpCenter;
