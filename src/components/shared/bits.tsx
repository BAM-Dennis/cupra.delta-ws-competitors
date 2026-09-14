import type { ReactNode } from "react";

/** Kleine Inline-Icons, damit der Prototyp ohne weitere Assets auskommt. */
export function Glyph({
  name,
  className = "size-4",
}: {
  name: "check" | "x" | "chevron-left" | "chevron-right" | "arrow-right" | "users" | "refresh" | "spark" | "lock";
  className?: string;
}) {
  const paths: Record<typeof name, ReactNode> = {
    check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
    x: <path d="M6 6l12 12M18 6L6 18" />,
    "chevron-left": <path d="M15 5l-7 7 7 7" />,
    "chevron-right": <path d="M9 5l7 7-7 7" />,
    "arrow-right": <path d="M4 12h16m-6-6l6 6-6 6" />,
    users: (
      <>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20a6.5 6.5 0 0113 0M16 4.5a3.5 3.5 0 010 7M21.5 20a6.5 6.5 0 00-4-6" />
      </>
    ),
    refresh: <path d="M20 12a8 8 0 01-14.5 4.6M4 12A8 8 0 0118.5 7.4M18.5 3v4.5H14M5.5 21v-4.5H10" />,
    spark: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z" />,
    lock: (
      <>
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 018 0v3" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`} aria-hidden>
      {paths[name]}
    </svg>
  );
}

/** Kleiner Tag, z. B. "ROUND 1 · VS RENAULT 5" */
export function Chip({ children, tone = "glass", className = "" }: { children: ReactNode; tone?: "glass" | "teal" | "copper" | "correct" | "signal"; className?: string }) {
  const tones = {
    glass: "glass text-white/80",
    teal: "border border-teal/40 bg-teal-tint text-white",
    copper: "bg-copper-gradient text-white",
    correct: "border border-correct/60 bg-correct/20 text-white",
    signal: "border border-signal/60 bg-signal/20 text-white",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium uppercase leading-none tracking-[0.8px] ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

/** "+2" Punkte-Badge am Feedback */
export function PointsBadge({ points, max }: { points: number; max: number }) {
  const tone = points === 0 ? "border-white/20 bg-white/5 text-white/60" : points >= max ? "border-teal/60 bg-teal-tint shadow-glow" : "border-copper/60 bg-copper/20";
  return (
    <span className={`inline-flex h-7 items-center gap-1 rounded-full border px-2.5 text-[13px] font-medium tabular-nums ${tone}`}>
      {points > 0 && <span className="text-[11px]">+</span>}
      {points}
      <span className="text-[10px] text-white/60">/ {max}</span>
    </span>
  );
}

export function TypingDots() {
  return (
    <span className="animate-typing inline-flex items-center gap-1 px-1" aria-label="thinking">
      <span className="size-1.5 rounded-full bg-teal" />
      <span className="size-1.5 rounded-full bg-teal" />
      <span className="size-1.5 rounded-full bg-teal" />
    </span>
  );
}

/** Fortschrittsbalken 0..1 */
export function Bar({ value, className = "", tone = "copper" }: { value: number; className?: string; tone?: "copper" | "teal" }) {
  const w = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-white/15 ${className}`}>
      <div className={`h-full rounded-full transition-[width] duration-500 ${tone === "copper" ? "bg-copper-gradient" : "bg-teal"}`} style={{ width: `${w}%` }} />
    </div>
  );
}

/** Große Kennzahl mit Label darunter */
export function BigStat({ value, label, className = "" }: { value: ReactNode; label: string; className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <span className="text-[44px] leading-none tracking-[1.5px] tabular-nums">{value}</span>
      <span className="text-[10px] font-medium uppercase leading-none tracking-[1px] text-white/60">{label}</span>
    </div>
  );
}
