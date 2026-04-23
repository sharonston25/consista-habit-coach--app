import { useAllFlags, setFlag, FLAG_DEFAULTS, type FlagKey } from "@/lib/platform/flags";
import { Sliders } from "lucide-react";

const FLAG_LABELS: Record<FlagKey, string> = {
  achievements: "Achievements & badges",
  milestoneCelebrations: "Milestone celebrations",
  streakFreezes: "Streak freezes",
  waterTracker: "Water tracker",
  sleepLogger: "Sleep logger",
  weightHistory: "Weight history chart",
  weeklyAiReview: "Weekly AI review",
  plateScanner: "AI plate scanner",
  onboardingTour: "Onboarding tour",
  pushNotifications: "Push notifications",
  widgetRegistry: "Dashboard widget plugins",
  pwaInstallPrompt: "Install as app (PWA)",
  familyShare: "Family / partner share",
  studentsHub: "Students hub",
  mensHub: "Men's wellness hub",
};

export function FeatureFlagsPanel() {
  const flags = useAllFlags();
  const keys = Object.keys(FLAG_DEFAULTS) as FlagKey[];
  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-soft">
      <div className="mb-3 flex items-center gap-2">
        <Sliders className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Features</h3>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        Toggle features on or off. Changes apply instantly.
      </p>
      <div className="space-y-1.5">
        {keys.map((k) => (
          <label
            key={k}
            className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors hover:bg-muted/50"
          >
            <span>{FLAG_LABELS[k]}</span>
            <input
              type="checkbox"
              checked={flags[k]}
              onChange={(e) => setFlag(k, e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
