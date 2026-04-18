import { motion } from "framer-motion";

export function ConsistaLogo({ size = 48, animated = false }: { size?: number; animated?: boolean }) {
  const r = size / 2 - 4;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--primary-glow)" />
        </linearGradient>
        <filter id="logo-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {animated ? (
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#logo-grad)"
          strokeWidth={Math.max(3, size / 14)}
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * r}
          initial={{ strokeDashoffset: 2 * Math.PI * r * 0.25, rotate: -90 }}
          animate={{ strokeDashoffset: 2 * Math.PI * r * 0.25, rotate: 270 }}
          transition={{ duration: 1.6, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformOrigin: "50% 50%" }}
          filter="url(#logo-glow)"
        />
      ) : (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#logo-grad)"
          strokeWidth={Math.max(3, size / 14)}
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * r * 0.78} ${2 * Math.PI * r}`}
          transform={`rotate(135 ${size / 2} ${size / 2})`}
        />
      )}
    </svg>
  );
}
