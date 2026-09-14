import { describe, expect, it } from "vitest";
import demo from "@/data/config/demo.json";
import { parseWorkshopConfig } from "../configSchema";

describe("Demo-Konfiguration", () => {
  it("ist gültig", () => {
    expect(() => parseWorkshopConfig(demo)).not.toThrow();
  });
  it("hat zwei Runden mit eigener Persona und eigenem Wettbewerber", () => {
    const cfg = parseWorkshopConfig(demo);
    expect(cfg.rounds).toHaveLength(2);
    expect(cfg.rounds[0].competitorBrandId).not.toBe(cfg.rounds[1].competitorBrandId);
    expect(cfg.rounds[0].persona.name).not.toBe(cfg.rounds[1].persona.name);
  });
  it("hat nur erkundbare Kategorien und Tell-Fakten im Outro", () => {
    const cfg = parseWorkshopConfig(demo);
    cfg.rounds.forEach((r) => expect(r.categories).toHaveLength(2));
    expect(cfg.outro?.facts.length).toBeGreaterThan(0);
    expect(cfg.differentiators.filter((d) => d.tag === "tell").length).toBe(5);
  });
  it("CUPRA steht allein in seinem Matrix-Feld", () => {
    const cfg = parseWorkshopConfig(demo);
    const cupraCell = cfg.matrix.solution.cupra;
    expect(Object.values(cfg.matrix.solution).filter((p) => p === cupraCell)).toHaveLength(1);
  });
  it("erkennt fehlende Lösungen und fremde Referenzen", () => {
    const broken = structuredClone(demo);
    Reflect.deleteProperty(broken.matrix.solution, "cupra");
    broken.rounds[0].persona.needIds.push("n-unknown");
    expect(() => parseWorkshopConfig(broken)).toThrow(/Lösung fehlt|Unbekanntes Need/);
  });
  it("verlangt genau eine CUPRA-Marke", () => {
    const broken = structuredClone(demo);
    broken.brands[1] = { ...broken.brands[1], isCupra: true };
    expect(() => parseWorkshopConfig(broken)).toThrow(/isCupra/);
  });
});
