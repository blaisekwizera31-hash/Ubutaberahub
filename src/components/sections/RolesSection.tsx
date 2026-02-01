import { motion } from "framer-motion";
import { 
  User, 
  Scale, 
  Briefcase, 
  FileCheck, 
  BarChart3,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const roles = [
  {
    icon: User,
    title: "Citizens",
    description: "Submit legal issues, explore laws, find lawyers, and track your case progress.",
    features: ["Submit legal questions", "Find qualified lawyers", "Track case status", "Access legal resources"],
    color: "from-accent to-amber-400",
  },
  {
    icon: Briefcase,
    title: "Lawyers",
    description: "Manage consultations, upload evidence, and receive AI-generated case summaries.",
    features: ["Manage client cases", "AI case summaries", "Document management", "Consultation scheduling"],
    color: "from-secondary to-teal-400",
  },
  {
    icon: FileCheck,
    title: "Court Clerks",
    description: "Verify cases, schedule hearings, and manage court documentation efficiently.",
    features: ["Case verification", "Hearing scheduling", "Document processing", "Status updates"],
    color: "from-primary to-blue-500",
  },
  {
    icon: Scale,
    title: "Judges",
    description: "Review cases with AI assistance, access summaries, and manage proceedings.",
    features: ["Case review tools", "AI-powered insights", "Legal precedents", "Decision support"],
    color: "from-purple-500 to-violet-500",
  },
  {
    icon: BarChart3,
    title: "Administrators",
    description: "Monitor system analytics, manage users, and oversee platform operations.",
    features: ["Analytics dashboard", "User management", "System monitoring", "Audit trails"],
    color: "from-rose-500 to-pink-500",
  },
];

export function RolesSection() {
  return (
    <section id="roles" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">For Everyone</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold mt-2 mb-4">
            Designed for Every Role in Justice
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tailored dashboards and tools for citizens, legal professionals, and administrators.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role, index) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`${index === 0 ? 'md:col-span-2 lg:col-span-1' : ''}`}
            >
              <div className="bg-card rounded-2xl p-8 h-full shadow-soft border border-border/50 hover:shadow-elevated transition-all duration-300 group">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <role.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">{role.title}</h3>
                <p className="text-muted-foreground mb-6">{role.description}</p>
                <ul className="space-y-2 mb-6">
                  {role.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button variant="ghost" className="group/btn p-0 h-auto text-accent hover:text-accent">
                  Get Started <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
