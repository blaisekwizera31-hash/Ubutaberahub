import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserPhotoProps {
  src?: string | null;
  alt?: string;
  className?: string;
  iconClassName?: string;
}

export function UserPhoto({ src, alt = "User photo", className, iconClassName }: UserPhotoProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-full bg-muted border border-border", className)}>
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <User className={cn("h-1/2 w-1/2 text-muted-foreground", iconClassName)} />
        </div>
      )}
    </div>
  );
}
