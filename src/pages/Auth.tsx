import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";

// Social provider icons as SVG components
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const MicrosoftIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path fill="#f25022" d="M1 1h10v10H1z"/>
    <path fill="#00a4ef" d="M13 1h10v10H13z"/>
    <path fill="#7fba00" d="M1 13h10v10H1z"/>
    <path fill="#ffb900" d="M13 13h10v10H13z"/>
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);

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
    orContinue: "Or continue with",
    continueGoogle: "Continue with Google",
    continueMicrosoft: "Continue with Microsoft",
    continueApple: "Continue with Apple",
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
    orContinue: "Cyangwa komeza ukoresheje",
    continueGoogle: "Komeza na Google",
    continueMicrosoft: "Komeza na Microsoft",
    continueApple: "Komeza na Apple",
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
    orContinue: "Ou continuer avec",
    continueGoogle: "Continuer avec Google",
    continueMicrosoft: "Continuer avec Microsoft",
    continueApple: "Continuer avec Apple",
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

  const handleSocialLogin = (provider: string) => {
    // Get the current origin for redirect URI
    const redirectUri = `${window.location.origin}/auth/callback`;
    
    // OAuth configuration for each provider
    const oauthUrls: Record<string, string> = {
      google: `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=YOUR_GOOGLE_CLIENT_ID&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=email profile&` +
        `access_type=offline&` +
        `prompt=select_account`,
      
      microsoft: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
        `client_id=YOUR_MICROSOFT_CLIENT_ID&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=openid email profile&` +
        `prompt=select_account`,
      
      apple: `https://appleid.apple.com/auth/authorize?` +
        `client_id=YOUR_APPLE_CLIENT_ID&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=name email&` +
        `response_mode=form_post`
    };

    // Store the selected role before redirecting
    localStorage.setItem('pendingRole', selectedRole);
    
    // Redirect to OAuth provider - this will show the account selection screen
    window.location.href = oauthUrls[provider];
    
    // Note: After OAuth, the provider will redirect back to /auth/callback
    // You'll need to create a callback handler that:
    // 1. Extracts the authorization code from URL
    // 2. Sends it to your backend
    // 3. Backend exchanges code for access token
    // 4. Backend fetches user info and creates/updates user
    // 5. Backend returns JWT or session token
    // 6. Frontend stores token and redirects to dashboard
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side: Hero Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
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
                      <Input value={citizenId} onChange={(e) => setCitizenId(e.target.value)} placeholder="1 XXXX X XXXXXXX X XX" required/>
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

                {selectedRole === "judge" && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <Label>{t.fields.judgeId}</Label>
                      <Input value={judgeId} onChange={(e) => setJudgeId(e.target.value)} placeholder="JDG-2024-001" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t.fields.experience}</Label>
                      <Input value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} placeholder="10" type="number" />
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

          {/* Social Login Options */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">{t.orContinue}</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin('google')}
                className="w-full hover:bg-slate-50"
              >
                <GoogleIcon />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin('microsoft')}
                className="w-full hover:bg-slate-50"
              >
                <MicrosoftIcon />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin('apple')}
                className="w-full hover:bg-slate-50"
              >
                <AppleIcon />
              </Button>
            </div>
          </div>

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