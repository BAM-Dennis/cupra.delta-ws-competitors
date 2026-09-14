import { describe, expect, it } from "vitest";
import { getConfig } from "@/data/config";
import { WS_CONFIG } from "../config";
import { maxMatrixPoints, maxPointsPerRound, pointsForArgument, scoreMatrix, totalScore } from "../scoring";
import type { Evaluation, ScoredArgument } from "../types";

const cfg = getConfig("demo");

const ev = (o: Partial<Evaluation>): Evaluation => ({
  addressesNeed: false,
  needId: null,
  namesDifferentiator: false,
  differentiatorId: null,
  isKeyDifferentiator: false,
  ...o,
});

describe("pointsForArgument", () => {
  it("zählt Need und Differenzierer je einen Punkt", () => {
    expect(pointsForArgument(ev({}))).toBe(0);
    expect(pointsForArgument(ev({ addressesNeed: true }))).toBe(1);
    expect(pointsForArgument(ev({ namesDifferentiator: true }))).toBe(1);
    expect(pointsForArgument(ev({ addressesNeed: true, namesDifferentiator: true }))).toBe(2);
  });
  it("gibt den Bonus nur mit erkanntem Differenzierer", () => {
    expect(pointsForArgument(ev({ addressesNeed: true, namesDifferentiator: true, isKeyDifferentiator: true }))).toBe(3);
    expect(pointsForArgument(ev({ isKeyDifferentiator: true }))).toBe(0);
  });
  it("Maximum pro Runde", () => {
    expect(maxPointsPerRound()).toBe(WS_CONFIG.ARGUMENTS_PER_ROUND * 3);
  });
});

describe("scoreMatrix", () => {
  it("bewertet gegen den Schlüssel, CUPRA doppelt", () => {
    const res = scoreMatrix(
      [
        { brandId: "cupra", positionId: cfg.matrix.solution.cupra },
        { brandId: "mini", positionId: cfg.matrix.solution.mini },
        { brandId: "renault-5", positionId: "p-rat-chal" },
      ],
      cfg.matrix,
      cfg.brands,
    );
    expect(res.map((r) => r.points)).toEqual([2, 1, 0]);
    expect(res[2].correct).toBe(false);
    expect(res[2].solutionPositionId).toBe(cfg.matrix.solution["renault-5"]);
  });
  it("Maximum: alle Marken plus CUPRA-Bonus", () => {
    expect(maxMatrixPoints(cfg.brands)).toBe(cfg.brands.length + 1);
  });
});

describe("totalScore", () => {
  it("summiert Argumente und Matrix", () => {
    const args: ScoredArgument[] = [
      { round: 0, idx: 0, text: "", evaluation: ev({}), feedback: "", points: 2, scorer: "keyword" },
      { round: 1, idx: 0, text: "", evaluation: ev({}), feedback: "", points: 3, scorer: "keyword" },
    ];
    const matrix = scoreMatrix([{ brandId: "cupra", positionId: cfg.matrix.solution.cupra }], cfg.matrix, cfg.brands);
    expect(totalScore(args, matrix)).toBe(7);
  });
});
