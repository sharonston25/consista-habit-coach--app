import { Link, useLocation } from "@tanstack/react-router";
import { Home, Calendar, BarChart3, Sparkles, Settings as SettingsIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", label: "Today", icon: Home },
  { to: "/weekly", label: "Weekly", icon: Calendar },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/coach", label: "Coach", icon: Sparkles },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

export function BottomNav() {
  const loc = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 glass pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-2xl items-stretch justify-around px-2">
        {items.map(({ to, label, icon: Icon }) => {
          const active = loc.pathname === to || (to === "/reports" && loc.pathname.startsWith("/reports"));
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                className={cn(
                  "relative flex flex-col items-center gap-1 px-2 py-3 text-xs transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="h-5 w-5" />
                <span className="font-medium">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
