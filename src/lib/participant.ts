import type { PlacementResult, RoundSummary, ScoredArgument } from "@/engine/types";

/** Teilnehmer-Zustand pro Session. Phase 0 im localStorage, ab Phase 1 auf dem Server. */
export interface Participant {
  userId: string;
  displayName: string;
  joinedAt: string;
  arguments: ScoredArgument[];
  roundFinished: boolean[];
  roundSummaries: RoundSummary[];
  placements: PlacementResult[] | null;
}

export function participantScore(p: Participant | null): number {
  if (!p) return 0;
  return (
    p.arguments.reduce((s, a) => s + a.points, 0) + (p.placements?.reduce((s, m) => s + m.points, 0) ?? 0)
  );
}

export function sessionKey(code: string) {
  return `cw.session.${code}`;
}
export function meKey(code: string) {
  return `cw.me.${code}`;
}
