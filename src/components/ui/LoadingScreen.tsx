import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// REMOVED: import Logo from "../../assets/logo.png"; 
// Because the file is now in the 'public' folder.

const LoadingScreen = () => {
  const [lang] = useState(localStorage.getItem("appLang") || "en");

  const loaderText: Record<string, string> = {
    en: "Loading your workspace...",
    rw: "Turimo gufungura...",
    fr: "Chargement de votre espace..."
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999]">
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [1, 0.9, 1],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative"
      >
        {/* Subtle glow behind the logo */}
        <div className="absolute inset-0 rounded-full bg-blue-50 blur-2xl opacity-40 scale-150" />
        
        <img
          src="/logo.png" // UPDATED: Points directly to public/logo.png
          alt="UBUTABERA Logo"
          className="w-40 h-40 object-contain relative drop-shadow-sm"
        />
      </motion.div>

      {/* Branding Text */}
      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 flex flex-col items-center gap-1"
      >
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          UBUTABERA<span className="text-blue-600">hub</span>
        </h1>
      </motion.div>

      {/* Modern Progress Bar */}
      <div className="mt-8 w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-blue-600"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ 
            duration: 1.8, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
      </div>

      {/* Language-Aware Subtext */}
      <AnimatePresence mode="wait">
        <motion.p
          key={lang}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="mt-6 text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]"
        >
          {loaderText[lang] || loaderText.en}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

export default LoadingScreen;