import { maxMatrixPoints, maxPointsPerRound } from "@/engine/scoring";
import type { LeaderboardEntry, Phase, WorkshopConfig } from "@/engine/types";
import { participantScore, type Participant } from "./participant";

/**
 * Demo-Daten für Phase 0: simulierte Mitspieler, damit Leaderboard und
 * Trainer-Fortschritt nicht leer sind. Deterministisch, abhängig von der Phase.
 * Fällt in Phase 1 weg.
 */
const DEMO_PEOPLE: Array<{ name: string; skill: number }> = [
  { name: "Sofia", skill: 0.94 },
  { name: "Mateo", skill: 0.88 },
  { name: "Aya", skill: 0.83 },
  { name: "Jonas", skill: 0.79 },
  { name: "Priya", skill: 0.74 },
  { name: "Luca", skill: 0.7 },
  { name: "Emma", skill: 0.66 },
  { name: "Noah", skill: 0.61 },
  { name: "Chloé", skill: 0.57 },
  { name: "Diego", skill: 0.52 },
  { name: "Mia", skill: 0.48 },
  { name: "Tom", skill: 0.44 },
  { name: "Hana", skill: 0.4 },
  { name: "Felix", skill: 0.36 },
  { name: "Zara", skill: 0.33 },
  { name: "Ben", skill: 0.29 },
  { name: "Ines", skill: 0.25 },
  { name: "Omar", skill: 0.22 },
  { name: "Lea", skill: 0.18 },
  { name: "Sam", skill: 0.15 },
  { name: "Nina", skill: 0.12 },
  { name: "Kai", skill: 0.09 },
  { name: "Rosa", skill: 0.05 },
];

export const DEMO_PARTICIPANT_COUNT = DEMO_PEOPLE.length;

const ORDER: Phase[] = ["lobby", "persona", "explore", "argue", "matrix", "reveal", "leaderboard", "ended"];

/** Wie viele Punkte konnten die anderen bis zu dieser Phase maximal gesammelt haben? */
function availablePoints(config: WorkshopConfig, phase: Phase, round: number): number {
  const perRound = maxPointsPerRound();
  let pts = 0;
  const roundsDone = phase === "argue" ? round + 1 : ["matrix", "reveal", "leaderboard", "ended"].includes(phase) ? config.rounds.length : round;
  pts += roundsDone * perRound;
  if (ORDER.indexOf(phase) >= ORDER.indexOf("reveal")) pts += maxMatrixPoints(config.brands);
  return pts;
}

export function demoLeaderboard(
  config: WorkshopConfig,
  phase: Phase,
  round: number,
  me: Participant | null,
): { top: LeaderboardEntry[]; me: LeaderboardEntry | null; all: LeaderboardEntry[] } {
  const avail = availablePoints(config, phase, round);
  const rows = DEMO_PEOPLE.map((p, i) => ({
    userId: `demo-${i}`,
    displayName: p.name,
    score: Math.round(p.skill * avail),
    joined: i,
  }));
  if (me) rows.push({ userId: me.userId, displayName: me.displayName || "You", score: participantScore(me), joined: -1 });
  rows.sort((a, b) => b.score - a.score || a.joined - b.joined);
  const all: LeaderboardEntry[] = rows.map((r, i) => ({ rank: i + 1, userId: r.userId, displayName: r.displayName, score: r.score }));
  return { all, top: all.slice(0, 10), me: me ? all.find((e) => e.userId === me.userId) ?? null : null };
}

export interface DemoProgress {
  participants: number;
  /** je Argument-Index: wie viele haben abgegeben */
  argumentsSubmitted: number[];
  roundFinished: number;
  matrixSubmitted: number;
}

export function demoProgress(config: WorkshopConfig, phase: Phase, round: number, me: Participant | null): DemoProgress {
  const n = DEMO_PARTICIPANT_COUNT + (me ? 1 : 0);
  const mine = me?.arguments.filter((a) => a.round === round).length ?? 0;
  const inArgue = phase === "argue";
  const base = inArgue ? [0.85, 0.6, 0.35] : [1, 1, 1];
  return {
    participants: n,
    argumentsSubmitted: base.map((f, i) => Math.round(f * DEMO_PARTICIPANT_COUNT) + (mine > i ? 1 : 0)),
    roundFinished: Math.round((inArgue ? 0.3 : 1) * DEMO_PARTICIPANT_COUNT) + (me?.roundFinished[round] ? 1 : 0),
    matrixSubmitted: Math.round((phase === "matrix" ? 0.7 : phase === "lobby" ? 0 : 1) * DEMO_PARTICIPANT_COUNT) + (me?.placements ? 1 : 0),
  };
}

/** Anteil der Gruppe, der eine Marke richtig platziert hat (Demo). */
export function demoCorrectShare(brandId: string): number {
  let h = 0;
  for (const c of brandId) h = (h * 31 + c.charCodeAt(0)) % 997;
  return 0.35 + (h % 55) / 100;
}
