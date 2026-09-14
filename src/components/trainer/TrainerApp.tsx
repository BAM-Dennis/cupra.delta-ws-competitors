"use client";
/* eslint-disable @next/next/no-img-element */

import { PHASE_LABEL, phaseSequence } from "@/engine/session";
import type { Phase } from "@/engine/types";
import { demoLeaderboard, demoProgress } from "@/lib/demoData";
import { useLocalSession } from "@/lib/useLocalSession";
import { Glyph } from "../shared/bits";
import { ArgueProgressView, ExploreView, LeaderboardView, LobbyView, MatrixView, PersonaView, RevealView } from "./views";

/**
 * Trainer-/Präsentations-View für die Leinwand. Breites Layout, große Schrift,
 * Steuerleiste unten. Phase 0: Zustand aus dem localStorage (gleicher Browser wie /s/[code]).
 */
export function TrainerApp({ code }: { code: string }) {
  const s = useLocalSession(code);
  const { config, state, me } = s;
  if (!s.loaded) return null;

  const seq = phaseSequence(config.rounds.length);
  const index = seq.findIndex((x) => x.phase === state.phase && x.round === state.round);
  const progress = demoProgress(config, state.phase, state.round, me);
  const leaderboard = demoLeaderboard(config, state.phase, state.round, me);
  const isLast = index === seq.length - 1;

  let view: React.ReactNode;
  switch (state.phase) {
    case "lobby":
      view = <LobbyView code={code} participants={progress.participants} />;
      break;
    case "persona":
      view = <PersonaView config={config} round={state.round} />;
      break;
    case "explore":
      view = <ExploreView config={config} round={state.round} />;
      break;
    case "argue":
      view = <ArgueProgressView config={config} round={state.round} progress={progress} />;
      break;
    case "matrix":
      view = <MatrixView config={config} progress={progress} />;
      break;
    case "reveal":
      view = <RevealView config={config} />;
      break;
    case "leaderboard":
    case "ended":
      view = <LeaderboardView leaderboard={leaderboard} ended={state.phase === "ended"} outro={config.outro} />;
      break;
  }

  return (
    <div className="flex h-dvh flex-col bg-night text-white">
      {/* Kopf */}
      <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-10 py-5">
        <div className="flex items-center gap-5">
          <img alt="CUPRA" src="/design/emblem.svg" className="h-9 w-auto" />
          <div className="flex flex-col">
            <span className="text-[11px] font-medium uppercase tracking-[2px] text-white/50">Global Launch Training</span>
            <span className="text-[20px] font-light leading-none">{config.title}</span>
          </div>
        </div>
        <PhaseStepper phases={seq.map((x) => x.phase)} rounds={seq.map((x) => x.round)} current={index} />
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2 text-[16px] tabular-nums text-white/80">
            <Glyph name="users" className="size-5" />
            {progress.participants}
          </span>
          <span className="rounded-[6px] border border-white/20 px-3 py-1.5 text-[14px] font-medium uppercase tracking-[3px]">{code}</span>
        </div>
      </header>

      {/* Inhalt */}
      <main className="relative flex min-h-0 flex-1 flex-col overflow-y-auto px-10 py-8">
        <div key={`${state.phase}-${state.round}`} className="flex flex-1 flex-col animate-fade-up">
          {view}
        </div>
      </main>

      {/* Steuerleiste */}
      <footer className="flex shrink-0 items-center justify-between border-t border-white/10 bg-black/30 px-10 py-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => s.dispatch({ type: "BACK" })} disabled={index === 0} className="flex h-12 items-center gap-2 rounded-[6px] border border-white/25 bg-white/5 px-5 text-[13px] font-medium uppercase tracking-[1px] disabled:opacity-30">
            <Glyph name="chevron-left" className="size-4" /> Back
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Reset the session? All participants return to the lobby.")) {
                s.dispatch({ type: "RESET" });
                s.leave();
              }
            }}
            className="flex h-12 items-center gap-2 rounded-[6px] px-4 text-[13px] font-medium uppercase tracking-[1px] text-white/50 hover:text-white"
          >
            <Glyph name="refresh" className="size-4" /> Reset
          </button>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[11px] font-medium uppercase tracking-[2px] text-white/50">Now</span>
          <span className="text-[18px] leading-none">
            {PHASE_LABEL[state.phase]}
            {["persona", "explore", "argue"].includes(state.phase) && <span className="text-white/50"> · Round {state.round + 1}</span>}
          </span>
        </div>
        <button
          type="button"
          onClick={() => s.dispatch({ type: "NEXT" })}
          disabled={isLast}
          className="flex h-12 min-w-[220px] items-center justify-center gap-2 rounded-[6px] bg-copper-gradient px-6 text-[14px] font-medium uppercase tracking-[1px] transition active:scale-[0.99] disabled:opacity-30"
        >
          {nextLabel(state.phase, state.round, config.rounds.length)} <Glyph name="chevron-right" className="size-4" />
        </button>
      </footer>
    </div>
  );
}

function nextLabel(phase: Phase, round: number, rounds: number): string {
  switch (phase) {
    case "lobby":
      return "Start workshop";
    case "persona":
      return "Send to the cars";
    case "explore":
      return "Open argument input";
    case "argue":
      return round + 1 < rounds ? `Start round ${round + 2}` : "Open positioning";
    case "matrix":
      return "Reveal solution";
    case "reveal":
      return "Show leaderboard";
    case "leaderboard":
      return "End workshop";
    default:
      return "Next";
  }
}

function PhaseStepper({ phases, rounds, current }: { phases: Phase[]; rounds: number[]; current: number }) {
  return (
    <ol className="hidden items-center gap-1.5 lg:flex">
      {phases.map((p, i) => {
        const state = i < current ? "done" : i === current ? "current" : "todo";
        return (
          <li key={i} className="flex items-center gap-1.5">
            <span
              title={`${PHASE_LABEL[p]} ${["persona", "explore", "argue"].includes(p) ? `R${rounds[i] + 1}` : ""}`}
              className={`block rounded-full transition-all ${state === "current" ? "h-2.5 w-7 bg-teal shadow-glow" : state === "done" ? "size-2.5 bg-copper-light" : "size-2.5 bg-white/20"}`}
            />
          </li>
        );
      })}
    </ol>
  );
}
