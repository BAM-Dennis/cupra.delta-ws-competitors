import type { Phase, SessionEvent, SessionState, WorkshopType } from "./types";

export const INITIAL_SESSION: SessionState = { phase: "lobby", round: 0, version: 0 };

/** Phasen innerhalb einer Runde, je Workshop-Typ. */
const ROUND_PHASES: Record<WorkshopType, Phase[]> = {
  "competitor-1": ["persona", "explore", "argue"],
  "competitor-2": ["persona", "interview", "motives", "explore", "features"],
};

/** Phasen nach der letzten Runde, je Workshop-Typ. */
const OUTRO_PHASES: Record<WorkshopType, Phase[]> = {
  "competitor-1": ["matrix", "reveal", "leaderboard", "ended"],
  "competitor-2": ["summary", "leaderboard", "ended"],
};

export interface SessionShape {
  type: WorkshopType;
  rounds: number;
}

/** Lineare Phasenfolge für einen Workshop-Typ mit `rounds` Runden. */
export function phaseSequence(shape: SessionShape): Array<Pick<SessionState, "phase" | "round">> {
  const seq: Array<Pick<SessionState, "phase" | "round">> = [{ phase: "lobby", round: 0 }];
  for (let r = 0; r < shape.rounds; r++) ROUND_PHASES[shape.type].forEach((phase) => seq.push({ phase, round: r }));
  OUTRO_PHASES[shape.type].forEach((phase) => seq.push({ phase, round: Math.max(0, shape.rounds - 1) }));
  return seq;
}

function indexOf(state: SessionState, shape: SessionShape): number {
  const seq = phaseSequence(shape);
  const i = seq.findIndex((s) => s.phase === state.phase && s.round === state.round);
  return i < 0 ? 0 : i;
}

/** Reducer: NEXT / BACK laufen die Sequenz ab, RESET zurück in die Lobby. */
export function sessionReducer(state: SessionState, event: SessionEvent, shape: SessionShape): SessionState {
  const seq = phaseSequence(shape);
  const i = indexOf(state, shape);
  switch (event.type) {
    case "NEXT": {
      const next = seq[Math.min(seq.length - 1, i + 1)];
      if (next.phase === state.phase && next.round === state.round) return state;
      return { ...next, version: state.version + 1 };
    }
    case "BACK": {
      if (i === 0) return state;
      return { ...seq[i - 1], version: state.version + 1 };
    }
    case "RESET":
      return { ...INITIAL_SESSION, version: state.version + 1 };
  }
}

export function isRoundPhase(phase: Phase): boolean {
  return ROUND_PHASES["competitor-1"].includes(phase) || ROUND_PHASES["competitor-2"].includes(phase);
}

export const PHASE_LABEL: Record<Phase, string> = {
  lobby: "Lobby",
  persona: "Persona",
  interview: "Interview",
  motives: "Motives",
  explore: "Exploration",
  argue: "Arguments",
  features: "Features",
  matrix: "Positioning",
  reveal: "Reveal",
  summary: "Summary",
  leaderboard: "Leaderboard",
  ended: "End",
};
