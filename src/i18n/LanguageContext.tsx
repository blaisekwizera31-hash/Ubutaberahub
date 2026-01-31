// import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
// import { Language, translations } from "./translations";
// import { supabase } from "@/integrations/supabase/client";

// interface LanguageContextType {
//   language: Language;
//   setLanguage: (lang: Language) => void;
// }

// const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// const LANGUAGE_STORAGE_KEY = "ubutaberahub_language";

// export function LanguageProvider({ children }: { children: ReactNode }) {
//   const [language, setLanguageState] = useState<Language>(() => {
//     // Try to get from localStorage first
//     if (typeof window !== "undefined") {
//       const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
//       if (stored && (stored === "en" || stored === "fr" || stored === "rw")) {
//         return stored as Language;
//       }
//     }
//     return "en";
//   });

//   // Save to localStorage when language changes
//   const setLanguage = async (lang: Language) => {
//     setLanguageState(lang);
//     localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);

//     // Try to update database if user is logged in
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (user) {
//         await supabase
//           .from("profiles")
//           .update({ language_pref: lang })
//           .eq("id", user.id);
//       }
//     } catch (error) {
//       // Silently fail - localStorage will still work
//       console.log("Could not update language preference in database");
//     }
//   };

//   // Sync with database on mount if user is logged in
//   useEffect(() => {
//     const syncLanguageFromDatabase = async () => {
//       try {
//         const { data: { user } } = await supabase.auth.getUser();
//         if (user) {
//           const { data: profile } = await supabase
//             .from("profiles")
//             .select("language_pref")
//             .eq("id", user.id)
//             .single();
          
//           if (profile?.language_pref) {
//             setLanguageState(profile.language_pref as Language);
//             localStorage.setItem(LANGUAGE_STORAGE_KEY, profile.language_pref);
//           }
//         }
//       } catch (error) {
//         // Use localStorage value
//       }
//     };

//     syncLanguageFromDatabase();

//     // Listen for auth changes
//     const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
//       if (event === "SIGNED_IN" && session?.user) {
//         syncLanguageFromDatabase();
//       }
//     });

//     return () => subscription.unsubscribe();
//   }, []);

//   return (
//     <LanguageContext.Provider value={{ language, setLanguage }}>
//       {children}
//     </LanguageContext.Provider>
//   );
// }

// export function useLanguage() {
//   const context = useContext(LanguageContext);
//   if (context === undefined) {
//     throw new Error("useLanguage must be used within a LanguageProvider");
//   }
//   return context;
// }

// // Helper hook to get translations for a specific section
// export function useTranslation<K extends keyof typeof translations>(section: K) {
//   const { language } = useLanguage();
//   return translations[section][language] as (typeof translations)[K][Language];
// }

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Language, translations } from "./translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = "ubutaberahub_language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored && (stored === "en" || stored === "fr" || stored === "rw")) {
        return stored as Language;
      }
    }
    return "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

// Helper hook to get translations for a specific section
export function useTranslation<K extends keyof typeof translations>(section: K) {
  const { language } = useLanguage();
  return translations[section][language] as (typeof translations)[K][Language];
}
