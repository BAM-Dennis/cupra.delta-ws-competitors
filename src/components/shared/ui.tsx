import Link from "next/link";
import type { ReactNode } from "react";

const BUTTON_BASE =
  "flex min-h-12 w-full items-center justify-center gap-1 rounded-[6px] px-4 py-[14px] text-center text-[14px] font-medium uppercase leading-5 tracking-[1px] transition active:scale-[0.99] disabled:opacity-40";

/** Primär-Button im Kupfer-Verlauf (Figma "Button", Type=Primary). */
export function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled,
  href,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  href?: string;
  className?: string;
}) {
  const cls = `${BUTTON_BASE} bg-copper-gradient text-white ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

/** Sekundär-Button als Glasfläche mit Rand. */
export function SecondaryButton({
  children,
  onClick,
  href,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
}) {
  const cls = `${BUTTON_BASE} border border-white/25 bg-white/5 text-white backdrop-blur-[10px] ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

/** Dunkle Karte mit feinem Rand und Innenschatten (Figma "Status Bar Container"). */
export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`relative flex flex-col gap-4 rounded-[12px] border border-white/10 bg-black/10 px-5 pb-5 pt-[15px] shadow-[inset_0_2px_2px_0_rgba(0,0,0,0.1)] ${className}`}
    >
      {children}
    </section>
  );
}

/** Kleine Kennzahl-Kachel (Figma "Player Row" / "Result Row"). */
export function StatTile({
  label,
  children,
  footer,
  variant = "default",
  className = "",
}: {
  label?: string;
  children: ReactNode;
  /** Zeile unter dem Wert, z. B. der Spielername */
  footer?: string;
  variant?: "default" | "you";
  className?: string;
}) {
  const tone = variant === "you" ? "border-copper bg-copper/10" : "border-white/5 bg-white/5";
  return (
    <div
      className={`flex min-w-0 flex-1 flex-col items-center justify-end gap-[7px] rounded-[6px] border p-2 shadow-card ${tone} ${className}`}
    >
      {label && (
        <p className="w-full truncate text-center text-[8px] font-medium uppercase leading-none">{label}</p>
      )}
      <div className="flex w-full items-center justify-center gap-[3px] text-[16px] font-medium leading-none">
        {children}
      </div>
      {footer !== undefined && (
        <p className="w-full truncate text-center text-[10px] font-medium uppercase leading-none">
          {footer || "\u00a0"}
        </p>
      )}
    </div>
  );
}

/** Kleines Overline-Label, z. B. "QUESTION 5" oder "LEADERBOARD". */
export function Overline({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-[10px] font-medium uppercase leading-[1.2] tracking-[1px] ${className}`}>{children}</p>
  );
}
