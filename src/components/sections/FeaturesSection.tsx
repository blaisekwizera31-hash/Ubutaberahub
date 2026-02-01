import { motion } from "framer-motion";
import { 
  MessageSquare, 
  Shield, 
  Clock, 
  FileText, 
  Users, 
  Mic,
  Globe,
  Lock
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "AI Legal Assistant",
    description: "Get instant guidance on legal matters in your preferred language with our intelligent assistant.",
    color: "bg-accent",
  },
  {
    icon: Mic,
    title: "Voice Input",
    description: "Speak naturally in Kinyarwanda, English, or French to describe your legal questions.",
    color: "bg-secondary",
  },
  {
    icon: Globe,
    title: "Multilingual Support",
    description: "Full support for Kinyarwanda, English, and French across all platform features.",
    color: "bg-primary",
  },
  {
    icon: FileText,
    title: "Case Management",
    description: "Submit, track, and manage your legal cases with complete transparency.",
    color: "bg-accent",
  },
  {
    icon: Users,
    title: "Lawyer Directory",
    description: "Find and connect with qualified lawyers based on expertise and availability.",
    color: "bg-secondary",
  },
  {
    icon: Clock,
    title: "Hearing Scheduling",
    description: "Book consultations and receive hearing notifications automatically.",
    color: "bg-primary",
  },
  {
    icon: Lock,
    title: "Secure Communication",
    description: "End-to-end encrypted messaging between all parties involved.",
    color: "bg-accent",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your data is protected with enterprise-grade security and compliance.",
    color: "bg-secondary",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 bg-muted/30" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">Features</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold mt-2 mb-4">
            Everything You Need for Legal Access
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A comprehensive platform designed to bridge the gap between citizens and the justice system.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-card rounded-2xl p-6 h-full shadow-soft hover:shadow-elevated transition-all duration-300 border border-border/50 hover:border-accent/30">
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
