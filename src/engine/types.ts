/** Typen für Konfiguration, Session und Teilnehmer-Daten. Framework-frei. */

/* ---------- Gemeinsam für alle Workshops ---------- */

export type WorkshopType = "competitor-1" | "competitor-2";

export interface Brand {
  id: string;
  name: string;
  /** Kurzform für Kacheln, z. B. "R5" */
  short?: string;
  isCupra?: boolean;
  /** Steht das Fahrzeug im Raum? */
  present: boolean;
}

export interface Category {
  id: string;
  title: string;
  prompts: string[];
}

interface WorkshopConfigBase {
  id: string;
  type: WorkshopType;
  market: string;
  workshopRef: string;
  language: string;
  title: string;
  brands: Brand[];
}

/* ---------- Competitor I: rational, Argumente und Matrix ---------- */

export interface Need {
  id: string;
  text: string;
  /** Nur für den keywordScorer */
  keywords?: string[];
}

export interface Differentiator {
  id: string;
  text: string;
  /** Gegen welche Wettbewerber gilt der Differenzierer? */
  vsBrandIds: string[];
  /** Welche Needs bedient er? */
  needIds: string[];
  /** Als entscheidend markiert (Bonus) */
  key?: boolean;
  keywords?: string[];
}

export interface Persona {
  name: string;
  tagline?: string;
  description: string;
  needIds: string[];
}

export interface Round {
  id: string;
  competitorBrandId: string;
  persona: Persona;
  categories: Category[];
}

export interface MatrixAxis {
  label: string;
  low: string;
  high: string;
}

export interface MatrixPosition {
  id: string;
  label: string;
  /** Spalte 0..n-1 (links → rechts) */
  x: number;
  /** Zeile 0..n-1 (unten → oben) */
  y: number;
}

export interface MatrixConfig {
  axes: { x: MatrixAxis; y: MatrixAxis };
  positions: MatrixPosition[];
  /** brandId → positionId */
  solution: Record<string, string>;
}

export interface Comp1Config extends WorkshopConfigBase {
  type: "competitor-1";
  needs: Need[];
  differentiators: Differentiator[];
  rounds: Round[];
  matrix: MatrixConfig;
}

/* ---------- Competitor II: emotional, Interview und Motive ---------- */

/** Globales Motiv, über alle Personas gleich benannt (für die Zusammenfassung nach Motiv). */
export interface Motive {
  id: string;
  label: string;
  description: string;
}

/** Ausprägung eines Motivs bei einer Persona: Themenfelder und In-Character-Aufdeck-Satz. */
export interface PersonaMotive {
  motiveId: string;
  /** Zwei bis drei Beispiel-Themen, die das Motiv öffnen */
  topics: string[];
  /** Antwort der Persona, wenn das Motiv aufgedeckt wird */
  revealLine: string;
  /** Nur für den keywordScorer */
  keywords?: string[];
}

export interface EmotionalPersona {
  name: string;
  tagline?: string;
  /** Kurze Selbstvorstellung, in der ersten Person */
  intro: string;
  /** Hintergrund für die KI-Rolle, nicht für die Teilnehmer sichtbar */
  background?: string;
  motives: PersonaMotive[];
  /** In-Character-Antwort auf geschlossene oder themenferne Fragen */
  nudgeLines: string[];
}

export interface Round2 {
  id: string;
  competitorBrandId: string;
  persona: EmotionalPersona;
  categories: Category[];
}

/** CUPRA-Feature, das auf mehrere Motive einzahlt (many-to-many). */
export interface FeatureDef {
  id: string;
  text: string;
  motiveIds: string[];
  keywords?: string[];
}

export interface Comp2Config extends WorkshopConfigBase {
  type: "competitor-2";
  /** Anzahl offener Fragen im Interview (Feinkonzept: zwei oder drei) */
  interviewQuestions: number;
  motives: Motive[];
  features: FeatureDef[];
  rounds: Round2[];
}

export type WorkshopConfig = Comp1Config | Comp2Config;

/* ---------- Session ---------- */

export type Phase =
  | "lobby"
  | "persona"
  | "interview"
  | "motives"
  | "explore"
  | "argue"
  | "features"
  | "matrix"
  | "reveal"
  | "summary"
  | "leaderboard"
  | "ended";

export interface SessionState {
  phase: Phase;
  /** Aktive Runde bei Runden-Phasen, sonst letzte Runde */
  round: number;
  /** Zähler, steigt bei jedem Trainer-Klick */
  version: number;
}

export type SessionEvent = { type: "NEXT" } | { type: "BACK" } | { type: "RESET" };

/* ---------- Scoring Competitor I ---------- */

export interface Evaluation {
  addressesNeed: boolean;
  needId: string | null;
  namesDifferentiator: boolean;
  differentiatorId: string | null;
  isKeyDifferentiator: boolean;
}

export interface ScoredArgument {
  round: number;
  idx: number;
  text: string;
  evaluation: Evaluation;
  feedback: string;
  points: number;
  scorer: "llm" | "keyword";
}

export interface RoundSummary {
  round: number;
  points: number;
  maxPoints: number;
  text: string;
}

export interface Placement {
  brandId: string;
  positionId: string;
}

export interface PlacementResult extends Placement {
  correct: boolean;
  solutionPositionId: string;
  points: number;
}

/* ---------- Scoring Competitor II ---------- */

export interface InterviewTurn {
  round: number;
  idx: number;
  question: string;
  /** In-Character-Antwort der Persona */
  reply: string;
  /** War die Frage offen genug, um etwas aufzudecken? */
  isOpen: boolean;
  /** Maximal ein Motiv pro Frage */
  discoveredMotiveId: string | null;
  points: number;
  scorer: "llm" | "keyword";
}

export interface FeatureEvaluation {
  /** Erkanntes Feature aus dem Modell, sonst null */
  featureId: string | null;
  /** Vom Teilnehmer gewähltes Motiv */
  motiveId: string;
  /** Steht das Paar Feature/Motiv im Modell? */
  pairValid: boolean;
}

export interface ScoredFeature {
  round: number;
  idx: number;
  text: string;
  evaluation: FeatureEvaluation;
  feedback: string;
  points: number;
  scorer: "llm" | "keyword";
}

/** Zusammenfassung für die Leinwand: genannte Features je Motiv. */
export interface MotiveCluster {
  motiveId: string;
  /** Feature-Nennungen, häufigste zuerst */
  items: Array<{ featureId: string | null; text: string; count: number }>;
  total: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  score: number;
}
