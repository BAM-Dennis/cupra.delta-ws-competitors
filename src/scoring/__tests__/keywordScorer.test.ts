import { describe, expect, it } from "vitest";
import { getConfig } from "@/data/config";
import { pointsForArgument } from "@/engine/scoring";
import { evaluateByKeywords, keywordScorer } from "../keywordScorer";

const config = getConfig("demo");

describe("keywordScorer", () => {
  it("erkennt Need und Differenzierer in Runde 1 (Lena vs R5)", () => {
    const { evaluation } = evaluateByKeywords(
      config,
      0,
      "With up to 450 km WLTP range the CUPRA gets Lena to the coast and back without charging anxiety.",
    );
    expect(evaluation).toMatchObject({ addressesNeed: true, namesDifferentiator: true, differentiatorId: "d-range", isKeyDifferentiator: true });
    expect(pointsForArgument(evaluation)).toBe(3);
  });
  it("ignoriert Differenzierer, die nicht gegen diesen Wettbewerber gelten", () => {
    // d-seats gilt nur gegen MINI, Runde 1 ist gegen R5
    const { evaluation } = evaluateByKeywords(config, 0, "The bucket seats are great value.");
    expect(evaluation.differentiatorId).not.toBe("d-seats");
  });
  it("wertet dieselbe Formulierung immer gleich", async () => {
    const text = "Fast charging 10-80 in under 30 minutes means no long lunch breaks at the charger.";
    const a = await keywordScorer.scoreArgument({ config, round: 0, idx: 0, text });
    const b = await keywordScorer.scoreArgument({ config, round: 0, idx: 1, text });
    expect(a.evaluation).toEqual(b.evaluation);
    expect(pointsForArgument(a.evaluation)).toBe(2);
  });
  it("gibt coachendes Feedback bei leerem Treffer", async () => {
    const { evaluation, feedback } = await keywordScorer.scoreArgument({ config, round: 1, idx: 0, text: "It is a nice car." });
    expect(pointsForArgument(evaluation)).toBe(0);
    expect(feedback).toMatch(/bridge/i);
  });
  it("erkennt in Runde 2 (Marc vs MINI) den Preis-Differenzierer", () => {
    const { evaluation } = evaluateByKeywords(config, 1, "You get sport seats and a driver-focused interior for less money than the MINI.");
    expect(evaluation).toMatchObject({ differentiatorId: "d-seats", addressesNeed: true });
  });
});
