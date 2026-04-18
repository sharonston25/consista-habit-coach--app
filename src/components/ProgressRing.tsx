import { motion } from "framer-motion";
import type { HabitColor } from "@/lib/habits/types";

interface ProgressRingProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: HabitColor | "primary";
  label?: string;
  sublabel?: string;
}

const colorVar: Record<string, string> = {
  primary: "var(--primary)",
  water: "var(--habit-water)",
  exercise: "var(--habit-exercise)",
  study: "var(--habit-study)",
  read: "var(--habit-read)",
  sleep: "var(--habit-sleep)",
  meditation: "var(--habit-meditation)",
  walk: "var(--habit-walk)",
  coding: "var(--habit-coding)",
  accent: "var(--accent)",
};

export function ProgressRing({
  value,
  size = 140,
  strokeWidth = 12,
  color = "primary",
  label,
  sublabel,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;
  const stroke = colorVar[color] ?? "var(--primary)";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={stroke} />
            <stop offset="100%" stopColor="var(--primary-glow)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--muted)"
          strokeWidth={strokeWidth}
          fill="none"
          opacity={0.4}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#grad-${color})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {label !== undefined ? (
          <span className="text-3xl font-bold tracking-tight gradient-text">{label}</span>
        ) : (
          <span className="text-3xl font-bold tracking-tight gradient-text">{Math.round(clamped)}%</span>
        )}
        {sublabel && <span className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{sublabel}</span>}
      </div>
    </div>
  );
}
