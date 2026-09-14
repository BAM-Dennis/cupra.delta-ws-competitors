import { describe, expect, it } from "vitest";
import { getConfig } from "@/data/config";
import type { Comp2Config } from "@/engine/types";
import { isOpenQuestion, keywordScorer, matchFeature } from "../keywordScorer";

const config = getConfig("demo2") as Comp2Config;

describe("Matcher A: Frage → Motiv (keyword)", () => {
  it("erkennt offene und geschlossene Fragen", () => {
    expect(isOpenQuestion("What do your colleagues drive?")).toBe(true);
    expect(isOpenQuestion("How do you want the car to feel?")).toBe(true);
    expect(isOpenQuestion("Do you like the MINI?")).toBe(false);
    expect(isOpenQuestion("Is range important?")).toBe(false);
  });
  it("deckt bei offener, passender Frage genau ein Motiv auf", async () => {
    const r = await keywordScorer.answerInterview({
      config,
      round: 0,
      idx: 0,
      question: "What do your friends and colleagues drive, and how does that feel in traffic?",
      history: [],
      discoveredMotiveIds: [],
    });
    expect(r.isOpen).toBe(true);
    expect(r.discoveredMotiveId).toBe("m-standout");
    expect(r.reply).toBe(config.rounds[0].persona.motives[0].revealLine);
  });
  it("deckt ein bereits entdecktes Motiv nicht erneut auf", async () => {
    const r = await keywordScorer.answerInterview({
      config,
      round: 0,
      idx: 1,
      question: "What do your colleagues drive?",
      history: [],
      discoveredMotiveIds: ["m-standout"],
    });
    expect(r.discoveredMotiveId).toBeNull();
    expect(r.isOpen).toBe(true);
    expect(r.reply).toMatch(/already|earlier/);
  });
  it("gibt bei geschlossener Frage einen In-Character-Stups ohne Motiv", async () => {
    const r = await keywordScorer.answerInterview({ config, round: 0, idx: 0, question: "Do you like fast cars?", history: [], discoveredMotiveIds: [] });
    expect(r.isOpen).toBe(false);
    expect(r.discoveredMotiveId).toBeNull();
    expect(config.rounds[0].persona.nudgeLines).toContain(r.reply);
  });
});

describe("Matcher B: Feature → Motiv (keyword)", () => {
  it("erkennt ein Feature und prüft das Paar", async () => {
    expect(matchFeature(config, "the copper accents on the front")?.id).toBe("f-exterior");
    const ok = await keywordScorer.scoreFeature({ config, round: 0, idx: 0, text: "The copper accents on the front", motiveId: "m-standout" });
    expect(ok.evaluation).toEqual({ featureId: "f-exterior", motiveId: "m-standout", pairValid: true });
    const wrong = await keywordScorer.scoreFeature({ config, round: 0, idx: 1, text: "The copper accents on the front", motiveId: "m-joy" });
    expect(wrong.evaluation.pairValid).toBe(false);
    expect(wrong.feedback).toMatch(/different motive/);
  });
  it("dasselbe Feature ist unter mehreren Motiven gültig", async () => {
    const a = await keywordScorer.scoreFeature({ config, round: 0, idx: 0, text: "Sport seats", motiveId: "m-joy" });
    const b = await keywordScorer.scoreFeature({ config, round: 0, idx: 1, text: "Sport seats", motiveId: "m-premium" });
    expect(a.evaluation.pairValid && b.evaluation.pairValid).toBe(true);
  });
});
