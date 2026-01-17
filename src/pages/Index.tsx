import { useState } from "react";
import { Header } from "@/components/Dashboard/Header";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { RolesSection } from "@/components/sections/RolesSection";
import { AIAssistantSection } from "@/components/sections/AIAssistantSection";
import { CTASection } from "@/components/sections/CTASection";
import { FooterSection } from "@/components/sections/FooterSection";

const Index = () => {
  const [currentLang, setCurrentLang] = useState("en");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header currentLang={currentLang} onLanguageChange={setCurrentLang} />

      {/* Main content */}
      <main>
        <HeroSection lang={currentLang} />
        <FeaturesSection />
        <HowItWorksSection />
        <RolesSection />
        <AIAssistantSection lang={currentLang} />
        <CTASection />
      </main>

      {/* Footer */}
      <FooterSection />
    </div>
  );
};

export default Index;
