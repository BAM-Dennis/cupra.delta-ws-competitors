import { describe, expect, it } from "vitest";
import { getConfig } from "@/data/config";
import { pointsForArgument } from "@/engine/scoring";
import { evaluateByKeywords, keywordScorer } from "../keywordScorer";

const config = getConfig("demo");

describe("keywordScorer", () => {
  it("erkennt Need und Differenzierer in Runde 1 (Paula vs Volvo EX30)", () => {
    const { evaluation } = evaluateByKeywords(
      config,
      0,
      "The 441-litre boot with the flat load floor swallows the buggy and the weekly shop, the EX30 can't.",
    );
    expect(evaluation).toMatchObject({ addressesNeed: true, needId: "n-family-kit", namesDifferentiator: true, differentiatorId: "d-boot", isKeyDifferentiator: true });
    expect(pointsForArgument(evaluation)).toBe(3);
  });
  it("ignoriert Tell-Differenzierer im Scoring", () => {
    // Reichweite ist Tell und gehört in den Trainer-Outro
    const { evaluation } = evaluateByKeywords(config, 0, "Up to 446 km WLTP range so Paula never worries.");
    expect(evaluation.differentiatorId).not.toBe("d-range");
    expect(evaluation.namesDifferentiator).toBe(false);
  });
  it("ignoriert Differenzierer, die nicht gegen diesen Wettbewerber gelten", () => {
    // d-cabin gilt nicht gegen den Alfa Junior, Runde 2 ist gegen Alfa
    const { evaluation } = evaluateByKeywords(config, 1, "The long wheelbase gives real rear seat room.");
    expect(evaluation.differentiatorId).not.toBe("d-cabin");
  });
  it("wertet dieselbe Formulierung immer gleich", async () => {
    const text = "Physical buttons on the steering wheel mean Tom keeps his eyes on the road instead of fighting menus.";
    const a = await keywordScorer.scoreArgument({ config, round: 1, idx: 0, text });
    const b = await keywordScorer.scoreArgument({ config, round: 1, idx: 1, text });
    expect(a.evaluation).toEqual(b.evaluation);
    expect(a.evaluation.differentiatorId).toBe("d-controls");
    expect(pointsForArgument(a.evaluation)).toBe(2);
  });
  it("gibt coachendes Feedback bei leerem Treffer", async () => {
    const { evaluation, feedback } = await keywordScorer.scoreArgument({ config, round: 1, idx: 0, text: "It is a nice car." });
    expect(pointsForArgument(evaluation)).toBe(0);
    expect(feedback).toMatch(/bridge/i);
  });
  it("erkennt in Runde 2 (Tom vs Alfa) die Sitzposition als entscheidend", () => {
    const { evaluation } = evaluateByKeywords(config, 1, "The driver-focused seating position with proper support is not tiring after two hours.");
    expect(evaluation).toMatchObject({ differentiatorId: "d-seating", needId: "n-comfort", isKeyDifferentiator: true });
  });
});
