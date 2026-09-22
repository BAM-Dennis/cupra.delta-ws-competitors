/** Typen für Konfiguration, Session und Teilnehmer-Daten. Framework-frei. */

export interface Brand {
  id: string;
  name: string;
  /** Kurzform für Kacheln, z. B. "R5" */
  short?: string;
  isCupra?: boolean;
  /** Steht das Fahrzeug im Raum? */
  present: boolean;
}

export interface Need {
  id: string;
  text: string;
  /** Nur für den keywordScorer */
  keywords?: string[];
}

export interface Differentiator {
  id: string;
  /** show: am stehenden Auto erkundbar, zählt im Scoring. tell: Trainer-Outro, zählt nicht. Default show. */
  tag?: "show" | "tell";
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
  /** Portrait unter public/, z. B. "/personas/paula.jpg". Ohne Bild zeigt die App den Anfangsbuchstaben. */
  image?: string;
  needIds: string[];
}

export interface Category {
  id: string;
  title: string;
  prompts: string[];
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

export interface WorkshopConfig {
  id: string;
  market: string;
  workshopRef: string;
  language: string;
  title: string;
  brands: Brand[];
  needs: Need[];
  differentiators: Differentiator[];
  rounds: Round[];
  matrix: MatrixConfig;
  /** Tell-Fakten für das Schlusswort des Trainers auf der Leinwand */
  outro?: { title: string; facts: string[] };
}

/* ---------- Session ---------- */

export type Phase =
  | "lobby"
  | "persona"
  | "explore"
  | "argue"
  | "matrix"
  | "reveal"
  | "leaderboard"
  | "ended";

export interface SessionState {
  phase: Phase;
  /** Aktive Runde bei persona/explore/argue, sonst letzte Runde */
  round: number;
  /** Zähler, steigt bei jedem Trainer-Klick */
  version: number;
}

export type SessionEvent = { type: "NEXT" } | { type: "BACK" } | { type: "RESET" };

/* ---------- Scoring ---------- */

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

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  score: number;
}
