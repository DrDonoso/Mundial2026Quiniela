import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Avatar } from "@/components/ui/avatar";
import {
  Trophy,
  Menu,
  LogOut,
  Shield,
  ChevronDown,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-md px-4 lg:px-6">
      <button
        onClick={onToggleSidebar}
        className="lg:hidden rounded-md p-2 hover:bg-muted transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-gold" />
          <span className="hidden sm:inline-block text-gradient-gold font-bold text-lg tracking-tight">
            Mundial 2026
          </span>
        </div>
        <div className="hidden sm:block h-6 w-px bg-border" />
        <h1 className="text-sm font-medium text-muted-foreground">
          {pageTitle}
        </h1>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {user && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-muted transition-colors"
            >
              <Avatar
                fallback={user.display_name || user.username}
                size="sm"
              />
              <span className="hidden sm:block text-sm font-medium">
                {user.display_name || user.username}
              </span>
              {user.is_admin && (
                <Shield className="h-3.5 w-3.5 text-gold" />
              )}
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border bg-card shadow-xl py-1 animate-in fade-in-0 zoom-in-95">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-sm font-medium">{user.display_name}</p>
                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                </div>
                {user.is_admin && (
                  <Link
                    to="/admin"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

function getPageTitle(pathname: string): string {
  const titles: Record<string, string> = {
    "/": "Dashboard",
    "/dashboard": "Dashboard",
    "/predictions/pre-tournament": "Pre-Tournament Picks",
    "/predictions/groups": "Group Stage",
    "/predictions/knockout": "Knockout Stage",
    "/leaderboard": "Leaderboard",
    "/admin": "Admin Panel",
  };
  return titles[pathname] || "Mundial 2026";
}
