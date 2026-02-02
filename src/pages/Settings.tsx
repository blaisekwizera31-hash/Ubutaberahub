import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Globe,
  UserCircle,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";

// 1. DEFINE SHARED TYPES
type LanguageCode = 'en' | 'rw' | 'fr';
type Role = "citizen" | "lawyer" | "judge" | "clerk" | "client";

const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    title: "Settings",
    profile: "Profile",
    fullName: "Full Name",
    email: "Email",
    save: "Save Changes",
    changePhoto: "Change Photo",
    prefs: "Preferences",
    lang: "Language",
    langDesc: "Select your preferred language",
    dark: "Dark Mode",
    darkDesc: "Toggle dark theme",
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
    save: "Bika impinduka",
    changePhoto: "Guhindura ifoto",
    prefs: "Ibyo nkurikiza",
    lang: "Ururimi",
    langDesc: "Hitamo ururimi ukoresha",
    dark: "Uburyo bw'ijoro",
    darkDesc: "Guhindura amabara y'isura",
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
    save: "Enregistrer",
    changePhoto: "Changer la photo",
    prefs: "Préférences",
    lang: "Langue",
    langDesc: "Choisissez votre langue préférée",
    dark: "Mode sombre",
    darkDesc: "Basculer le thème sombre",
    danger: "Zone de danger",
    dangerDesc: "Une fois supprimé, vous ne pouvez plus revenir en arrière.",
    delete: "Supprimer le compte",
    toastSuccess: "Modifications enregistrées!"
  }
};

const Settings = () => {
  // 2. STATE & DATA MANAGEMENT
  const [currentLang, setCurrentLang] = useState<LanguageCode>(
    (localStorage.getItem("appLang") as LanguageCode) || "en"
  );
  
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse User and Role from storage
  const loggedInUser = localStorage.getItem("loggedInUser");
  const userData = loggedInUser ? JSON.parse(loggedInUser) : null;
  const userRole: Role = userData?.role || "citizen"; 
  const userName = userData?.name || "User";

  const t = translations[currentLang];

  // 3. HANDLERS
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as LanguageCode;
    setCurrentLang(newLang);
    localStorage.setItem("appLang", newLang);
    window.dispatchEvent(new Event("storage")); 
  };

  const handleDarkModeToggle = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <DashboardLayout 
      role={userRole} 
      userName={userName} 
      lang={currentLang}
    >
      <div className="max-w-3xl space-y-6">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="text-2xl font-bold"
        >
          {t.title}
        </motion.h1>

        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-card rounded-2xl border border-border p-6 shadow-sm"
        >
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
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <Button variant="outline" onClick={handlePhotoClick}>{t.changePhoto}</Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t.fullName}</label>
              <Input defaultValue={userName} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t.email}</label>
              <Input defaultValue={userData?.email || "user@example.com"} type="email" />
            </div>
          </div>
          <Button className="mt-6" onClick={() => alert(t.toastSuccess)}>{t.save}</Button>
        </motion.div>

        {/* Preferences Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }} 
          className="bg-card rounded-2xl border border-border p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">{t.prefs}</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium text-sm">{t.lang}</p>
                <p className="text-xs text-muted-foreground">{t.langDesc}</p>
              </div>
              <select 
                value={currentLang}
                onChange={handleLanguageChange}
                className="bg-muted rounded-lg px-3 py-2 text-sm border-none focus:ring-2 focus:ring-primary outline-none cursor-pointer"
              >
                <option value="en">English</option>
                <option value="rw">Kinyarwanda</option>
                <option value="fr">Français</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-sm">{t.dark}</p>
                <p className="text-xs text-muted-foreground">{t.darkDesc}</p>
              </div>
              <Switch checked={isDarkMode} onCheckedChange={handleDarkModeToggle} />
            </div>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }} 
          className="bg-destructive/5 rounded-2xl border border-destructive/20 p-6"
        >
          <h2 className="text-lg font-semibold text-destructive mb-2">{t.danger}</h2>
          <p className="text-sm text-muted-foreground mb-4">{t.dangerDesc}</p>
          <Button variant="destructive" onClick={() => confirm("Are you sure?")}>{t.delete}</Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;