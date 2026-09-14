"use client";

import { WS_CONFIG } from "@/engine/config";
import type { Comp2Config, MotiveCluster } from "@/engine/types";
import type { DemoProgress } from "@/lib/demoData";
import { Bar, Chip, Glyph } from "../shared/bits";

const H = "text-[44px] font-light leading-none";
const SUB = "text-[18px] leading-[1.4] text-white/70";

function RoundTag({ round, total }: { round: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      <Chip tone="teal" className="!text-[13px] !px-4 !py-1.5">
        Round {round + 1} of {total}
      </Chip>
      <Glyph name="spark" className="size-4 text-copper-light" />
    </div>
  );
}

/* ---------------- Persona-Vorstellung: Motive bleiben verdeckt ---------------- */

export function PersonaIntroView({ config, round }: { config: Comp2Config; round: number }) {
  const r = config.rounds[round];
  const competitor = config.brands.find((b) => b.id === r.competitorBrandId);
  const cupra = config.brands.find((b) => b.isCupra);
  return (
    <div className="grid flex-1 grid-cols-[1.1fr_1fr] gap-16">
      <div className="flex flex-col gap-6">
        <RoundTag round={round} total={config.rounds.length} />
        <div className="flex items-center gap-6">
          <div className="flex size-24 items-center justify-center rounded-full bg-copper-gradient text-[40px] font-medium">{r.persona.name[0]}</div>
          <div>
            <h1 className={H}>{r.persona.name}</h1>
            {r.persona.tagline && <p className="mt-2 text-[20px] text-white/60">{r.persona.tagline}</p>}
          </div>
        </div>
        <p className="text-[22px] leading-[1.45] text-white/85">“{r.persona.intro}”</p>
        <div className="mt-auto flex items-center gap-4 text-[22px]">
          <span className="font-medium">{cupra?.name}</span>
          <span className="text-white/40">vs</span>
          <span className="font-medium">{competitor?.name}</span>
        </div>
      </div>
      <div className="flex flex-col justify-center gap-6">
        <span className="text-[13px] font-medium uppercase tracking-[3px] text-teal">The interview</span>
        <p className="text-[26px] leading-[1.35]">
          {r.persona.name} has <span className="font-medium">{r.persona.motives.length} emotional motives</span>. You have <span className="font-medium">{config.interviewQuestions} open questions</span> to uncover them.
        </p>
        <div className="flex gap-3">
          {r.persona.motives.map((m) => (
            <span key={m.motiveId} className="flex h-20 flex-1 items-center justify-center rounded-[10px] border border-dashed border-white/25 text-[13px] uppercase tracking-[2px] text-white/40">
              hidden
            </span>
          ))}
        </div>
        <p className={SUB}>Open questions open people. Why, how, what. A yes-or-no question earns a polite nudge and nothing else.</p>
      </div>
    </div>
  );
}

/* ---------------- Interview-Fortschritt ---------------- */

