import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const sampleConversation = [
  {
    role: "user",
    content: "What are my rights if I'm arrested?",
  },
  {
    role: "assistant",
    content: "In Rwanda, if you are arrested, you have several fundamental rights protected by the Constitution:\n\n1. **Right to be informed** - You must be told the reasons for your arrest immediately.\n\n2. **Right to remain silent** - You cannot be forced to make statements that may be used against you.\n\n3. **Right to legal counsel** - You can request a lawyer, and if you cannot afford one, the state may provide one.\n\n4. **Right to humane treatment** - You must be treated with dignity and cannot be subjected to torture.\n\nWould you like more details about any of these rights?",
  },
];

const translations = {
  en: {
    title: "AI Legal Assistant",
    subtitle: "Ask questions in Kinyarwanda, English, or French",
    placeholder: "Type your legal question...",
    voiceLabel: "Voice input",
    disclaimer: "AI provides guidance only, not legal advice. Consult a lawyer for specific cases.",
  },
  rw: {
    title: "Umufasha w'Amategeko wa AI",
    subtitle: "Baza ibibazo mu Kinyarwanda, Icyongereza, cyangwa Igifaransa",
    placeholder: "Andika ikibazo cyawe...",
    voiceLabel: "Ijwi",
    disclaimer: "AI itanga ubuyobozi gusa, ntabwo ari inama z'amategeko. Baza umwunganizi w'amategeko.",
  },
  fr: {
    title: "Assistant Juridique IA",
    subtitle: "Posez des questions en Kinyarwanda, anglais ou français",
    placeholder: "Tapez votre question juridique...",
    voiceLabel: "Entrée vocale",
    disclaimer: "L'IA fournit uniquement des conseils, pas d'avis juridique. Consultez un avocat.",
  },
};

interface AIAssistantSectionProps {
  lang: string;
}

export function AIAssistantSection({ lang }: AIAssistantSectionProps) {
  const t = translations[lang as keyof typeof translations] || translations.en;
  const [messages, setMessages] = useState(sampleConversation);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Thank you for your question. I'm here to help you understand your legal rights and options. This is a demonstration of the AI assistant. In the full version, I would provide detailed, accurate legal guidance based on Rwandan law."
      }]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <section id="ai-assistant" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-muted/30" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">AI-Powered</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold mt-2 mb-4">
            {t.title}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-card rounded-2xl shadow-elevated border border-border/50 overflow-hidden">
            {/* Chat Header */}
            <div className="gradient-hero p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Legal Assistant</h3>
                <p className="text-white/70 text-sm">Online • Ready to help</p>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === "user" ? "bg-accent" : "bg-secondary"
                    }`}>
                      {message.role === "user" ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={`max-w-[80%] rounded-2xl p-4 ${
                      message.role === "user" 
                        ? "bg-accent text-white rounded-tr-sm" 
                        : "bg-muted rounded-tl-sm"
                    }`}>
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm p-4">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border/50">
              <div className="flex gap-2">
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  size="icon"
                  onClick={() => setIsRecording(!isRecording)}
                  className="flex-shrink-0"
                >
                  <Mic className={`w-5 h-5 ${isRecording ? "animate-pulse" : ""}`} />
                </Button>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t.placeholder}
                  className="flex-1"
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <Button onClick={handleSend} disabled={!input.trim() || isLoading}>
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                {t.disclaimer}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
