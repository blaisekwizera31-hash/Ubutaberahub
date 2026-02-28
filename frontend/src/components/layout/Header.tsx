import { Header as LandingHeader } from "@/components/Dashboard/Header";

interface HeaderProps {
  currentLang: "en" | "rw" | "fr";
  onLanguageChange: (lang: "en" | "rw" | "fr") => void;
}

export function Header({ currentLang, onLanguageChange }: HeaderProps) {
  return <LandingHeader currentLang={currentLang} onLanguageChange={onLanguageChange} />;
}
