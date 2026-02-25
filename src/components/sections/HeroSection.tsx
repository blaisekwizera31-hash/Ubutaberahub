import { motion } from "framer-motion";
import { ArrowRight, MessageSquare, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const translations = {
  en: {
    badge: "AI-Powered Legal Access for Rwanda",
    title: "Justice Made",
    titleHighlight: "Accessible",
    subtitle: "Connect with legal professionals, understand your rights, and navigate the justice system with AI-powered assistance in Kinyarwanda, English, and French.",
    cta: "Start Your Journey",
    ctaSecondary: "Explore Features",
    stats: [
      { value: "24/7", label: "AI Assistance" },
      { value: "3", label: "Languages" },
      { value: "100%", label: "Confidential" },
    ],
  },
  rw: {
    badge: "Ubutabera Bukoresheje AI mu Rwanda",
    title: "Ubutabera",
    titleHighlight: "Bugezweho",
    subtitle: "Huza n'abanyamategeko, menya uburenganzira bwawe, kandi unyure mu buryo bw'ubutabera ukoresheje ubufasha bwa AI mu Kinyarwanda, Icyongereza, n'Igifaransa.",
    cta: "Tangira Urugendo Rwawe",
    ctaSecondary: "Reba Ibikorwa",
    stats: [
      { value: "24/7", label: "Ubufasha bwa AI" },
      { value: "3", label: "Indimi" },
      { value: "100%", label: "Ibanga" },
    ],
  },
  fr: {
    badge: "Accès Juridique Alimenté par l'IA pour le Rwanda",
    title: "La Justice Rendue",
    titleHighlight: "Accessible",
    subtitle: "Connectez-vous avec des professionnels du droit, comprenez vos droits et naviguez dans le système judiciaire avec l'assistance de l'IA en Kinyarwanda, anglais et français.",
    cta: "Commencez Votre Parcours",
    ctaSecondary: "Explorer les Fonctionnalités",
    stats: [
      { value: "24/7", label: "Assistance IA" },
      { value: "3", label: "Langues" },
      { value: "100%", label: "Confidentiel" },
    ],
  },
};

interface HeroSectionProps {
  lang: string;
}

export function HeroSection({ lang }: HeroSectionProps) {
  const t = translations[lang as keyof typeof translations] || translations.en;

  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
      {/* Clean Background */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Flowing Rwanda Flag Ribbon - Spans across both columns */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Blue Ribbon - Top flowing wave */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute top-[15%] left-0 right-0 h-32 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A1DE] via-[#00A1DE] to-transparent opacity-20"
               style={{
                 clipPath: 'polygon(0 20%, 100% 0%, 100% 80%, 0 100%)',
                 transform: 'skewY(-2deg)'
               }}
          />
          <div className="absolute inset-0 bg-[#00A1DE] opacity-10"
               style={{
                 clipPath: 'polygon(0 30%, 100% 10%, 100% 70%, 0 90%)',
                 transform: 'skewY(-1deg)'
               }}
          />
        </motion.div>

        {/* Yellow Ribbon - Middle flowing wave */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="absolute top-[40%] left-0 right-0 h-24 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FAD201] to-[#FAD201] opacity-15"
               style={{
                 clipPath: 'polygon(0 0%, 100% 20%, 100% 100%, 0 80%)',
                 transform: 'skewY(1deg)'
               }}
          />
          <div className="absolute inset-0 bg-[#FAD201] opacity-10"
               style={{
                 clipPath: 'polygon(0 10%, 100% 30%, 100% 90%, 0 70%)',
                 transform: 'skewY(0.5deg)'
               }}
          />
        </motion.div>

        {/* Green Ribbon - Bottom flowing wave */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="absolute top-[65%] left-0 right-0 h-32 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#20603D] via-[#20603D] to-transparent opacity-15"
               style={{
                 clipPath: 'polygon(0 20%, 100% 0%, 100% 80%, 0 100%)',
                 transform: 'skewY(-1.5deg)'
               }}
          />
          <div className="absolute inset-0 bg-[#20603D] opacity-10"
               style={{
                 clipPath: 'polygon(0 30%, 100% 10%, 100% 70%, 0 90%)',
                 transform: 'skewY(-0.5deg)'
               }}
          />
        </motion.div>

        {/* Subtle decorative elements */}
        <div className="absolute top-[20%] right-[10%] w-3 h-3 bg-[#00A1DE] rounded-full opacity-30" />
        <div className="absolute top-[22%] right-[15%] w-2 h-2 bg-[#00A1DE] rounded-full opacity-20" />
        <div className="absolute top-[45%] left-[20%] w-3 h-3 bg-[#FAD201] rounded-full opacity-30" />
        <div className="absolute top-[47%] left-[25%] w-2 h-2 bg-[#FAD201] rounded-full opacity-20" />
        <div className="absolute top-[70%] right-[30%] w-3 h-3 bg-[#20603D] rounded-full opacity-30" />
        <div className="absolute top-[72%] right-[35%] w-2 h-2 bg-[#20603D] rounded-full opacity-20" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Two Column Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm shadow-soft border border-border"
            >
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">{t.badge}</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight"
            >
              {t.title}{" "}
              <span className="text-primary">{t.titleHighlight}</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground"
            >
              {t.subtitle}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button variant="hero" size="xl" className="group" asChild>
                <Link to="/auth">
                  {t.cta}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="xl">
                {t.ctaSecondary}
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-3 gap-6 pt-8 border-t border-border"
            >
              {t.stats.map((stat, index) => (
                <div key={index}>
                  <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column - Lady Justice with Rwanda Flag Ribbon */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative h-[600px] hidden lg:flex items-center justify-center"
          >
            {/* Main Illustration Container */}
            <div className="relative w-full h-full flex items-center justify-center">
              
              {/* Circular Glow Background */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[450px] h-[450px] rounded-full bg-gradient-to-br from-[#00A1DE]/10 via-[#FAD201]/10 to-[#20603D]/10 blur-3xl" />
              </div>

              {/* Spiral Rwanda Flag Ribbon - Wrapping around center */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Top-right flowing ribbon - Blue */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                  className="absolute top-[5%] right-[5%] w-[280px] h-24"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00A1DE] to-[#00A1DE]/80 rounded-3xl shadow-2xl"
                       style={{
                         transform: 'rotateZ(25deg) rotateY(-15deg) rotateX(10deg)',
                         boxShadow: '0 25px 50px rgba(0, 161, 222, 0.4)'
                       }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-3xl" />
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-3xl" />
                  </div>
                </motion.div>

                {/* Middle-right flowing ribbon - Yellow with Sun */}
                <motion.div
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                  className="absolute top-[35%] right-[2%] w-[240px] h-20"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FAD201] to-[#FAD201]/80 rounded-3xl shadow-2xl flex items-center justify-end pr-6"
                       style={{
                         transform: 'rotateZ(15deg) rotateY(15deg) rotateX(-5deg)',
                         boxShadow: '0 25px 50px rgba(250, 210, 1, 0.4)'
                       }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-3xl" />
                    {/* Sun symbol */}
                    <div className="relative w-12 h-12 z-10">
                      <div className="absolute inset-0 bg-white/50 rounded-full" />
                      <div className="absolute inset-1 bg-white/60 rounded-full" />
                      <div className="absolute inset-2 bg-white/70 rounded-full animate-pulse" />
                      {/* Sun rays */}
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute top-1/2 left-1/2 w-1 h-3 bg-white/60 rounded-full"
                          style={{
                            transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-10px)`
                          }}
                        />
                      ))}
                    </div>
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-3xl" />
                  </div>
                </motion.div>

                {/* Bottom-left flowing ribbon - Green */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 1.2, delay: 0.7, ease: "easeOut" }}
                  className="absolute bottom-[8%] left-[8%] w-[260px] h-24"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#20603D] to-[#20603D]/80 rounded-3xl shadow-2xl"
                       style={{
                         transform: 'rotateZ(-20deg) rotateY(15deg) rotateX(-10deg)',
                         boxShadow: '0 25px 50px rgba(32, 96, 61, 0.4)'
                       }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-3xl" />
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-3xl" />
                  </div>
                </motion.div>

                {/* Top-left accent ribbon - Blue */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.9, ease: "easeOut" }}
                  className="absolute top-[15%] left-[10%] w-[180px] h-16"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00A1DE]/70 to-[#00A1DE]/50 rounded-2xl shadow-xl"
                       style={{
                         transform: 'rotateZ(-35deg) rotateY(-10deg)',
                         boxShadow: '0 15px 30px rgba(0, 161, 222, 0.3)'
                       }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
                  </div>
                </motion.div>

                {/* Bottom-right accent ribbon - Green */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 1.1, ease: "easeOut" }}
                  className="absolute bottom-[18%] right-[12%] w-[160px] h-14"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#20603D]/70 to-[#20603D]/50 rounded-2xl shadow-xl"
                       style={{
                         transform: 'rotateZ(30deg) rotateY(10deg)',
                         boxShadow: '0 15px 30px rgba(32, 96, 61, 0.3)'
                       }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
                  </div>
                </motion.div>
              </div>

              {/* Central Lady Justice Photo */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="relative z-10 flex items-center justify-center"
              >
                {/* Photo container with effects */}
                <div className="relative w-[350px] h-[500px] flex items-center justify-center">
                  {/* Glow effect behind photo */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#FAD201]/20 via-transparent to-transparent rounded-full blur-3xl scale-110" />
                  
                  {/* Lady Justice Photo */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src="/p.png"
                      alt="Lady Justice with Rwanda Flag"
                      className="w-full h-full object-contain"
                      style={{ 
                        filter: 'drop-shadow(0 30px 60px rgba(0, 0, 0, 0.5))',
                      }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Rwanda Sun Symbols - Floating around */}
              <motion.div
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute top-[10%] left-[8%] z-20"
              >
                <div className="relative w-20 h-20">
                  {/* Sun center */}
                  <div className="absolute inset-0 bg-[#FAD201] rounded-full shadow-2xl" />
                  <div className="absolute inset-2 bg-[#FFC107] rounded-full" />
                  <div className="absolute inset-4 bg-white/80 rounded-full animate-pulse" />
                  {/* Sun rays */}
                  {[...Array(24)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-1/2 left-1/2 w-1.5 h-6 bg-[#FAD201] rounded-full shadow-lg"
                      style={{
                        transform: `translate(-50%, -50%) rotate(${i * 15}deg) translateY(-16px)`,
                        opacity: i % 2 === 0 ? 1 : 0.6
                      }}
                    />
                  ))}
                </div>
              </motion.div>

              <motion.div
                animate={{ 
                  y: [0, 15, 0],
                  rotate: [0, -360],
                  scale: [1, 1.15, 1]
                }}
                transition={{ 
                  duration: 10, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute bottom-[15%] right-[8%] z-20"
              >
                <div className="relative w-16 h-16">
                  {/* Sun center */}
                  <div className="absolute inset-0 bg-[#FAD201] rounded-full shadow-2xl" />
                  <div className="absolute inset-2 bg-[#FFC107] rounded-full" />
                  <div className="absolute inset-3 bg-white/80 rounded-full animate-pulse" />
                  {/* Sun rays */}
                  {[...Array(24)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-1/2 left-1/2 w-1 h-5 bg-[#FAD201] rounded-full shadow-lg"
                      style={{
                        transform: `translate(-50%, -50%) rotate(${i * 15}deg) translateY(-13px)`,
                        opacity: i % 2 === 0 ? 1 : 0.6
                      }}
                    />
                  ))}
                </div>
              </motion.div>

              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 360],
                  scale: [1, 1.08, 1]
                }}
                transition={{ 
                  duration: 9, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 2
                }}
                className="absolute top-[50%] right-[5%] z-20"
              >
                <div className="relative w-14 h-14">
                  {/* Sun center */}
                  <div className="absolute inset-0 bg-[#FAD201] rounded-full shadow-2xl" />
                  <div className="absolute inset-2 bg-[#FFC107] rounded-full" />
                  <div className="absolute inset-3 bg-white/80 rounded-full animate-pulse" />
                  {/* Sun rays */}
                  {[...Array(24)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-1/2 left-1/2 w-1 h-4 bg-[#FAD201] rounded-full shadow-lg"
                      style={{
                        transform: `translate(-50%, -50%) rotate(${i * 15}deg) translateY(-11px)`,
                        opacity: i % 2 === 0 ? 1 : 0.6
                      }}
                    />
                  ))}
                </div>
              </motion.div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
