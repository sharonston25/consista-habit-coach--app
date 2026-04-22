import { Link, useLocation } from "@tanstack/react-router";
import {
  Home,
  BarChart3,
  Sparkles,
  Settings as SettingsIcon,
  Heart,
  Dumbbell,
  Apple,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/lib/habits/store";

export function BottomNav() {
  const loc = useLocation();
  const { profile } = useProfile();

  const middleItem =
    profile?.gender === "female"
      ? { to: "/period" as const, label: "Cycle", icon: Heart }
      : profile?.gender === "male"
        ? { to: "/wellness" as const, label: "Wellness", icon: Dumbbell }
        : null;

  const items = [
    { to: "/dashboard" as const, label: "Today", icon: Home },
    { to: "/nutrition" as const, label: "Nutrition", icon: Apple },
    ...(middleItem ? [middleItem] : []),
    { to: "/achievements" as const, label: "Awards", icon: Trophy },
    { to: "/reports" as const, label: "Reports", icon: BarChart3 },
    { to: "/coach" as const, label: "Coach", icon: Sparkles },
    { to: "/settings" as const, label: "Settings", icon: SettingsIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 glass pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-2xl items-stretch justify-around px-1">
        {items.map(({ to, label, icon: Icon }) => {
          const active = loc.pathname === to;
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                className={cn(
                  "relative flex flex-col items-center gap-1 px-1 py-2.5 text-[10px] transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {active && <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-primary" />}
                <Icon className="h-[18px] w-[18px]" />
                <span className="font-medium">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
