import { z } from "zod";
import type { WorkshopConfig } from "./types";

const id = z.string().min(1);

const brandSchema = z.object({
  id,
  name: z.string().min(1),
  short: z.string().optional(),
  isCupra: z.boolean().optional(),
  present: z.boolean(),
});

const needSchema = z.object({ id, text: z.string().min(1), keywords: z.array(z.string()).optional() });

const differentiatorSchema = z.object({
  id,
  tag: z.enum(["show", "tell"]).optional(),
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
    image: z.string().optional(),
    needIds: z.array(id).min(1),
  }),
  categories: z.array(z.object({ id, title: z.string().min(1), prompts: z.array(z.string().min(1)).min(1) })).min(1),
});

const axis = z.object({ label: z.string(), low: z.string(), high: z.string() });

export const workshopConfigSchema = z
  .object({
    id,
    market: z.string(),
    workshopRef: z.string(),
    language: z.string(),
    title: z.string(),
    brands: z.array(brandSchema).min(2),
    needs: z.array(needSchema).min(1),
    differentiators: z.array(differentiatorSchema).min(1),
    rounds: z.array(roundSchema).min(1),
    matrix: z.object({
      axes: z.object({ x: axis, y: axis }),
      positions: z.array(z.object({ id, label: z.string(), x: z.number().int().min(0), y: z.number().int().min(0) })).min(2),
      solution: z.record(z.string(), z.string()),
    }),
    outro: z.object({ title: z.string().min(1), facts: z.array(z.string().min(1)).min(1) }).optional(),
  })
  .superRefine((cfg, ctx) => {
    const brandIds = new Set(cfg.brands.map((b) => b.id));
    const needIds = new Set(cfg.needs.map((n) => n.id));
    const posIds = new Set(cfg.matrix.positions.map((p) => p.id));

    if (cfg.brands.filter((b) => b.isCupra).length !== 1) {
      ctx.addIssue({ code: "custom", path: ["brands"], message: "Genau eine Marke muss isCupra sein" });
    }
    cfg.differentiators.forEach((d, i) => {
      d.vsBrandIds.forEach((b) => {
        if (!brandIds.has(b)) ctx.addIssue({ code: "custom", path: ["differentiators", i, "vsBrandIds"], message: `Unbekannte Marke ${b}` });
      });
      d.needIds.forEach((n) => {
        if (!needIds.has(n)) ctx.addIssue({ code: "custom", path: ["differentiators", i, "needIds"], message: `Unbekanntes Need ${n}` });
      });
    });
    cfg.rounds.forEach((r, i) => {
      if (!brandIds.has(r.competitorBrandId)) {
        ctx.addIssue({ code: "custom", path: ["rounds", i, "competitorBrandId"], message: `Unbekannte Marke ${r.competitorBrandId}` });
      }
      r.persona.needIds.forEach((n) => {
        if (!needIds.has(n)) ctx.addIssue({ code: "custom", path: ["rounds", i, "persona", "needIds"], message: `Unbekanntes Need ${n}` });
      });
    });
    cfg.brands.forEach((b) => {
      const sol = cfg.matrix.solution[b.id];
      if (!sol) ctx.addIssue({ code: "custom", path: ["matrix", "solution", b.id], message: "Lösung fehlt" });
      else if (!posIds.has(sol)) ctx.addIssue({ code: "custom", path: ["matrix", "solution", b.id], message: `Unbekannte Position ${sol}` });
    });
  });

export function parseWorkshopConfig(input: unknown): WorkshopConfig {
  return workshopConfigSchema.parse(input) as WorkshopConfig;
}
