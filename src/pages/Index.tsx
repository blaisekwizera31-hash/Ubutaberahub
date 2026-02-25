import { Header } from "@/components/Dashboard/Header";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { RolesSection } from "@/components/sections/RolesSection";
import { CTASection } from "@/components/sections/CTASection";
import { FooterSection } from "@/components/sections/FooterSection";

// 1. Define the interface for the props coming from App.tsx
interface IndexProps {
  currentLang: string;
  onLanguageChange: (lang: string) => void;
}

const Index = ({ currentLang, onLanguageChange }: IndexProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* 2. Pass the language and the setter to the Header */}
      <Header currentLang={currentLang} onLanguageChange={onLanguageChange} />

      {/* 3. Pass the lang prop to every section */}
      <main>
        <HeroSection lang={currentLang} />
        <FeaturesSection lang={currentLang} />
        <HowItWorksSection lang={currentLang} />
        <RolesSection lang={currentLang} />
        <CTASection lang={currentLang} />
      </main>

      <FooterSection lang={currentLang} />
    </div>
  );
};

export default Index;