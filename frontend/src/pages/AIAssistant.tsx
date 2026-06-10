import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, Bot, User, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { chatWithAI, ChatMessage } from "@/services/ai/gemini";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVoiceInput } from "@/hooks/use-voice-input";

const translations = {
  en: {
    title: "AI Legal Assistant",
    subtitle: "Ask questions in Kinyarwanda, English, or French",
    placeholder: "Type your legal question...",
    voiceLabel: "Voice input",
    disclaimer: "AI provides guidance only, not legal advice. Consult an attorney for specific cases.",
    error: "Failed to get response. Please try again.",
    welcome: "Hello! I'm your AI legal assistant. I can help you understand your legal rights and options in Rwanda. How can I assist you today?",
  },
  rw: {
    title: "Umufasha w'Amategeko wa AI",
    subtitle: "Baza ibibazo mu Kinyarwanda, Icyongereza, cyangwa Igifaransa",
    placeholder: "Andika ikibazo cyawe...",
    voiceLabel: "Ijwi",
    disclaimer: "AI itanga ubuyobozi gusa, ntabwo ari inama z'amategeko. Baza umwunganizi w'amategeko.",
    error: "Ntibyakunze. Ongera ugerageze.",
    welcome: "Muraho! Ndi umufasha wawe w'amategeko wa AI. Nshobora kugufasha gusobanukirwa uburenganzira bwawe n'amahitamo mu Rwanda. Nshobora kugufasha gute?",
  },
  fr: {
    title: "Assistant Juridique IA",
    subtitle: "Posez des questions en Kinyarwanda, anglais ou français",
    placeholder: "Tapez votre question juridique...",
    voiceLabel: "Entrée vocale",
    disclaimer: "L'IA fournit uniquement des conseils, pas d'avis juridique. Consultez un avocat.",
    error: "Échec de la réponse. Veuillez réessayer.",
    welcome: "Bonjour! Je suis votre assistant juridique IA. Je peux vous aider à comprendre vos droits et options juridiques au Rwanda. Comment puis-je vous aider aujourd'hui?",
  },
};

export default function AIAssistant() {
  const { language: lang, setLanguage: setLang } = useLanguage();
  const t = translations[lang];
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : { name: "User", role: "citizen" };
  const role = user?.role === "lawyer" ? "lawyer" : "citizen";
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: t.welcome }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isSupported, isListening, toggleListening, error: voiceError } = useVoiceInput(lang, (text) => {
    setInput((prev) => `${prev}${prev ? " " : ""}${text}`.trim());
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === "assistant") {
        return [{ role: "assistant", content: t.welcome }];
      }
      return prev;
    });
  }, [t.welcome]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await chatWithAI([...messages, userMessage], lang);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err: any) {
      const errorMessage = err?.message || t.error;
      setError(errorMessage);
      console.error('AI Chat Error:', err);
      
      // Remove the user message if there was an error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <DashboardLayout role={role} userName={user?.name || "User"} lang={lang}>
        <div className="flex min-h-[calc(100vh-8rem)] flex-col max-w-5xl mx-auto w-full">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-semibold">{t.title}</h1>
                <p className="text-sm text-muted-foreground">{t.subtitle}</p>
              </div>
            </div>
            
            {/* Language Selector */}
            <div className="flex gap-2 mt-4">
              {(['en', 'rw', 'fr'] as const).map((language) => (
                <Button
                  key={language}
                  variant={lang === language ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLang(language)}
                >
                  {language === 'en' ? 'English' : language === 'rw' ? 'Kinyarwanda' : 'Français'}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Chat Container */}
          <div className="flex-1 bg-card rounded-2xl shadow-elevated border border-border/50 flex flex-col overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-primary-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                </motion.div>
              )}
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {voiceError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{voiceError}</AlertDescription>
                </Alert>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-border/50 p-4 bg-muted/30">
              <div className="flex gap-2">
                <Button
                  onClick={toggleListening}
                  variant={isListening ? "destructive" : "outline"}
                  size="icon"
                  disabled={!isSupported || isLoading}
                  title={t.voiceLabel}
                >
                  <Mic className={`h-4 w-4 ${isListening ? "animate-pulse" : ""}`} />
                </Button>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t.placeholder}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {t.disclaimer}
              </p>
            </div>
          </div>
        </div>
    </DashboardLayout>
  );
}