export function InterviewProgressView({ config, round, progress }: { config: Comp2Config; round: number; progress: DemoProgress }) {
  const r = config.rounds[round];
  return (
    <div className="grid flex-1 grid-cols-[1fr_1.2fr] gap-16">
      <div className="flex flex-col gap-6">
        <RoundTag round={round} total={config.rounds.length} />
        <h1 className={H}>
          Interview
          <br />
          with <span className="font-medium">{r.persona.name}</span>.
        </h1>
        <p className={SUB}>Ask open questions on your phone. {r.persona.name} answers in character and lets slip what really matters when you hit the right topic.</p>
        <div className="mt-auto flex flex-col gap-3 rounded-[10px] border border-teal/30 bg-teal/10 p-6">
          <span className="text-[13px] font-medium uppercase tracking-[2px] text-teal">Scoring</span>
          <p className="text-[18px] leading-[1.4]">One point per uncovered motive. At most one motive per question. Closed questions uncover nothing.</p>
        </div>
      </div>
      <div className="flex flex-col justify-center gap-8">
        {Array.from({ length: config.interviewQuestions }, (_, i) => {
          const n = progress.questionsAsked[i] ?? 0;
          return (
            <div key={i} className="flex flex-col gap-3">
              <div className="flex items-end justify-between">
                <span className="text-[22px]">Question {i + 1}</span>
                <span className="text-[28px] tabular-nums">
                  {n} <span className="text-[16px] text-white/50">/ {progress.participants}</span>
                </span>
              </div>
              <Bar value={n / progress.participants} className="!h-3" tone={i === config.interviewQuestions - 1 ? "teal" : "copper"} />
            </div>
          );
        })}
        <div className="flex items-center justify-between rounded-[8px] bg-white/5 px-6 py-4 text-[20px]">
          <span className="text-white/70">Motives uncovered on average</span>
          <span className="tabular-nums">
            {progress.avgMotivesDiscovered} <span className="text-[16px] text-white/50">/ {r.persona.motives.length}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Motiv-Reveal ---------------- */

export function MotivesView({ config, round }: { config: Comp2Config; round: number }) {
  const r = config.rounds[round];
  return (
    <div className="flex flex-1 flex-col gap-8 animate-reveal">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-4">
          <RoundTag round={round} total={config.rounds.length} />
          <h1 className={H}>
            What really drives <span className="font-medium">{r.persona.name}</span>.
          </h1>
        </div>
        <p className="max-w-[480px] text-right text-[18px] text-white/60">Check your phone: which of these did you uncover?</p>
      </div>
      <div className="grid flex-1 gap-4" style={{ gridTemplateColumns: `repeat(${r.persona.motives.length}, minmax(0, 1fr))` }}>
        {r.persona.motives.map((pm, i) => {
          const m = config.motives.find((x) => x.id === pm.motiveId);
          return (
            <div key={pm.motiveId} className="flex flex-col gap-4 rounded-[10px] border border-copper/50 bg-copper/10 p-6" style={{ animationDelay: `${i * 0.12}s` }}>
              <span className="text-[13px] font-medium uppercase tracking-[2px] text-copper-light">Motive {i + 1}</span>
              <h2 className="text-[26px] font-medium leading-tight">{m?.label}</h2>
              <p className="text-[16px] leading-[1.4] text-white/75">{m?.description}</p>
              <p className="mt-auto text-[17px] italic leading-[1.4]">“{pm.revealLine}”</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Feature-Fortschritt ---------------- */

export function FeaturesProgressView({ config, round, progress }: { config: Comp2Config; round: number; progress: DemoProgress }) {
  const r = config.rounds[round];
  const competitor = config.brands.find((b) => b.id === r.competitorBrandId);
  const motives = r.persona.motives.map((pm) => config.motives.find((m) => m.id === pm.motiveId)?.label ?? pm.motiveId);
  return (
    <div className="grid flex-1 grid-cols-[1fr_1.2fr] gap-16">
      <div className="flex flex-col gap-6">
        <RoundTag round={round} total={config.rounds.length} />
        <h1 className={H}>
          Top {WS_CONFIG.FEATURES_PER_ROUND} features
          <br />
          for <span className="font-medium">{r.persona.name}</span>.
        </h1>
        <p className={SUB}>Which CUPRA features beat the {competitor?.name} on {r.persona.name}&apos;s motives? Name the feature, pick the motive.</p>
        <div className="flex flex-wrap gap-2">
          {motives.map((m) => (
            <Chip key={m} tone="copper" className="!text-[13px] !px-4 !py-1.5">
              {m}
            </Chip>
          ))}
        </div>
        <div className="mt-auto flex flex-col gap-3 rounded-[10px] border border-teal/30 bg-teal/10 p-6">
          <span className="text-[13px] font-medium uppercase tracking-[2px] text-teal">A valid pair</span>
          <p className="text-[18px] leading-[1.4]">A real CUPRA feature, matched to a motive it genuinely serves. The same feature can serve more than one motive.</p>
        </div>
      </div>
      <div className="flex flex-col justify-center gap-8">
        {Array.from({ length: WS_CONFIG.FEATURES_PER_ROUND }, (_, i) => {
          const n = progress.argumentsSubmitted[i] ?? 0;
          return (
            <div key={i} className="flex flex-col gap-3">
              <div className="flex items-end justify-between">
                <span className="text-[22px]">Feature {i + 1}</span>
                <span className="text-[28px] tabular-nums">
                  {n} <span className="text-[16px] text-white/50">/ {progress.participants}</span>
                </span>
              </div>
              <Bar value={n / progress.participants} className="!h-3" tone={i === WS_CONFIG.FEATURES_PER_ROUND - 1 ? "teal" : "copper"} />
            </div>
          );
        })}
        <div className="flex items-center justify-between rounded-[8px] bg-white/5 px-6 py-4 text-[20px]">
          <span className="text-white/70">Finished the round</span>
          <span className="tabular-nums">
            {progress.roundFinished} <span className="text-[16px] text-white/50">/ {progress.participants}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Zusammenfassung nach Motiv (US-5) ---------------- */

export function SummaryView({ config, clusters }: { config: Comp2Config; clusters: MotiveCluster[] }) {
  const max = Math.max(1, ...clusters.flatMap((c) => c.items.map((i) => i.count)));
  return (
    <div className="flex flex-1 flex-col gap-8 animate-reveal">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-4">
          <span className="text-[13px] font-medium uppercase tracking-[3px] text-teal">Summary</span>
          <h1 className={H}>
            What the room found,
            <br />
            <span className="font-medium">motive by motive.</span>
          </h1>
        </div>
        <p className="max-w-[520px] text-right text-[18px] text-white/60">All features named by all participants across both rounds, clustered by the motive they were matched to.</p>
      </div>
      <div className="grid flex-1 gap-4" style={{ gridTemplateColumns: `repeat(${clusters.length}, minmax(0, 1fr))` }}>
        {clusters.map((c) => {
          const m = config.motives.find((x) => x.id === c.motiveId);
          return (
            <div key={c.motiveId} className="glass flex flex-col gap-4 rounded-[10px] p-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-[24px] font-medium leading-tight">{m?.label}</h2>
                <span className="shrink-0 text-[28px] leading-none tabular-nums">
                  {c.total}
                  <span className="ml-1 text-[12px] uppercase tracking-[1px] text-white/50">named</span>
                </span>
              </div>
              <ul className="flex flex-col gap-3">
                {c.items.slice(0, 6).map((it) => (
                  <li key={it.featureId ?? it.text} className="flex flex-col gap-1.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className={`text-[16px] leading-[1.3] ${it.featureId ? "" : "italic text-white/60"}`}>{it.text}</span>
                      <span className="shrink-0 text-[16px] tabular-nums text-white/70">{it.count}</span>
                    </div>
                    <Bar value={it.count / max} className="!h-1.5" tone={it.featureId ? "copper" : "teal"} />
                  </li>
                ))}
                {c.items.length === 0 && <li className="text-[15px] text-white/40">Nothing named for this motive.</li>}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
