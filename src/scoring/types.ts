import type {
  Comp1Config,
  Comp2Config,
  Evaluation,
  FeatureEvaluation,
  InterviewTurn,
  ScoredArgument,
  ScoredFeature,
} from "@/engine/types";

/* ---------------- Competitor I ---------------- */

export interface ScoreInput {
  config: Comp1Config;
  round: number;
  idx: number;
  text: string;
}

export interface ScoreOutput {
  evaluation: Evaluation;
  feedback: string;
}

export interface SummaryInput {
  config: Comp1Config;
  round: number;
  arguments: ScoredArgument[];
}

/* ---------------- Competitor II ---------------- */

/** Matcher A: offene Frage an die Persona. */
export interface InterviewInput {
  config: Comp2Config;
  round: number;
  idx: number;
  question: string;
  /** Bisheriger Gesprächsverlauf, damit die Persona konsistent bleibt */
  history: InterviewTurn[];
  /** Bereits entdeckte Motive werden nicht erneut aufgedeckt */
  discoveredMotiveIds: string[];
}

export interface InterviewOutput {
  reply: string;
  isOpen: boolean;
  discoveredMotiveId: string | null;
}

/** Matcher B: Feature mit gewähltem Motiv. */
export interface FeatureInput {
  config: Comp2Config;
  round: number;
  idx: number;
  text: string;
  motiveId: string;
}

export interface FeatureOutput {
  evaluation: FeatureEvaluation;
  feedback: string;
}

export interface Summary2Input {
  config: Comp2Config;
  round: number;
  interviews: InterviewTurn[];
  features: ScoredFeature[];
}

/**
 * Austauschbare Bewertungs-Implementierung: keyword (Phase 0) oder llm (Phase 2).
 * Comp I: scoreArgument, summarizeRound. Comp II: answerInterview, scoreFeature, summarizeRound2.
 */
export interface Scorer {
  readonly name: "keyword" | "llm";
  scoreArgument(input: ScoreInput): Promise<ScoreOutput>;
  summarizeRound(input: SummaryInput): Promise<string>;
  answerInterview(input: InterviewInput): Promise<InterviewOutput>;
  scoreFeature(input: FeatureInput): Promise<FeatureOutput>;
  summarizeRound2(input: Summary2Input): Promise<string>;
}
