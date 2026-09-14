import type { InterviewTurn, PlacementResult, RoundSummary, ScoredArgument, ScoredFeature } from "@/engine/types";

/** Teilnehmer-Zustand pro Session. Phase 0 im localStorage, ab Phase 1 auf dem Server. */
export interface Participant {
  userId: string;
  displayName: string;
  joinedAt: string;
  /* Competitor I */
  arguments: ScoredArgument[];
  placements: PlacementResult[] | null;
  /* Competitor II */
  interviews: InterviewTurn[];
  features: ScoredFeature[];
  /* gemeinsam */
  roundFinished: boolean[];
  roundSummaries: RoundSummary[];
}

export function emptyParticipant(userId: string, displayName: string, rounds: number): Participant {
  return {
    userId,
    displayName,
    joinedAt: new Date().toISOString(),
    arguments: [],
    placements: null,
    interviews: [],
    features: [],
    roundFinished: Array.from({ length: rounds }, () => false),
    roundSummaries: [],
  };
}

export function participantScore(p: Participant | null): number {
  if (!p) return 0;
  return (
    p.arguments.reduce((s, a) => s + a.points, 0) +
    (p.placements?.reduce((s, m) => s + m.points, 0) ?? 0) +
    (p.interviews ?? []).reduce((s, t) => s + t.points, 0) +
    (p.features ?? []).reduce((s, f) => s + f.points, 0)
  );
}

export function discoveredMotives(p: Participant, round: number): string[] {
  return (p.interviews ?? [])
    .filter((t) => t.round === round && t.discoveredMotiveId)
    .map((t) => t.discoveredMotiveId as string);
}

export function sessionKey(code: string) {
  return `cw.session.${code}`;
}
export function meKey(code: string) {
  return `cw.me.${code}`;
}
