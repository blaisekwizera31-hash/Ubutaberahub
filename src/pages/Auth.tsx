import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, Camera } from "lucide-react";
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
    uploadPhoto: "Upload Profile Photo",
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
      citizenId: "Citizen ID Number",
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
    uploadPhoto: "Shyiraho Ifoto yawe",
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
      citizenId: "Numero y'Indangamuntu",
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
    uploadPhoto: "Télécharger une photo de profil",
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
      citizenId: "Numéro d'identification du citoyen",
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
  lang?: string;
}

const Auth = ({ lang = "en" }: AuthProps) => {
  const t = translations[lang as keyof typeof translations] || translations.en;
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("citizen");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [citizenId, setCitizenId] = useState("");
  
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [licenseNumber, setLicenseNumber] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [lawFirm, setLawFirm] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [courtAssigned, setCourtAssigned] = useState("");
  const [judgeId, setJudgeId] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");

  const navigate = useNavigate();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const rolesList = [
    { id: "citizen", ...t.roles.citizen },
    { id: "lawyer", ...t.roles.lawyer },
    { id: "clerk", ...t.roles.clerk },
    { id: "judge", ...t.roles.judge },
  ];

  const dashboardRoutes: Record<string, string> = {
    citizen: "/dashboard",
    lawyer: "/lawyer-dashboard",
    judge: "/judge-dashboard",
    clerk: "/clerk-dashboard",
  };

  const handleSignup = () => {
    if (!email || !password || !name) {
      alert(t.alerts.fillAll);
      return;
    }
    const user = { 
      name, email, password, role: selectedRole, phone, profilePhoto,
      citizenId, licenseNumber, specialization, lawFirm, employeeId, courtAssigned, judgeId, yearsExperience 
    };
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
      {/* Left Side: Hero Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-8">
              {/* White Logo Container */}
              <div className="w-12 h-12 flex items-center justify-center">
                <img src="/logow.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-display text-2xl font-bold text-white">
                UBUTABERA<span className="text-accent">hub</span>
              </span>
            </div>
            <h1 className="text-4xl font-display font-bold mb-4">{t.welcomeTitle}</h1>
            <p className="text-white/80 text-lg max-w-md">{t.welcomeSub}</p>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {t.backHome}
          </Link>

          <div className="flex gap-2 p-1 bg-muted rounded-xl mb-8">
            <button onClick={() => setMode("login")} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${mode === "login" ? "bg-card shadow-soft text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {t.signIn}
            </button>
            <button onClick={() => setMode("signup")} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${mode === "signup" ? "bg-card shadow-soft text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {t.createAccount}
            </button>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            {mode === "signup" && (
              <>
                <div className="flex flex-col items-center gap-3 mb-4">
                  <Label>{t.uploadPhoto}</Label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-full bg-muted border-2 border-dashed border-accent/50 flex items-center justify-center cursor-pointer overflow-hidden relative group"
                  >
                    {profilePhoto ? (
                      <img src={profilePhoto} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-muted-foreground group-hover:text-accent transition-colors" />
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" accept="image/*" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">{t.fullName}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input id="name" placeholder={t.namePlaceholder} className="pl-10" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t.phone}</Label>
                  <Input id="phone" type="tel" placeholder="+250 78..." value={phone} onChange={(e) => setPhone(e.target.value)} />
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

                {selectedRole === "citizen" && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <Label>{t.fields.citizenId}</Label>
                      <Input value={citizenId} onChange={(e) => setCitizenId(e.target.value)} placeholder="1 XXXX X XXXXXXX X XX" />
                    </div>
                  </div>
                )}

                {selectedRole === "lawyer" && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <Label>{t.fields.license}</Label>
                      <Input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="RBA/000/2024" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t.fields.specialization}</Label>
                      <Input value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="Criminal Law..." />
                    </div>
                  </div>
                )}

                {selectedRole === "clerk" && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <Label>{t.fields.empId}</Label>
                      <Input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="CLK-2024-001" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t.fields.court}</Label>
                      <Input value={courtAssigned} onChange={(e) => setCourtAssigned(e.target.value)} placeholder="Kigali High Court..." />
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t.password}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button variant="hero" size="lg" className="w-full" onClick={mode === "signup" ? handleSignup : handleLogin}>
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