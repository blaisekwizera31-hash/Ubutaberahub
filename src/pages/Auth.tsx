import React, { useState } from "react";
import { motion } from "framer-motion";
import { Scale, Mail, Lock, User, Eye, EyeOff, ArrowLeft, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";

const translations = {
  en: {
    welcomeTitle: "Welcome to Rwanda's Digital Justice Platform",
    welcomeSub: "Access legal guidance, connect with professionals, and navigate the justice system with confidence.",
    backHome: "Back to Home",
    signIn: "Sign In",
    createAccount: "Create Account",
    fullName: "Full Name",
    namePlaceholder: "Enter your full name",
    phone: "Phone Number",
    selectRole: "Select Your Role",
    email: "Email Address",
    password: "Password",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    signupLink: "Sign up",
    loginLink: "Sign in",
    roles: {
      citizen: { label: "Citizen", desc: "Submit cases, find lawyers" },
      lawyer: { label: "Lawyer", desc: "Manage clients & cases" },
      clerk: { label: "Court Clerk", desc: "Process court documents" },
      judge: { label: "Judge", desc: "Review & decide cases" },
    },
    fields: {
      license: "Lawyer License Number",
      specialization: "Specialization",
      lawFirm: "Law Firm",
      empId: "Employee ID",
      court: "Court Assigned",
      judgeId: "Judge ID",
      experience: "Years of Experience"
    },
    alerts: {
      fillAll: "Please fill in all required fields.",
      noAccount: "No account found. Please sign up.",
      invalid: "Invalid credentials."
    }
  },
  rw: {
    welcomeTitle: "Ikaze ku rubuga rw'ubutabera bw'u Rwanda",
    welcomeSub: "Gera ku bumenyi bw'amategeko, hura n'inzobere, kandi ukurikirane ibibazo byawe mu butabera ufite icyizere.",
    backHome: "Subira Ahabanza",
    signIn: "Injira",
    createAccount: "Fungura Konti",
    fullName: "Amazina Yose",
    namePlaceholder: "Andika amazina yawe yose",
    phone: "Numero ya Telefone",
    selectRole: "Hitamo Inshingano",
    email: "Imeri",
    password: "Ijambo ry'ibanga",
    noAccount: "Ntabwo ufite konti?",
    hasAccount: "Ufite konti?",
    signupLink: "Iyongereye",
    loginLink: "Injira",
    roles: {
      citizen: { label: "Umuturage", desc: "Ohereza ibibazo, shaka abanyamategeko" },
      lawyer: { label: "Umunyamategeko", desc: "Cunga abakiriya n'amadosiye" },
      clerk: { label: "Umwanditsi w'urukiko", desc: "Tunganya inyandiko z'urukiko" },
      judge: { label: "Umucamanza", desc: "Suzuma imanza ufate n'imyanzuro" },
    },
    fields: {
      license: "Numero y'Uruhushya",
      specialization: "Inzobere mu",
      lawFirm: "Ibiro by'abanyamategeko",
      empId: "ID y'Umukozi",
      court: "Urukiko ukoreramo",
      judgeId: "ID y'Umucamanza",
      experience: "Imyaka y'uburambe"
    },
    alerts: {
      fillAll: "Nyamuneka uzuza imyanya yose isabwa.",
      noAccount: "Konti ntiyabonetse. Nyamuneka fungura imshya.",
      invalid: "Ibiranga konti ntabwo ari byo."
    }
  },
  fr: {
    welcomeTitle: "Bienvenue sur la plateforme de justice numérique du Rwanda",
    welcomeSub: "Accédez à des conseils juridiques, connectez-vous avec des professionnels et naviguez dans le système judiciaire en toute confiance.",
    backHome: "Retour à l'accueil",
    signIn: "Se connecter",
    createAccount: "Créer un compte",
    fullName: "Nom Complet",
    namePlaceholder: "Entrez votre nom complet",
    phone: "Numéro de téléphone",
    selectRole: "Sélectionnez votre rôle",
    email: "Adresse e-mail",
    password: "Mot de passe",
    noAccount: "Vous n'avez pas de compte ?",
    hasAccount: "Vous avez déjà un compte ?",
    signupLink: "S'inscrire",
    loginLink: "Se connecter",
    roles: {
      citizen: { label: "Citoyen", desc: "Soumettre des cas, trouver des avocats" },
      lawyer: { label: "Avocat", desc: "Gérer les clients et les dossiers" },
      clerk: { label: "Greffier", desc: "Traiter les documents judiciaires" },
      judge: { label: "Juge", desc: "Réviser et trancher les affaires" },
    },
    fields: {
      license: "Numéro de licence d'avocat",
      specialization: "Spécialisation",
      lawFirm: "Cabinet d'avocats",
      empId: "ID de l'employé",
      court: "Tribunal assigné",
      judgeId: "ID du juge",
      experience: "Années d'expérience"
    },
    alerts: {
      fillAll: "Veuillez remplir tous les champs obligatoires.",
      noAccount: "Aucun compte trouvé. Veuillez vous inscrire.",
      invalid: "Identifiants invalides."
    }
  }
};

type AuthMode = "login" | "signup";

interface AuthProps {
  lang: string; // Required from App.tsx
}

const Auth = ({ lang }: AuthProps) => {
  const t = translations[lang as keyof typeof translations] || translations.en;
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("citizen");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const navigate = useNavigate();

  // Dynamic roles list based on current language
  const rolesList = [
    { id: "citizen", label: t.roles.citizen.label, desc: t.roles.citizen.desc },
    { id: "lawyer", label: t.roles.lawyer.label, desc: t.roles.lawyer.desc },
    { id: "clerk", label: t.roles.clerk.label, desc: t.roles.clerk.desc },
    { id: "judge", label: t.roles.judge.label, desc: t.roles.judge.desc },
  ];

  const dashboardRoutes: Record<string, string> = {
    citizen: "/dashboard",
    lawyer: "/lawyer-dashboard",
    judge: "/judge-dashboard",
    clerk: "/clerk-dashboard",
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      alert(t.alerts.fillAll);
      return;
    }
    const user = { name, email, password, role: selectedRole, phone };
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    navigate(dashboardRoutes[selectedRole]);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      alert(t.alerts.noAccount);
      return;
    }
    const user = JSON.parse(savedUser);
    if (user.email !== email || user.password !== password) {
      alert(t.alerts.invalid);
      return;
    }
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    navigate(dashboardRoutes[user.role]);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden">
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 gradient-gold rounded-xl flex items-center justify-center">
                <Scale className="w-6 h-6 text-primary" />
              </div>
              <span className="font-display text-2xl font-bold"> UBUTABERA<span className="text-accent">hub</span></span>
            </div>
            <h1 className="text-4xl font-display font-bold mb-4">{t.welcomeTitle}</h1>
            <p className="text-white/80 text-lg max-w-md">{t.welcomeSub}</p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" /> {t.backHome}
          </Link>

          <div className="flex gap-2 p-1 bg-muted rounded-xl mb-8">
            <button onClick={() => setMode("login")} className={`flex-1 py-2.5 rounded-lg text-sm font-medium ${mode === "login" ? "bg-card shadow-soft" : "text-muted-foreground"}`}>
              {t.signIn}
            </button>
            <button onClick={() => setMode("signup")} className={`flex-1 py-2.5 rounded-lg text-sm font-medium ${mode === "signup" ? "bg-card shadow-soft" : "text-muted-foreground"}`}>
              {t.createAccount}
            </button>
          </div>

          <form className="space-y-5" onSubmit={mode === "signup" ? handleSignup : handleLogin}>
            {mode === "signup" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">{t.fullName}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input id="name" placeholder={t.namePlaceholder} className="pl-10" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t.phone}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input id="phone" type="tel" className="pl-10" placeholder="+250 78..." value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>{t.selectRole}</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {rolesList.map((role) => (
                      <button key={role.id} type="button" onClick={() => setSelectedRole(role.id)} className={`p-3 rounded-xl border-2 text-left transition-all ${selectedRole === role.id ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"}`}>
                        <div className="font-medium text-sm">{role.label}</div>
                        <div className="text-xs text-muted-foreground">{role.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t.password}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button variant="hero" size="lg" className="w-full" type="submit">
              {mode === "login" ? t.signIn : t.createAccount}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === "login" ? t.noAccount : t.hasAccount}{" "}
            <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-accent hover:underline font-medium">
              {mode === "login" ? t.signupLink : t.loginLink}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;