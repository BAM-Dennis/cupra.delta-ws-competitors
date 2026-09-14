import type { Evaluation, ScoredArgument, WorkshopConfig } from "@/engine/types";

export interface ScoreInput {
  config: WorkshopConfig;
  round: number;
  idx: number;
  text: string;
}

export interface ScoreOutput {
  evaluation: Evaluation;
  feedback: string;
}

export interface SummaryInput {
  config: WorkshopConfig;
  round: number;
  arguments: ScoredArgument[];
}

/** Austauschbare Bewertungs-Implementierung: keyword (Phase 0) oder llm (Phase 2). */
export interface Scorer {
  readonly name: "keyword" | "llm";
  scoreArgument(input: ScoreInput): Promise<ScoreOutput>;
  summarizeRound(input: SummaryInput): Promise<string>;
}
