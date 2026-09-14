import { keywordScorer } from "./keywordScorer";
import type { Scorer } from "./types";

/** Phase 0: nur keyword. Phase 2 ergänzt llmScorer und wählt per SCORER-Umgebungsvariable. */
export function getScorer(): Scorer {
  return keywordScorer;
}

export type { Scorer, ScoreInput, ScoreOutput, SummaryInput } from "./types";
