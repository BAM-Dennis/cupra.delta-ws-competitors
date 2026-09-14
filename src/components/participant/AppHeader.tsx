import { isRoundPhase } from "@/engine/session";
import type { Phase, WorkshopConfig } from "@/engine/types";
import { Chip } from "../shared/bits";
import { Overline } from "../shared/ui";

interface Props {
  config: WorkshopConfig;
  phase: Phase;
  round: number;
  score: number;
  displayName?: string;
}

const PHASE_TEXT: Record<Phase, string> = {
  lobby: "Lobby",
  persona: "Persona",
  interview: "Interview",
  motives: "Her motives",
  explore: "Explore",
  argue: "Your arguments",
  features: "Your features",
  matrix: "Positioning",
  reveal: "The reveal",
  summary: "Summary",
  leaderboard: "Results",
  ended: "Results",
};

/** Kopfzeile der Teilnehmer-App: Workshop, Phase/Runde, eigener Punktestand. */
export function AppHeader({ config, phase, round, score, displayName }: Props) {
  const inRound = isRoundPhase(phase);
  const personaName = config.rounds[round]?.persona.name;
  const text = phase === "motives" && personaName ? `${personaName}'s motives` : PHASE_TEXT[phase];
  return (
    <header className="flex items-start justify-between gap-3 pt-[max(16px,env(safe-area-inset-top))]">
      <div className="flex min-w-0 flex-col gap-1.5">
        <Overline className="truncate text-white/50">{config.title}</Overline>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[18px] font-medium leading-none">{text}</span>
          {inRound && (
            <Chip tone="teal">
              Round {round + 1} of {config.rounds.length}
            </Chip>
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <div className="flex items-baseline gap-1">
          <span className="text-[30px] leading-none tracking-[1px] tabular-nums">{score}</span>
          <span className="text-[10px] uppercase tracking-[1px] text-white/60">pts</span>
        </div>
        {displayName && <span className="max-w-[120px] truncate text-[11px] text-white/50">{displayName}</span>}
      </div>
    </header>
  );
}
