"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_POINTS_PER_FEATURE, WS_CONFIG } from "@/engine/config";
import { maxPointsPerRound2 } from "@/engine/scoring";
import type { Comp2Config, InterviewTurn, ScoredFeature } from "@/engine/types";
import { discoveredMotives, type Participant } from "@/lib/participant";
import { Bar, Chip, Glyph, PointsBadge, TypingDots } from "../shared/bits";
import { Overline, Panel, SecondaryButton } from "../shared/ui";
import { Criterion, FeedbackBubble } from "./ArgueScreen";
import { VersusCard } from "./Screens";

/* ------------------------------------------------------------------ */
/* Persona stellt sich vor (B1): Motive bleiben verdeckt               */
/* ------------------------------------------------------------------ */

export function PersonaIntroScreen({ config, round }: { config: Comp2Config; round: number }) {
  const r = config.rounds[round];
  const competitor = config.brands.find((b) => b.id === r.competitorBrandId);
  const cupra = config.brands.find((b) => b.isCupra);
  return (
    <div className="flex flex-col gap-5 pt-6">
      <Panel className="animate-fade-up">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Overline className="text-teal">Meet your customer</Overline>
            <h2 className="mt-2 text-[30px] font-light leading-none">{r.persona.name}</h2>
            {r.persona.tagline && <p className="mt-1.5 text-[13px] text-white/60">{r.persona.tagline}</p>}
          </div>
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-copper-gradient text-[22px] font-medium">{r.persona.name[0]}</div>
        </div>
        <p className="text-[15px] leading-[1.45] text-white/85">“{r.persona.intro}”</p>
      </Panel>

      <section className="flex flex-col gap-2 rounded-[8px] border border-teal/30 bg-teal/10 p-4 animate-fade-up [animation-delay:0.1s]">
        <Overline className="text-teal">Your task</Overline>
        <p className="text-[15px] leading-[1.4]">
          {r.persona.name} has <span className="font-medium">{r.persona.motives.length} emotional motives</span> for buying a car. None of them are on the table yet. In the interview you have{" "}
          <span className="font-medium">{config.interviewQuestions} open questions</span> to uncover them.
        </p>
        <div className="flex gap-1.5 pt-1">
          {r.persona.motives.map((m) => (
            <span key={m.motiveId} className="flex h-8 flex-1 items-center justify-center rounded-[6px] border border-dashed border-white/25 text-[11px] uppercase tracking-[1px] text-white/40">
              hidden
            </span>
          ))}
        </div>
      </section>

      <VersusCard cupra={cupra?.name} competitor={competitor?.name} />
      <p className="text-center text-[12px] text-white/40">The trainer opens the interview.</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Interview (US-1): offene Fragen, Persona antwortet in der Rolle     */
/* ------------------------------------------------------------------ */

interface InterviewProps {
  config: Comp2Config;
  round: number;
  me: Participant;
  onAsk: (question: string) => Promise<unknown>;
}

export function InterviewScreen({ config, round, me, onAsk }: InterviewProps) {
  const r = config.rounds[round];
  const turns = (me.interviews ?? []).filter((t) => t.round === round).sort((a, b) => a.idx - b.idx);
  const discovered = discoveredMotives(me, round);
  const total = r.persona.motives.length;
  const done = turns.length >= config.interviewQuestions;
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const trimmed = text.trim();
  const valid = trimmed.length >= WS_CONFIG.QUESTION_MIN_CHARS && trimmed.length <= WS_CONFIG.QUESTION_MAX_CHARS;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns.length, busy]);

  const ask = async () => {
    if (!valid || busy || done) return;
    setBusy(true);
    setText("");
    try {
      await onAsk(trimmed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-4 pt-5">
        <div className="flex flex-col gap-2">
          <p className="text-[14px] leading-[1.35] text-white/70">
            Ask <span className="font-medium text-white">{r.persona.name}</span> open questions. Why, how, what. Closed questions get you nowhere.
          </p>
          <div className="flex items-center gap-3">
            <Bar value={turns.length / config.interviewQuestions} tone="teal" className="flex-1" />
            <span className="text-[11px] font-medium uppercase tracking-[1px] text-white/60">
              {turns.length} of {config.interviewQuestions} questions
            </span>
          </div>
          {/* Dezentes Signal (B7): Anzahl, nicht Benennung */}
          <div className="flex items-center gap-1.5">
            {r.persona.motives.map((m, i) => (
              <span
                key={m.motiveId}
                className={`h-1.5 flex-1 rounded-full transition ${i < discovered.length ? "bg-copper-gradient shadow-glow" : "bg-white/15"}`}
              />
            ))}
            <span className="pl-1 text-[11px] uppercase tracking-[1px] text-white/50">
              {discovered.length}/{total} motives
            </span>
          </div>
        </div>

        <ol className="flex flex-col gap-4">
          {/* Persona eröffnet */}
          <li className="animate-fade-up">
            <PersonaBubble name={r.persona.name}>
              <p className="text-[14px] leading-[1.4]">{r.persona.intro}</p>
            </PersonaBubble>
          </li>
          {turns.map((t) => (
            <InterviewItem key={t.idx} turn={t} personaName={r.persona.name} />
          ))}
          {busy && (
            <li className="flex flex-col gap-2 animate-fade-up">
              <div className="max-w-[85%] self-end rounded-[12px] rounded-br-[4px] bg-copper-gradient px-4 py-3 text-[15px] opacity-60">…</div>
              <PersonaBubble name={r.persona.name}>
                <TypingDots />
              </PersonaBubble>
            </li>
          )}
        </ol>

        {done && !busy && (
          <Panel className="animate-slide-up">
            <Overline className="text-teal">Interview over</Overline>
            <p className="text-[15px] leading-[1.45]">
              You uncovered {discovered.length} of {total} motives. The trainer reveals all of them in a moment.
            </p>
          </Panel>
        )}
        <div ref={endRef} className="h-2" />
      </div>

      {!done && (
        <div className="sticky bottom-0 z-20 -mx-5 mt-auto bg-gradient-to-b from-transparent via-night/90 to-night px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-8">
          <div className="flex items-end gap-2 rounded-[8px] border border-white/25 bg-night/80 p-2 pl-4 backdrop-blur-[10px] focus-within:border-white/60">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void ask();
                }
              }}
              rows={1}
              maxLength={WS_CONFIG.QUESTION_MAX_CHARS}
              disabled={busy}
              placeholder={`Question ${turns.length + 1} for ${r.persona.name}…`}
              className="max-h-32 min-h-[40px] min-w-0 flex-1 resize-none bg-transparent py-2 text-[15px] leading-[1.35] text-white outline-none placeholder:text-white/40"
            />
            <button
              type="button"
              onClick={() => void ask()}
              disabled={!valid || busy}
              aria-label="Ask"
              className="flex size-10 shrink-0 items-center justify-center rounded-[6px] bg-copper-gradient text-white transition active:scale-95 disabled:opacity-30"
            >
              <Glyph name="arrow-right" className="size-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InterviewItem({ turn, personaName }: { turn: InterviewTurn; personaName: string }) {
  return (
    <li className="flex flex-col gap-2 animate-fade-up">
      <div className="max-w-[85%] self-end rounded-[12px] rounded-br-[4px] bg-copper-gradient px-4 py-3 text-[15px] leading-[1.35]">{turn.question}</div>
      <PersonaBubble name={personaName} highlight={Boolean(turn.discoveredMotiveId)}>
        <p className="text-[14px] leading-[1.4]">{turn.reply}</p>
        {turn.discoveredMotiveId && (
          <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-[1px] text-copper-light">
            <Glyph name="spark" className="size-3" /> something surfaced
          </span>
        )}
        {!turn.isOpen && (
          <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-[1px] text-white/40">
            <Glyph name="x" className="size-3" /> closed question
          </span>
        )}
      </PersonaBubble>
    </li>
  );
}

/** Sprechblase der Persona. Platzhalter-Gestaltung, kommt vom Grafiker. */
function PersonaBubble({ name, children, highlight = false }: { name: string; children: React.ReactNode; highlight?: boolean }) {
  return (
    <div className="flex max-w-[92%] items-start gap-2.5 self-start">
      <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-copper-gradient text-[12px] font-medium">{name[0]}</span>
      <div className={`flex min-w-0 flex-col rounded-[12px] rounded-tl-[4px] border px-4 py-3 backdrop-blur-[10px] ${highlight ? "border-copper/60 bg-copper/15 shadow-[0_0_16px_rgba(183,127,88,0.25)]" : "border-white/15 bg-white/5"}`}>
        <span className="mb-1 text-[10px] font-medium uppercase tracking-[1px] text-white/50">{name}</span>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Motiv-Reveal (B6): entdeckt vs. nicht entdeckt, jetzt benannt       */
/* ------------------------------------------------------------------ */

export function MotivesRevealScreen({ config, round, me }: { config: Comp2Config; round: number; me: Participant }) {
  const r = config.rounds[round];
  const discovered = discoveredMotives(me, round);
  const points = (me.interviews ?? []).filter((t) => t.round === round).reduce((s, t) => s + t.points, 0);
  return (
    <div className="flex flex-col gap-5 pt-5 animate-reveal">
      <Panel>
        <div className="flex items-center justify-between">
          <Overline className="text-teal">What drives {r.persona.name}</Overline>
          <PointsBadge points={points} max={Math.min(r.persona.motives.length, config.interviewQuestions)} />
        </div>
        <p className="text-[15px] leading-[1.4]">
          You uncovered <span className="font-medium">{discovered.length} of {r.persona.motives.length}</span> motives. These are the feelings the CUPRA has to serve in the next step.
        </p>
      </Panel>
      <ul className="flex flex-col gap-2">
        {r.persona.motives.map((pm) => {
          const m = config.motives.find((x) => x.id === pm.motiveId);
          const found = discovered.includes(pm.motiveId);
          return (
            <li key={pm.motiveId} className={`flex flex-col gap-1.5 rounded-[8px] border p-4 ${found ? "border-copper/60 bg-copper/10" : "border-white/15 bg-white/5"}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[16px] font-medium">{m?.label}</span>
                <Chip tone={found ? "copper" : "glass"}>{found ? "uncovered" : "missed"}</Chip>
              </div>
              <p className="text-[13px] leading-[1.4] text-white/70">{m?.description}</p>
              <p className="text-[13px] italic leading-[1.4] text-white/85">“{pm.revealLine}”</p>
            </li>
          );
        })}
      </ul>
      <p className="text-center text-[12px] text-white/40">Next: find the CUPRA features that serve these motives.</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Feature-Eingabe (US-4): Feature plus Motiv, Feedback pro Feature   */
/* ------------------------------------------------------------------ */

interface FeaturesProps {
  config: Comp2Config;
  round: number;
  me: Participant;
  onSubmit: (text: string, motiveId: string) => Promise<unknown>;
  onFinish: () => Promise<unknown>;
}

export function FeaturesScreen({ config, round, me, onSubmit, onFinish }: FeaturesProps) {
  const r = config.rounds[round];
  const motives = r.persona.motives.map((pm) => config.motives.find((m) => m.id === pm.motiveId)!).filter(Boolean);
  const feats = (me.features ?? []).filter((f) => f.round === round).sort((a, b) => a.idx - b.idx);
  const finished = me.roundFinished[round];
  const summary = me.roundSummaries.find((s) => s.round === round);
  const [text, setText] = useState("");
  const [motiveId, setMotiveId] = useState<string>(motives[0]?.id ?? "");
  const [busy, setBusy] = useState<"score" | "finish" | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const full = feats.length >= WS_CONFIG.FEATURES_PER_ROUND;
  const trimmed = text.trim();
  const valid = trimmed.length >= WS_CONFIG.ARGUMENT_MIN_CHARS && trimmed.length <= WS_CONFIG.ARGUMENT_MAX_CHARS && Boolean(motiveId);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [feats.length, busy, finished]);

  const finish = async () => {
    setBusy("finish");
    try {
      await onFinish();
    } finally {
      setBusy(null);
    }
  };

  const send = async () => {
    if (!valid || busy || full || finished) return;
    const willBeFull = feats.length + 1 >= WS_CONFIG.FEATURES_PER_ROUND;
    setBusy("score");
    setText("");
    try {
      await onSubmit(trimmed, motiveId);
    } finally {
      setBusy(null);
    }
    if (willBeFull) await finish();
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-4 pt-5">
        <div className="flex flex-col gap-2">
          <p className="text-[14px] leading-[1.35] text-white/70">
            Your top {WS_CONFIG.FEATURES_PER_ROUND} CUPRA features for <span className="font-medium text-white">{r.persona.name}</span>. Name the feature, pick the motive it serves.
          </p>
          <div className="flex items-center gap-3">
            <Bar value={feats.length / WS_CONFIG.FEATURES_PER_ROUND} tone="teal" className="flex-1" />
            <span className="text-[11px] font-medium uppercase tracking-[1px] text-white/60">
              {Math.min(feats.length, WS_CONFIG.FEATURES_PER_ROUND)} of {WS_CONFIG.FEATURES_PER_ROUND}
            </span>
          </div>
        </div>

        <ol className="flex flex-col gap-4">
          {feats.map((f) => (
            <FeatureItem key={f.idx} feature={f} config={config} />
          ))}
          {busy === "score" && (
            <li className="flex flex-col gap-2 animate-fade-up">
              <div className="max-w-[85%] self-end rounded-[12px] rounded-br-[4px] bg-copper-gradient px-4 py-3 text-[15px] opacity-60">…</div>
              <FeedbackBubble>
                <TypingDots />
              </FeedbackBubble>
            </li>
          )}
        </ol>

        {(finished || busy === "finish") && (
          <Panel className="animate-slide-up">
            <div className="flex items-center justify-between">
              <Overline className="text-teal">Round {round + 1} complete</Overline>
              {summary && <PointsBadge points={summary.points} max={maxPointsPerRound2(config, round)} />}
            </div>
            {summary ? (
              <p className="text-[15px] leading-[1.45]">{summary.text}</p>
            ) : (
              <div className="flex items-center gap-2 text-[14px] text-white/60">
                <TypingDots /> Summarising your round
              </div>
            )}
            {summary && <p className="text-[12px] text-white/40">The trainer moves everyone on when the room is ready.</p>}
          </Panel>
        )}
        <div ref={endRef} className="h-2" />
      </div>

      {!finished && full && busy !== "finish" && (
        <div className="sticky bottom-0 z-20 -mx-5 mt-auto bg-gradient-to-b from-transparent via-night/90 to-night px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-8">
          <SecondaryButton onClick={() => void finish()}>Show round feedback</SecondaryButton>
        </div>
      )}

      {!finished && !full && (
        <div className="sticky bottom-0 z-20 -mx-5 mt-auto bg-gradient-to-b from-transparent via-night/90 to-night px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-8">
          <div className="flex flex-col gap-2">
            {/* Motiv-Auswahl, mit eigenem Grund, damit sie den Chat darunter nicht überlagert */}
            <div className="flex flex-wrap gap-1.5 rounded-[8px] bg-night/90 p-2 backdrop-blur-[10px]">
              {motives.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMotiveId(m.id)}
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.8px] transition ${motiveId === m.id ? "border-teal bg-teal-tint shadow-glow" : "border-white/20 bg-white/5 text-white/70"}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="flex items-end gap-2 rounded-[8px] border border-white/25 bg-night/80 p-2 pl-4 backdrop-blur-[10px] focus-within:border-white/60">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                rows={1}
                maxLength={WS_CONFIG.ARGUMENT_MAX_CHARS}
                disabled={Boolean(busy)}
                placeholder={`Feature ${feats.length + 1}: what did you see or touch?`}
                className="max-h-32 min-h-[40px] min-w-0 flex-1 resize-none bg-transparent py-2 text-[15px] leading-[1.35] text-white outline-none placeholder:text-white/40"
              />
              <button
                type="button"
                onClick={() => void send()}
                disabled={!valid || Boolean(busy)}
                aria-label="Send feature"
                className="flex size-10 shrink-0 items-center justify-center rounded-[6px] bg-copper-gradient text-white transition active:scale-95 disabled:opacity-30"
              >
                <Glyph name="arrow-right" className="size-5" />
              </button>
            </div>
            {feats.length > 0 && (
              <SecondaryButton onClick={() => void finish()} className="!min-h-10 !py-2 text-[12px]">
                Finish round with {feats.length} feature{feats.length > 1 ? "s" : ""}
              </SecondaryButton>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureItem({ feature, config }: { feature: ScoredFeature; config: Comp2Config }) {
  const motive = config.motives.find((m) => m.id === feature.evaluation.motiveId);
  return (
    <li className="flex flex-col gap-2 animate-fade-up">
      <div className="flex max-w-[85%] flex-col gap-1.5 self-end rounded-[12px] rounded-br-[4px] bg-copper-gradient px-4 py-3 text-[15px] leading-[1.35]">
        <span>{feature.text}</span>
        <span className="self-start rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.8px]">→ {motive?.label}</span>
      </div>
      <FeedbackBubble points={feature.points} max={MAX_POINTS_PER_FEATURE}>
        <p className="text-[14px] leading-[1.4]">{feature.feedback}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Criterion ok={Boolean(feature.evaluation.featureId)} label="CUPRA feature" />
          <Criterion ok={feature.evaluation.pairValid} label="Fits the motive" />
        </div>
      </FeedbackBubble>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Zusammenfassung läuft auf der Leinwand (E2)                          */
/* ------------------------------------------------------------------ */

export function SummaryWaitScreen({ config, me }: { config: Comp2Config; me: Participant }) {
  const summaries = me.roundSummaries.sort((a, b) => a.round - b.round);
  return (
    <div className="flex flex-1 flex-col gap-5 pt-5">
      <div className="flex items-center gap-3 rounded-[8px] border border-teal/40 bg-teal/10 p-4">
        <Glyph name="spark" className="size-5 text-teal" />
        <div className="flex flex-col">
          <span className="text-[15px] font-medium leading-none">Look at the screen</span>
          <span className="mt-1 text-[12px] text-white/60">The trainer shows what the room found for each motive.</span>
        </div>
      </div>
      <Overline className="text-white/60">Your rounds</Overline>
      <ul className="flex flex-col gap-2">
        {config.rounds.map((r, i) => {
          const s = summaries.find((x) => x.round === i);
          return (
            <li key={r.id} className="glass flex flex-col gap-1.5 rounded-[6px] p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-medium">
                  Round {i + 1} · {r.persona.name}
                </span>
                {s && <PointsBadge points={s.points} max={s.maxPoints} />}
              </div>
              {s ? <p className="text-[13px] leading-[1.4] text-white/75">{s.text}</p> : <p className="text-[13px] text-white/40">Not completed.</p>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
