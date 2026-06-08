import { Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "@/services/backend";
import { UserPhoto } from "@/components/ui/UserPhoto";

interface DashboardHeaderProps {
  searchPlaceholder?: string;
  showSearch?: boolean;
  title?: string;
  onSearch?: (value: string) => void;
}

export function DashboardHeader({ searchPlaceholder = "Search...", showSearch = true, title, onSearch }: DashboardHeaderProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await getNotifications();
        if (!mounted) return;
        setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
        setUnreadCount(Number(data.unreadCount || 0));
      } catch {
        if (!mounted) return;
        setNotifications([]);
        setUnreadCount(0);
      }
    };
    load();
    const timer = window.setInterval(load, 15000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  const defaultSearch = (value: string) => {
    const q = value.trim();
    const loggedInUser = localStorage.getItem("loggedInUser");
    const user = loggedInUser ? JSON.parse(loggedInUser) : null;
    const role = user?.role;
    const target =
      role === "lawyer"
        ? "/lawyer-cases"
        : role === "judge"
          ? "/judge-cases"
          : role === "clerk"
            ? "/clerk-cases"
            : "/my-cases";
    navigate(q ? `${target}?q=${encodeURIComponent(q)}` : target);
  };

  const submitSearch = () => {
    if (onSearch) {
      onSearch(query);
      return;
    }
    defaultSearch(query);
  };

  const openNotification = async (item: any) => {
    try {
      if (!item?.isRead) {
        await markNotificationRead(item.id);
        setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {}

    const metadata = item?.metadata || {};
    if (metadata.conversationId) {
      navigate(`/messages?conversationId=${encodeURIComponent(metadata.conversationId)}`);
      return;
    }
    if (metadata.caseNumber || metadata.caseId) {
      navigate(`/my-cases?q=${encodeURIComponent(metadata.caseNumber || metadata.caseId)}`);
      return;
    }
    navigate("/messages");
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4 flex-1">
          {title ? (
            <h1 className="text-xl font-semibold">{title}</h1>
          ) : showSearch ? (
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                className="pl-10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitSearch();
                }}
              />
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="px-2 py-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notifications</span>
                <Button variant="ghost" size="sm" onClick={handleMarkAllNotificationsRead}>
                  Mark all read
                </Button>
              </div>
              <DropdownMenuSeparator />
              {notifications.slice(0, 8).map((item) => (
                <DropdownMenuItem key={item.id} onClick={() => openNotification(item)} className="cursor-pointer items-start py-2">
                  <div className="w-full">
                    <div className="flex items-center gap-2">
                      {!item.isRead && <span className="w-2 h-2 rounded-full bg-primary" />}
                      <p className="text-sm font-medium">{item.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.body}</p>
                  </div>
                </DropdownMenuItem>
              ))}
              {notifications.length === 0 && <div className="px-2 py-3 text-sm text-muted-foreground">No notifications yet.</div>}
            </DropdownMenuContent>
          </DropdownMenu>
          <UserPhoto src={user?.profilePhoto || user?.profile_photo} alt={user?.name || "User"} className="h-10 w-10" />
        </div>
      </div>
    </header>
  );
}
export default DashboardHeader;
