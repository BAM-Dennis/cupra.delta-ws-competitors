/* eslint-disable @next/next/no-img-element */

export type IconName = "clock" | "position" | "rank" | "rank-up" | "plus" | "leaderboard";

/** Icons aus dem Figma-Export in public/design (16 oder 24 px). */
export function Icon({ name, size = 16, className = "" }: { name: IconName; size?: 16 | 24; className?: string }) {
  const dims = size === 24 ? "size-6" : "size-4";
  return (
    <span className={`inline-block shrink-0 overflow-clip ${dims} ${className}`}>
      <img alt="" src={`/design/icon-${name}.svg`} className="block size-full" />
    </span>
  );
}
