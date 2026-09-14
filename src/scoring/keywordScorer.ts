import { MAX_POINTS_PER_ARGUMENT, MAX_POINTS_PER_FEATURE } from "@/engine/config";
import { isValidPair, maxPointsPerRound, maxPointsPerRound2, pointsForArgument } from "@/engine/scoring";
import type { Comp1Config, Comp2Config, Differentiator, FeatureDef, Need, PersonaMotive } from "@/engine/types";
import type {
  FeatureInput,
  FeatureOutput,
  InterviewInput,
  InterviewOutput,
  ScoreInput,
  ScoreOutput,
  Scorer,
  Summary2Input,
  SummaryInput,
} from "./types";

/**
 * Regelbasierter Scorer (Variante „vereinfacht“ aus beiden Briefings).
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

/* ====================================================================== */
/* Competitor I                                                            */
/* ====================================================================== */

export function evaluateByKeywords(config: Comp1Config, round: number, text: string) {
  const r = config.rounds[round];
  const norm = normalize(text);
  const personaNeeds: Need[] = config.needs.filter((n) => r.persona.needIds.includes(n.id));
  const relevantDiffs: Differentiator[] = config.differentiators.filter((d) =>
    d.vsBrandIds.includes(r.competitorBrandId),
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

function feedbackFor(config: Comp1Config, round: number, r: ReturnType<typeof evaluateByKeywords>): string {
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

/* ====================================================================== */
/* Competitor II, Matcher A: Frage → Motiv                                  */
/* ====================================================================== */

/** Offene Frage? Heuristik über Fragewörter und geschlossene Einstiege. */
const OPEN_STARTS = ["what", "how", "why", "tell", "describe", "which", "when", "where", "who", "in what", "explain", "walk me"];
const CLOSED_STARTS = ["do you", "are you", "is ", "did you", "have you", "would you", "can you", "could you", "will you", "does ", "was ", "were you", "should "];

export function isOpenQuestion(question: string): boolean {
  const q = question.trim().toLowerCase();
  if (q.length < 6) return false;
  if (OPEN_STARTS.some((s) => q.startsWith(s))) return true;
  if (CLOSED_STARTS.some((s) => q.startsWith(s))) return false;
  // "You said X, ... why?" o. ä.: enthält ein Fragewort im Satz
  return /\b(what|how|why|which|describe|tell me)\b/.test(q);
}

/**
 * Bester Treffer über alle Motive der Persona. Ist er schon entdeckt, wird kein
 * schwächerer Zweittreffer nachgeschoben (Fairness-Regel: nur klare Treffer decken auf).
 */
export function matchMotive(
  config: Comp2Config,
  round: number,
  question: string,
  discovered: string[],
): { motive: PersonaMotive | null; alreadyDiscovered: boolean } {
  const persona = config.rounds[round].persona;
  const top = best(normalize(question), persona.motives);
  if (!top) return { motive: null, alreadyDiscovered: false };
  if (discovered.includes(top.motiveId)) return { motive: null, alreadyDiscovered: true };
  return { motive: top, alreadyDiscovered: false };
}

function pick<T>(items: T[], seed: number): T {
  return items[Math.abs(seed) % items.length];
}

async function answerInterview({ config, round, idx, question, discoveredMotiveIds }: InterviewInput): Promise<InterviewOutput> {
  const persona = config.rounds[round].persona;
  const open = isOpenQuestion(question);
  if (!open) {
    return { reply: pick(persona.nudgeLines, idx), isOpen: false, discoveredMotiveId: null };
  }
  const { motive, alreadyDiscovered } = matchMotive(config, round, question, discoveredMotiveIds);
  if (motive) {
    return { reply: motive.revealLine, isOpen: true, discoveredMotiveId: motive.motiveId };
  }
  // Offen, aber trifft kein (weiteres) Motiv: in-character, ohne Motive zu erfinden
  const alreadyAll = persona.motives.every((m) => discoveredMotiveIds.includes(m.motiveId));
  const reply = alreadyAll
    ? `Good question. I think you've already got a pretty clear picture of what matters to me, to be honest.`
    : alreadyDiscovered
      ? pick(
          [
            `We talked about that already, didn't we? There's more to me than that one thing.`,
            `I think I gave that away earlier. Ask me about something else that might matter to me.`,
          ],
          idx,
        )
      : pick(
        [
          `Fair question. I'd have to think about that one. There's something else that matters more to me though, if you dig a little.`,
          `Hm, that's not really what keeps me up at night. Ask me about how I want to feel with the car, or about the people around me.`,
          `I could talk about that, but it's not the heart of it for me. Try a different angle.`,
        ],
        idx,
      );
  return { reply, isOpen: true, discoveredMotiveId: null };
}

/* ====================================================================== */
/* Competitor II, Matcher B: Feature → Motiv                                */
/* ====================================================================== */

export function matchFeature(config: Comp2Config, text: string): FeatureDef | null {
  return best(normalize(text), config.features);
}

async function scoreFeature({ config, text, motiveId }: FeatureInput): Promise<FeatureOutput> {
  const feature = matchFeature(config, text);
  const motive = config.motives.find((m) => m.id === motiveId);
  const pairValid = feature ? isValidPair(config, feature.id, motiveId) : false;
  const evaluation = { featureId: feature?.id ?? null, motiveId, pairValid };

  let feedback: string;
  if (feature && pairValid) {
    feedback = `Yes. "${feature.text}" speaks directly to ${motive?.label.toLowerCase() ?? "this motive"}. That is a feature the customer will feel, not just hear about.`;
  } else if (feature && !pairValid) {
    const fits = config.motives.filter((m) => feature.motiveIds.includes(m.id)).map((m) => m.label.toLowerCase());
    feedback = `A real CUPRA feature, but it pays into a different motive. Think about which feeling it triggers: this one is more about ${fits.join(" or ")}.`;
  } else {
    feedback = `I can't map that to a CUPRA feature from the car in front of you. Name something concrete you saw or touched, then say which motive it serves.`;
  }
  return { evaluation, feedback };
}

/* ====================================================================== */
/* Scorer                                                                  */
/* ====================================================================== */

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

  answerInterview,
  scoreFeature,

  async summarizeRound2({ config, round, interviews, features }: Summary2Input): Promise<string> {
    const persona = config.rounds[round].persona;
    const discovered = interviews.filter((t) => t.discoveredMotiveId).length;
    const total = persona.motives.length;
    const valid = features.filter((f) => f.evaluation.pairValid).length;
    const full = features.filter((f) => f.points === MAX_POINTS_PER_FEATURE).length;
    const points = interviews.reduce((s, t) => s + t.points, 0) + features.reduce((s, f) => s + f.points, 0);
    const max = maxPointsPerRound2(config, round);
    const opener =
      discovered === total
        ? `You uncovered all ${total} of ${persona.name}'s motives in the interview.`
        : discovered > 0
          ? `You uncovered ${discovered} of ${total} motives in the interview; open questions about feelings and people around ${persona.name} would have opened the rest.`
          : `The interview stayed on the surface: no motive came out. Open questions (why, how, what) are the key.`;
    const closer =
      valid === features.length && features.length > 0
        ? `All ${valid} features you named pay into the motive you chose${full ? "" : ""}. That is the emotional bridge.`
        : valid > 0
          ? `${valid} of ${features.length} feature-motive pairs are valid. For the others, ask which feeling the feature actually triggers.`
          : `None of the features landed on a valid motive yet. Start from the feeling, then find the feature that creates it.`;
    return `${opener} ${closer} ${points} of ${max} points this round.`;
  },
};

export { pointsForArgument };
