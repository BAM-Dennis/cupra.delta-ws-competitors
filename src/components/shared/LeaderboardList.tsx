import type { LeaderboardEntry } from "@/engine/types";

/** Leaderboard-Zeile im Stil der Streak Challenge ("Player Row"), hier mit Punkten. */
export function LeaderboardRow({ entry, highlighted, big = false }: { entry: LeaderboardEntry; highlighted: boolean; big?: boolean }) {
  const tone = highlighted ? "border border-teal bg-teal-tint shadow-glow" : "border border-white/5 bg-white/5 backdrop-blur-[10px]";
  const h = big ? "h-14 px-6 text-[22px]" : "h-11 px-[17px] text-[16px]";
  return (
    <li className={`flex items-center gap-[10px] rounded-[6px] ${h} ${tone}`} style={highlighted ? { backgroundColor: "#1f1e29" } : undefined}>
      <span className={`flex shrink-0 items-center justify-center font-medium leading-none tabular-nums ${big ? "w-10" : "size-6"}`}>{entry.rank}</span>
      <span className="min-w-0 flex-1 truncate leading-none">{entry.displayName}</span>
      <span className="font-medium leading-none tabular-nums">{entry.score}</span>
      <span className={`${big ? "text-[14px]" : "text-[11px]"} uppercase leading-none tracking-[1px] text-white/50`}>pts</span>
    </li>
  );
}

export function LeaderboardList({
  top,
  me,
  highlightId,
  big = false,
}: {
  top: LeaderboardEntry[];
  me: LeaderboardEntry | null;
  highlightId?: string | null;
  big?: boolean;
}) {
  const showMeSeparately = me && !top.some((e) => e.userId === me.userId);
  return (
    <ol className={`flex flex-col ${big ? "gap-1.5" : "gap-1"}`}>
      {top.map((e) => (
        <LeaderboardRow key={e.userId} entry={e} highlighted={e.userId === highlightId} big={big} />
      ))}
      {showMeSeparately && (
        <>
          <li className="py-1 text-center text-[12px] leading-none text-white/30">···</li>
          <LeaderboardRow entry={me} highlighted big={big} />
        </>
      )}
    </ol>
  );
}
