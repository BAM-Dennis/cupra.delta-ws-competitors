import { MAX_POINTS_PER_ARGUMENT } from "@/engine/config";
import { maxPointsPerRound, pointsForArgument } from "@/engine/scoring";
import type { Differentiator, Need, WorkshopConfig } from "@/engine/types";
import type { ScoreInput, ScoreOutput, Scorer, SummaryInput } from "./types";

/**
 * Regelbasierter Scorer (Variante „vereinfacht“ aus dem Briefing).
 * Deterministisch, läuft ohne API-Key. Erkennt nur, was in den keywords
 * der Konfiguration gepflegt ist. Dient im Prototyp und später als Fallback.
 */

function normalize(s: string): string {
  return ` ${s
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9äöüß%\-–\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;
}

function hits(text: string, keywords: string[] | undefined): number {
  if (!keywords) return 0;
  return keywords.filter((k) => text.includes(normalize(k).trim())).length;
}

function best<T extends { keywords?: string[] }>(text: string, items: T[]): T | null {
  let top: T | null = null;
  let topHits = 0;
  for (const item of items) {
    const h = hits(text, item.keywords);
    if (h > topHits) {
      top = item;
      topHits = h;
    }
  }
  return top;
}

export function evaluateByKeywords(config: WorkshopConfig, round: number, text: string) {
  const r = config.rounds[round];
  const norm = normalize(text);
  const personaNeeds: Need[] = config.needs.filter((n) => r.persona.needIds.includes(n.id));
  // Nur erkundbare (show) Differenzierer gegen genau diesen Wettbewerber zählen
  const relevantDiffs: Differentiator[] = config.differentiators.filter(
    (d) => d.tag !== "tell" && d.vsBrandIds.includes(r.competitorBrandId),
  );

  const diff = best(norm, relevantDiffs);
  let need = best(norm, personaNeeds);
  // Ein erkannter Differenzierer impliziert ein Need, wenn er eins der Persona bedient
  if (!need && diff) {
    need = personaNeeds.find((n) => diff.needIds.includes(n.id)) ?? null;
  }

  return {
    need,
    diff,
    evaluation: {
      addressesNeed: Boolean(need),
      needId: need?.id ?? null,
      namesDifferentiator: Boolean(diff),
      differentiatorId: diff?.id ?? null,
      isKeyDifferentiator: Boolean(diff?.key),
    },
  };
}

function feedbackFor(config: WorkshopConfig, round: number, r: ReturnType<typeof evaluateByKeywords>): string {
  const persona = config.rounds[round].persona.name;
  const competitor = config.brands.find((b) => b.id === config.rounds[round].competitorBrandId)?.name ?? "the competitor";
  const { need, diff } = r;

  if (need && diff && diff.key) {
    return `Strong. You connect a decisive CUPRA advantage to what ${persona} actually needs. That is exactly the bridge a customer remembers.`;
  }
  if (need && diff) {
    return `Good bridge: a real CUPRA advantage over the ${competitor}, tied to ${persona}'s need. Could you make the benefit for ${persona} even more concrete?`;
  }
  if (diff && !need) {
    return `You name a real CUPRA advantage, but it is not yet linked to one of ${persona}'s needs. Ask yourself: why does this matter to ${persona}?`;
  }
  if (need && !diff) {
    return `You are close to what ${persona} cares about. Now add the specific CUPRA feature that beats the ${competitor} on exactly this point.`;
  }
  return `Think of it as a bridge: start from one of ${persona}'s needs, then name the concrete CUPRA advantage over the ${competitor} that serves it.`;
}

export const keywordScorer: Scorer = {
  name: "keyword",
  async scoreArgument({ config, round, text }: ScoreInput): Promise<ScoreOutput> {
    const r = evaluateByKeywords(config, round, text);
    return { evaluation: r.evaluation, feedback: feedbackFor(config, round, r) };
  },
  async summarizeRound({ config, round, arguments: args }: SummaryInput): Promise<string> {
    const persona = config.rounds[round].persona.name;
    const points = args.reduce((s, a) => s + a.points, 0);
    const max = maxPointsPerRound();
    const full = args.filter((a) => a.points === MAX_POINTS_PER_ARGUMENT).length;
    const bridges = args.filter((a) => a.evaluation.addressesNeed && a.evaluation.namesDifferentiator).length;
    if (points >= max * 0.75) {
      return `Excellent round for ${persona}: ${bridges} of ${args.length} arguments build a complete bridge from CUPRA feature to need${full ? `, ${full} with a decisive differentiator` : ""}. This is how the value proposition lands.`;
    }
    if (points >= max * 0.4) {
      return `Solid round. ${bridges} of ${args.length} arguments connect a CUPRA advantage to one of ${persona}'s needs. Sharpen the others by naming the concrete feature and why it matters to ${persona}.`;
    }
    return `A start. Most arguments stay on one side of the bridge. For ${persona}, always pair a need with the specific CUPRA advantage that serves it, and say it in one sentence.`;
  },
};

export { pointsForArgument };
