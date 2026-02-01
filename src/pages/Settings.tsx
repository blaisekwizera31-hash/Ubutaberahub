import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  User,
  Globe,
  Moon,
  Smartphone,
  Key,
  Shield,
  UserCircle,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";

const translations = {
  en: {
    title: "Settings",
    profile: "Profile",
    fullName: "Full Name",
    email: "Email",
    phone: "Phone Number",
    id: "National ID",
    save: "Save Changes",
    changePhoto: "Change Photo",
    prefs: "Preferences",
    lang: "Language",
    langDesc: "Select your preferred language",
    dark: "Dark Mode",
    darkDesc: "Toggle dark theme",
    sms: "SMS Notifications",
    smsDesc: "Receive updates via SMS",
    security: "Security",
    pass: "Change Password",
    passDesc: "Update your password",
    change: "Change",
    twoFactor: "Two-Factor Authentication",
    twoFactorDesc: "Add extra security to your account",
    danger: "Danger Zone",
    dangerDesc: "Once you delete your account, there is no going back.",
    delete: "Delete Account",
    toastSuccess: "Changes saved successfully!"
  },
  rw: {
    title: "Igenamiterere",
    profile: "Umwirondoro",
    fullName: "Amazina yose",
    email: "Imeri",
    phone: "Numero ya telefone",
    id: "Indangamuntu",
    save: "Bika impinduka",
    changePhoto: "Guhindura ifoto",
    prefs: "Ibyo nkurikiza",
    lang: "Ururimi",
    langDesc: "Hitamo ururimi ukoresha",
    dark: "Uburyo bw'ijoro",
    darkDesc: "Guhindura amabara y'isura",
    sms: "Ubutumwa bugufi",
    smsDesc: "Bakumenyesha amakuru kuri SMS",
    security: "Umutekano",
    pass: "Guhindura ijambo ry'ibanga",
    passDesc: "Vugurura ijambo ry'ibanga",
    change: "Hindura",
    twoFactor: "Kwemeza kabiri",
    twoFactorDesc: "Ongerera umutekano konti yawe",
    danger: "Ahaboneka ibibazo",
    dangerDesc: "Iyo usibye konti yawe, ntubasha kuyigarura.",
    delete: "Siba Konti",
    toastSuccess: "Impinduka zabitswe neza!"
  },
  fr: {
    title: "Paramètres",
    profile: "Profil",
    fullName: "Nom Complet",
    email: "E-mail",
    phone: "Numéro de téléphone",
    id: "Carte d'identité",
    save: "Enregistrer",
    changePhoto: "Changer la photo",
    prefs: "Préférences",
    lang: "Langue",
    langDesc: "Choisissez votre langue préférée",
    dark: "Mode sombre",
    darkDesc: "Basculer le thème sombre",
    sms: "Notifications SMS",
    smsDesc: "Recevoir des mises à jour par SMS",
    security: "Sécurité",
    pass: "Changer le mot de passe",
    passDesc: "Mettez à jour votre mot de passe",
    change: "Modifier",
    twoFactor: "Authentification à deux facteurs",
    twoFactorDesc: "Sécurisez davantage votre compte",
    danger: "Zone de danger",
    dangerDesc: "Une fois supprimé, vous ne pouvez plus revenir en arrière.",
    delete: "Supprimer le compte",
    toastSuccess: "Modifications enregistrées!"
  }
};

const Settings = () => {
  // 1. STATE MANAGEMENT
  const [currentLang, setCurrentLang] = useState<string>(localStorage.getItem("appLang") || "en");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = translations[currentLang as keyof typeof translations] || translations.en;
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : { name: "User" };

  // 2. HANDLERS
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setCurrentLang(newLang);
    localStorage.setItem("appLang", newLang);
    // Note: In a real app, you might trigger a page refresh or use a Context provider here
  };

  const handleDarkModeToggle = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    alert(t.toastSuccess);
  };

  return (
    <DashboardLayout 
      role="citizen" 
      userName={user?.name || "User"} 
      lang={currentLang}
    >
      <div className="max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold">{t.title}</h1>

        {/* Profile Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <UserCircle className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">{t.profile}</h2>
          </div>
          
          <div className="flex items-center gap-6 mb-6">
            <div 
              className="relative w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border group cursor-pointer"
              onClick={handlePhotoClick}
            >
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-muted-foreground" />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
            
            <Button variant="outline" onClick={handlePhotoClick}>
              {t.changePhoto}
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t.fullName}</label>
              <Input defaultValue={user.name} placeholder="John Doe" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t.email}</label>
              <Input defaultValue="user@example.com" type="email" placeholder="email@example.com" />
            </div>
          </div>
          <Button className="mt-4" onClick={handleSave}>
            {t.save}
          </Button>
        </motion.div>

        {/* Preferences */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">{t.prefs}</h2>
          </div>
          
          <div className="space-y-4">
            {/* Language Switcher */}
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium text-sm">{t.lang}</p>
                <p className="text-xs text-muted-foreground">{t.langDesc}</p>
              </div>
              <select 
                value={currentLang}
                onChange={handleLanguageChange}
                className="bg-muted rounded-lg px-3 py-2 text-sm border-none focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="rw">Kinyarwanda</option>
              </select>
            </div>

            {/* Dark Mode Switcher */}
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-sm">{t.dark}</p>
                <p className="text-xs text-muted-foreground">{t.darkDesc}</p>
              </div>
              <Switch 
                checked={isDarkMode} 
                onCheckedChange={handleDarkModeToggle} 
              />
            </div>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-destructive/5 rounded-2xl border border-destructive/20 p-6">
          <h2 className="text-lg font-semibold text-destructive mb-2">{t.danger}</h2>
          <p className="text-sm text-muted-foreground mb-4">{t.dangerDesc}</p>
          <Button variant="destructive" onClick={() => confirm("Are you sure?")}>
            {t.delete}
          </Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;