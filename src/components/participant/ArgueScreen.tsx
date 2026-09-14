"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_POINTS_PER_ARGUMENT, WS_CONFIG } from "@/engine/config";
import { maxPointsPerRound } from "@/engine/scoring";
import type { ScoredArgument, WorkshopConfig } from "@/engine/types";
import type { Participant } from "@/lib/participant";
import { Bar, Glyph, PointsBadge, TypingDots } from "../shared/bits";
import { Overline, Panel, SecondaryButton } from "../shared/ui";

interface Props {
  config: WorkshopConfig;
  round: number;
  me: Participant;
  onSubmit: (text: string) => Promise<unknown>;
  onFinish: () => Promise<unknown>;
}

/**
 * US-4/US-5: dialogische Argument-Eingabe. Jedes Argument bekommt sofort Feedback,
 * nach dem dritten (oder "Finish") das Gesamtfeedback der Runde.
 */
export function ArgueScreen({ config, round, me, onSubmit, onFinish }: Props) {
  const r = config.rounds[round];
  const competitor = config.brands.find((b) => b.id === r.competitorBrandId);
  const args = me.arguments.filter((a) => a.round === round).sort((a, b) => a.idx - b.idx);
  const finished = me.roundFinished[round];
  const summary = me.roundSummaries.find((s) => s.round === round);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState<"score" | "finish" | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const full = args.length >= WS_CONFIG.ARGUMENTS_PER_ROUND;
  const trimmed = text.trim();
  const valid = trimmed.length >= WS_CONFIG.ARGUMENT_MIN_CHARS && trimmed.length <= WS_CONFIG.ARGUMENT_MAX_CHARS;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [args.length, busy, finished]);

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
    const willBeFull = args.length + 1 >= WS_CONFIG.ARGUMENTS_PER_ROUND;
    setBusy("score");
    setText("");
    try {
      await onSubmit(trimmed);
    } finally {
      setBusy(null);
    }
    // Nach dem dritten Argument automatisch das Gesamtfeedback der Runde (C4)
    if (willBeFull) await finish();
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-4 pt-5">
        <div className="flex flex-col gap-2">
          <p className="text-[14px] leading-[1.35] text-white/70">
            Why should <span className="font-medium text-white">{r.persona.name}</span> choose the CUPRA over the {competitor?.name}? One argument at a time.
          </p>
          <div className="flex items-center gap-3">
            <Bar value={args.length / WS_CONFIG.ARGUMENTS_PER_ROUND} tone="teal" className="flex-1" />
            <span className="text-[11px] font-medium uppercase tracking-[1px] text-white/60">
              {Math.min(args.length, WS_CONFIG.ARGUMENTS_PER_ROUND)} of {WS_CONFIG.ARGUMENTS_PER_ROUND}
            </span>
          </div>
        </div>

        <ol className="flex flex-col gap-4">
          {args.map((a) => (
            <ArgumentItem key={a.idx} arg={a} />
          ))}
          {busy === "score" && (
            <li className="flex flex-col gap-2 animate-fade-up">
              <div className="self-end max-w-[85%] rounded-[12px] rounded-br-[4px] bg-copper-gradient px-4 py-3 text-[15px] leading-[1.35] opacity-60">…</div>
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
              {summary && <PointsBadge points={summary.points} max={maxPointsPerRound()} />}
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
                placeholder={`Argument ${args.length + 1}: feature → benefit for ${r.persona.name}`}
                className="max-h-32 min-h-[40px] min-w-0 flex-1 resize-none bg-transparent py-2 text-[15px] leading-[1.35] text-white outline-none placeholder:text-white/40"
              />
              <button
                type="button"
                onClick={() => void send()}
                disabled={!valid || Boolean(busy)}
                aria-label="Send argument"
                className="flex size-10 shrink-0 items-center justify-center rounded-[6px] bg-copper-gradient text-white transition active:scale-95 disabled:opacity-30"
              >
                <Glyph name="arrow-right" className="size-5" />
              </button>
            </div>
            {args.length > 0 && (
              <SecondaryButton onClick={() => void finish()} className="!min-h-10 !py-2 text-[12px]">
                Finish round with {args.length} argument{args.length > 1 ? "s" : ""}
              </SecondaryButton>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ArgumentItem({ arg }: { arg: ScoredArgument }) {
  return (
    <li className="flex flex-col gap-2 animate-fade-up">
      <div className="max-w-[85%] self-end rounded-[12px] rounded-br-[4px] bg-copper-gradient px-4 py-3 text-[15px] leading-[1.35]">{arg.text}</div>
      <FeedbackBubble points={arg.points}>
        <p className="text-[14px] leading-[1.4]">{arg.feedback}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Criterion ok={arg.evaluation.addressesNeed} label="Need" />
          <Criterion ok={arg.evaluation.namesDifferentiator} label="CUPRA advantage" />
          {arg.evaluation.namesDifferentiator && arg.evaluation.isKeyDifferentiator && <Criterion ok label="Decisive" />}
        </div>
      </FeedbackBubble>
    </li>
  );
}

/** Platzhalter-Gestaltung für das Feedback-Element (Briefing US-5: kommt vom Grafiker). */
function FeedbackBubble({ children, points }: { children: React.ReactNode; points?: number }) {
  return (
    <div className="flex max-w-[92%] items-start gap-2.5 self-start">
      <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full border border-teal/40 bg-teal-tint">
        <Glyph name="spark" className="size-3.5 text-teal" />
      </span>
      <div className="flex min-w-0 flex-col gap-1.5 rounded-[12px] rounded-tl-[4px] border border-teal/30 bg-teal/10 px-4 py-3 backdrop-blur-[10px]">
        {points !== undefined && (
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-medium uppercase tracking-[1px] text-teal">Coach</span>
            <PointsBadge points={points} max={MAX_POINTS_PER_ARGUMENT} />
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

function Criterion({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.5px] ${ok ? "border-correct/50 bg-correct/15 text-white" : "border-white/15 text-white/40"}`}>
      <Glyph name={ok ? "check" : "x"} className="size-3" />
      {label}
    </span>
  );
}
