import { describe, expect, it } from "vitest";
import demo2 from "@/data/config/demo2.json";
import { getConfig } from "@/data/config";
import { parseWorkshopConfig } from "../configSchema";
import { clusterFeaturesByMotive, isValidPair, maxPointsPerRound2, pointsForFeature, pointsForInterviewTurn } from "../scoring";
import type { Comp2Config, ScoredFeature } from "../types";

const cfg = getConfig("demo2") as Comp2Config;

describe("Competitor II Konfiguration", () => {
  it("ist gültig und vom Typ competitor-2", () => {
    expect(cfg.type).toBe("competitor-2");
    expect(cfg.rounds).toHaveLength(2);
    expect(cfg.interviewQuestions).toBe(3);
  });
  it("jedes Feature zahlt auf mindestens zwei Motive ein (many-to-many)", () => {
    cfg.features.forEach((f) => expect(f.motiveIds.length).toBeGreaterThanOrEqual(2));
  });
  it("erkennt unbekannte Motive in Features und Personas", () => {
    const broken = structuredClone(demo2);
    broken.features[0].motiveIds.push("m-unknown");
    broken.rounds[0].persona.motives[0].motiveId = "m-nope";
    expect(() => parseWorkshopConfig(broken)).toThrow(/Unbekanntes Motiv/);
  });
  it("erkennt doppelte Motive bei einer Persona", () => {
    const broken = structuredClone(demo2);
    broken.rounds[0].persona.motives[1].motiveId = broken.rounds[0].persona.motives[0].motiveId;
    expect(() => parseWorkshopConfig(broken)).toThrow(/doppelt/);
  });
});

describe("Competitor II Scoring", () => {
  it("Interview: ein Punkt pro aufgedecktem Motiv, sonst null", () => {
    expect(pointsForInterviewTurn("m-joy")).toBe(1);
    expect(pointsForInterviewTurn(null)).toBe(0);
  });
  it("Feature: erkannt plus gültiges Paar", () => {
    expect(pointsForFeature({ featureId: "f-seats", motiveId: "m-joy", pairValid: true })).toBe(2);
    expect(pointsForFeature({ featureId: "f-seats", motiveId: "m-standout", pairValid: false })).toBe(1);
    expect(pointsForFeature({ featureId: null, motiveId: "m-joy", pairValid: false })).toBe(0);
  });
  it("isValidPair prüft gegen das Modell", () => {
    expect(isValidPair(cfg, "f-seats", "m-joy")).toBe(true);
    expect(isValidPair(cfg, "f-seats", "m-premium")).toBe(true);
    expect(isValidPair(cfg, "f-seats", "m-standout")).toBe(false);
    expect(isValidPair(cfg, "f-nope", "m-joy")).toBe(false);
  });
  it("Rundenmaximum: Motive der Persona (max. Fragenzahl) plus Features", () => {
    // Persona 1 hat 3 Motive, 3 Fragen, 3 Features à 2 Punkte
    expect(maxPointsPerRound2(cfg, 0)).toBe(3 + 6);
  });
  it("clustert Nennungen nach Motiv und fasst gleiche Features zusammen", () => {
    const f = (featureId: string | null, motiveId: string, text: string): ScoredFeature => ({
      round: 0,
      idx: 0,
      text,
      evaluation: { featureId, motiveId, pairValid: Boolean(featureId) },
      feedback: "",
      points: 0,
      scorer: "keyword",
    });
    const clusters = clusterFeaturesByMotive(cfg, [
      f("f-seats", "m-joy", "the seats"),
      f("f-seats", "m-joy", "sport seats!"),
      f("f-sound", "m-joy", "sennheiser"),
      f(null, "m-premium", "the smell"),
    ]);
    const joy = clusters.find((c) => c.motiveId === "m-joy")!;
    expect(joy.total).toBe(3);
    expect(joy.items[0]).toMatchObject({ featureId: "f-seats", count: 2 });
    expect(clusters.find((c) => c.motiveId === "m-premium")!.items[0].text).toBe("the smell");
    expect(clusters.find((c) => c.motiveId === "m-design")!.total).toBe(0);
  });
});
