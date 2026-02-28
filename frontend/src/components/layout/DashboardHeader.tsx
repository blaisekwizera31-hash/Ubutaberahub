import { Search, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DashboardHeaderProps {
  searchPlaceholder?: string;
  showSearch?: boolean;
  title?: string;
}

export function DashboardHeader({ searchPlaceholder = "Search...", showSearch = true, title }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4 flex-1">
          {title ? (
            <h1 className="text-xl font-semibold">{title}</h1>
          ) : showSearch ? (
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder={searchPlaceholder} className="pl-10" />
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
              2
            </span>
          </Button>
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
            <User className="w-5 h-5 text-accent-foreground" />
          </div>
        </div>
      </div>
    </header>
  );
}
export default DashboardHeader;