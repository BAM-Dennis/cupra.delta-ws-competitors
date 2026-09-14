import { WS_CONFIG } from "./config";
import type { Brand, Evaluation, MatrixConfig, Placement, PlacementResult, ScoredArgument } from "./types";

/** Punkte für ein Argument aus den binären Kriterien (Briefing Abschnitt 7). */
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
