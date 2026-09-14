import { WS_CONFIG } from "./config";
import type {
  Brand,
  Comp2Config,
  Evaluation,
  FeatureEvaluation,
  MatrixConfig,
  MotiveCluster,
  Placement,
  PlacementResult,
  ScoredArgument,
  ScoredFeature,
} from "./types";

/* ---------------- Competitor I ---------------- */

/** Punkte für ein Argument aus den binären Kriterien (Briefing Comp I, Abschnitt 7). */
export function pointsForArgument(e: Evaluation): number {
  let p = 0;
  if (e.addressesNeed) p += WS_CONFIG.POINTS_NEED;
  if (e.namesDifferentiator) p += WS_CONFIG.POINTS_DIFFERENTIATOR;
  // Bonus nur, wenn überhaupt ein Differenzierer erkannt wurde
  if (e.namesDifferentiator && e.isKeyDifferentiator) p += WS_CONFIG.POINTS_KEY_BONUS;
  return p;
}

export function maxPointsPerRound(): number {
  return WS_CONFIG.ARGUMENTS_PER_ROUND * (WS_CONFIG.POINTS_NEED + WS_CONFIG.POINTS_DIFFERENTIATOR + WS_CONFIG.POINTS_KEY_BONUS);
}

export function roundPoints(args: ScoredArgument[], round: number): number {
  return args.filter((a) => a.round === round).reduce((s, a) => s + a.points, 0);
}

/** Matrix-Zuordnung gegen den Lösungsschlüssel, CUPRA zählt doppelt (D3). */
export function scoreMatrix(placements: Placement[], matrix: MatrixConfig, brands: Brand[]): PlacementResult[] {
  return placements.map((p) => {
    const brand = brands.find((b) => b.id === p.brandId);
    const solutionPositionId = matrix.solution[p.brandId];
    const correct = solutionPositionId === p.positionId;
    const base = correct ? WS_CONFIG.POINTS_MATRIX_CORRECT : 0;
    const points = brand?.isCupra ? base * WS_CONFIG.MATRIX_CUPRA_MULTIPLIER : base;
    return { ...p, correct, solutionPositionId, points };
  });
}

export function maxMatrixPoints(brands: Brand[]): number {
  return brands.reduce(
    (s, b) => s + WS_CONFIG.POINTS_MATRIX_CORRECT * (b.isCupra ? WS_CONFIG.MATRIX_CUPRA_MULTIPLIER : 1),
    0,
  );
}

export function totalScore(args: ScoredArgument[], matrix: PlacementResult[]): number {
  return args.reduce((s, a) => s + a.points, 0) + matrix.reduce((s, m) => s + m.points, 0);
}

/* ---------------- Competitor II ---------------- */

/** Punkte für eine Interview-Frage: nur ein aufgedecktes Motiv zählt (US-2). */
export function pointsForInterviewTurn(discoveredMotiveId: string | null): number {
  return discoveredMotiveId ? WS_CONFIG.POINTS_MOTIVE_DISCOVERED : 0;
}

/** Punkte für ein Feature: erkanntes CUPRA-Feature plus gültiges Feature-Motiv-Paar (D3). */
export function pointsForFeature(e: FeatureEvaluation): number {
  let p = 0;
  if (e.featureId) p += WS_CONFIG.POINTS_FEATURE_RECOGNIZED;
  if (e.featureId && e.pairValid) p += WS_CONFIG.POINTS_FEATURE_PAIR;
  return p;
}

/** Maximum einer Comp-II-Runde: alle Motive der Persona plus alle Features. */
export function maxPointsPerRound2(config: Comp2Config, round: number): number {
  const motives = config.rounds[round]?.persona.motives.length ?? 0;
  return (
    Math.min(motives, config.interviewQuestions) * WS_CONFIG.POINTS_MOTIVE_DISCOVERED +
    WS_CONFIG.FEATURES_PER_ROUND * (WS_CONFIG.POINTS_FEATURE_RECOGNIZED + WS_CONFIG.POINTS_FEATURE_PAIR)
  );
}

/** Ist das Paar Feature/Motiv im Modell hinterlegt? */
export function isValidPair(config: Comp2Config, featureId: string, motiveId: string): boolean {
  return config.features.find((f) => f.id === featureId)?.motiveIds.includes(motiveId) ?? false;
}

/**
 * Zusammenfassung nach Motiv (US-5): alle Feature-Nennungen aller Teilnehmer,
 * gruppiert nach dem zugeordneten Motiv, innerhalb des Motivs nach Häufigkeit.
 * Erkannte Features werden über ihre ID zusammengefasst, unerkannte über den Text.
 */
export function clusterFeaturesByMotive(config: Comp2Config, features: ScoredFeature[]): MotiveCluster[] {
  return config.motives.map((m) => {
    const mine = features.filter((f) => f.evaluation.motiveId === m.id);
    const buckets = new Map<string, { featureId: string | null; text: string; count: number }>();
    for (const f of mine) {
      const key = f.evaluation.featureId ?? `text:${f.text.trim().toLowerCase()}`;
      const text = f.evaluation.featureId ? config.features.find((x) => x.id === f.evaluation.featureId)?.text ?? f.text : f.text;
      const b = buckets.get(key);
      if (b) b.count += 1;
      else buckets.set(key, { featureId: f.evaluation.featureId, text, count: 1 });
    }
    const items = [...buckets.values()].sort((a, b) => b.count - a.count);
    return { motiveId: m.id, items, total: mine.length };
  });
}
