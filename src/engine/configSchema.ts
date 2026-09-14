import { z } from "zod";
import type { WorkshopConfig } from "./types";

const id = z.string().min(1);

/* ---------------- gemeinsam ---------------- */

const brandSchema = z.object({
  id,
  name: z.string().min(1),
  short: z.string().optional(),
  isCupra: z.boolean().optional(),
  present: z.boolean(),
});

const categorySchema = z.object({ id, title: z.string().min(1), prompts: z.array(z.string().min(1)).min(1) });

const baseShape = {
  id,
  market: z.string(),
  workshopRef: z.string(),
  language: z.string(),
  title: z.string(),
  brands: z.array(brandSchema).min(2),
};

/* ---------------- Competitor I ---------------- */

const needSchema = z.object({ id, text: z.string().min(1), keywords: z.array(z.string()).optional() });

const differentiatorSchema = z.object({
  id,
  text: z.string().min(1),
  vsBrandIds: z.array(id).min(1),
  needIds: z.array(id).min(1),
  key: z.boolean().optional(),
  keywords: z.array(z.string()).optional(),
});

const roundSchema = z.object({
  id,
  competitorBrandId: id,
  persona: z.object({
    name: z.string().min(1),
    tagline: z.string().optional(),
    description: z.string().min(1),
    needIds: z.array(id).min(1),
  }),
  categories: z.array(categorySchema).min(1),
});

const axis = z.object({ label: z.string(), low: z.string(), high: z.string() });

const comp1Schema = z.object({
  ...baseShape,
  type: z.literal("competitor-1"),
  needs: z.array(needSchema).min(1),
  differentiators: z.array(differentiatorSchema).min(1),
  rounds: z.array(roundSchema).min(1),
  matrix: z.object({
    axes: z.object({ x: axis, y: axis }),
    positions: z.array(z.object({ id, label: z.string(), x: z.number().int().min(0), y: z.number().int().min(0) })).min(2),
    solution: z.record(z.string(), z.string()),
  }),
});

/* ---------------- Competitor II ---------------- */

const motiveSchema = z.object({ id, label: z.string().min(1), description: z.string().min(1) });

const personaMotiveSchema = z.object({
  motiveId: id,
  topics: z.array(z.string().min(1)).min(1),
  revealLine: z.string().min(1),
  keywords: z.array(z.string()).optional(),
});

const round2Schema = z.object({
  id,
  competitorBrandId: id,
  persona: z.object({
    name: z.string().min(1),
    tagline: z.string().optional(),
    intro: z.string().min(1),
    background: z.string().optional(),
    motives: z.array(personaMotiveSchema).min(1),
    nudgeLines: z.array(z.string().min(1)).min(1),
  }),
  categories: z.array(categorySchema).min(1),
});

const featureSchema = z.object({
  id,
  text: z.string().min(1),
  motiveIds: z.array(id).min(1),
  keywords: z.array(z.string()).optional(),
});

const comp2Schema = z.object({
  ...baseShape,
  type: z.literal("competitor-2"),
  interviewQuestions: z.number().int().min(1).max(6),
  motives: z.array(motiveSchema).min(1),
  features: z.array(featureSchema).min(1),
  rounds: z.array(round2Schema).min(1),
});

/* ---------------- Union plus Referenzprüfung ---------------- */

export const workshopConfigSchema = z.discriminatedUnion("type", [comp1Schema, comp2Schema]).superRefine((cfg, ctx) => {
  const brandIds = new Set(cfg.brands.map((b) => b.id));

  if (cfg.brands.filter((b) => b.isCupra).length !== 1) {
    ctx.addIssue({ code: "custom", path: ["brands"], message: "Genau eine Marke muss isCupra sein" });
  }
  cfg.rounds.forEach((r, i) => {
    if (!brandIds.has(r.competitorBrandId)) {
      ctx.addIssue({ code: "custom", path: ["rounds", i, "competitorBrandId"], message: `Unbekannte Marke ${r.competitorBrandId}` });
    }
  });

  if (cfg.type === "competitor-1") {
    const needIds = new Set(cfg.needs.map((n) => n.id));
    const posIds = new Set(cfg.matrix.positions.map((p) => p.id));
    cfg.differentiators.forEach((d, i) => {
      d.vsBrandIds.forEach((b) => {
        if (!brandIds.has(b)) ctx.addIssue({ code: "custom", path: ["differentiators", i, "vsBrandIds"], message: `Unbekannte Marke ${b}` });
      });
      d.needIds.forEach((n) => {
        if (!needIds.has(n)) ctx.addIssue({ code: "custom", path: ["differentiators", i, "needIds"], message: `Unbekanntes Need ${n}` });
      });
    });
    cfg.rounds.forEach((r, i) => {
      r.persona.needIds.forEach((n) => {
        if (!needIds.has(n)) ctx.addIssue({ code: "custom", path: ["rounds", i, "persona", "needIds"], message: `Unbekanntes Need ${n}` });
      });
    });
    cfg.brands.forEach((b) => {
      const sol = cfg.matrix.solution[b.id];
      if (!sol) ctx.addIssue({ code: "custom", path: ["matrix", "solution", b.id], message: "Lösung fehlt" });
      else if (!posIds.has(sol)) ctx.addIssue({ code: "custom", path: ["matrix", "solution", b.id], message: `Unbekannte Position ${sol}` });
    });
  } else {
    const motiveIds = new Set(cfg.motives.map((m) => m.id));
    cfg.features.forEach((f, i) => {
      f.motiveIds.forEach((m) => {
        if (!motiveIds.has(m)) ctx.addIssue({ code: "custom", path: ["features", i, "motiveIds"], message: `Unbekanntes Motiv ${m}` });
      });
    });
    cfg.rounds.forEach((r, i) => {
      const seen = new Set<string>();
      r.persona.motives.forEach((pm, j) => {
        if (!motiveIds.has(pm.motiveId)) ctx.addIssue({ code: "custom", path: ["rounds", i, "persona", "motives", j], message: `Unbekanntes Motiv ${pm.motiveId}` });
        if (seen.has(pm.motiveId)) ctx.addIssue({ code: "custom", path: ["rounds", i, "persona", "motives", j], message: `Motiv ${pm.motiveId} doppelt` });
        seen.add(pm.motiveId);
      });
    });
  }
});

export function parseWorkshopConfig(input: unknown): WorkshopConfig {
  return workshopConfigSchema.parse(input) as WorkshopConfig;
}
