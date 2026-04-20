import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import {
  LayoutDashboard,
  Trophy,
  Users,
  Target,
  Swords,
  Shield,
  BarChart3,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    to: "/dashboard",
  },
  {
    label: "Pre-Tournament",
    icon: Trophy,
    to: "/predictions/pre-tournament",
    description: "Champion & stats picks",
  },
  {
    label: "Group Stage",
    icon: Users,
    to: "/predictions/groups",
    description: "Predict group standings",
  },
  {
    label: "Knockout Stage",
    icon: Swords,
    to: "/predictions/knockout",
    description: "Bracket predictions",
  },
  {
    label: "Leaderboard",
    icon: BarChart3,
    to: "/leaderboard",
    description: "Rankings & scores",
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuthStore();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 border-r border-border/50 bg-background/95 backdrop-blur-md transition-transform duration-300 lg:sticky lg:top-16 lg:z-30 lg:h-[calc(100vh-4rem)] lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-between p-4 lg:hidden">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-gold" />
            <span className="font-bold text-gradient-gold">Mundial 2026</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-4 lg:pt-4">
          <div className="mb-2 px-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Predictions
            </p>
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/10 text-primary glow-green"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <div className="flex flex-col">
                <span>{item.label}</span>
                {item.description && (
                  <span className="text-[10px] text-muted-foreground/70">
                    {item.description}
                  </span>
                )}
              </div>
            </NavLink>
          ))}

          {user?.is_admin && (
            <>
              <div className="mt-4 mb-2 px-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Admin
                </p>
              </div>
              <NavLink
                to="/admin"
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-gold/10 text-gold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                <Shield className="h-4 w-4 shrink-0" />
                <div className="flex flex-col">
                  <span>Admin Panel</span>
                  <span className="text-[10px] text-muted-foreground/70">
                    Invites & settings
                  </span>
                </div>
              </NavLink>
            </>
          )}
        </nav>

        {/* Bottom decoration */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3 text-center">
            <Target className="mx-auto h-5 w-5 text-gold mb-1" />
            <p className="text-xs text-muted-foreground">
              Max score: <span className="text-gold font-bold">424 pts</span>
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
