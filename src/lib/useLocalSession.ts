"use client";

import { useCallback, useMemo } from "react";
import { getConfig } from "@/data/config";
import { WS_CONFIG } from "@/engine/config";
import { maxPointsPerRound, pointsForArgument, scoreMatrix } from "@/engine/scoring";
import { INITIAL_SESSION, sessionReducer } from "@/engine/session";
import type { Placement, SessionEvent, SessionState } from "@/engine/types";
import { getScorer } from "@/scoring";
import { getOrCreateUserId } from "./identity";
import { meKey, sessionKey, type Participant } from "./participant";
import { readStored, useStoredValue } from "./storedValue";

/** Simulierte Antwortzeit der Bewertung, damit der Prototyp das spätere Verhalten zeigt. */
const FAKE_LATENCY_MS = 900;

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Phase-0-Ersatz für den Server: Session und Teilnehmer im localStorage.
 * Die Rückgabe entspricht dem, was später `useSession(code)` vom Server liefert.
 */
export function useLocalSession(code: string) {
  const config = useMemo(() => getConfig("demo"), []);
  const [state, setState, stateLoaded] = useStoredValue<SessionState>(sessionKey(code), INITIAL_SESSION);
  const [me, setMe, meLoaded] = useStoredValue<Participant | null>(meKey(code), null);

  const dispatch = useCallback(
    (event: SessionEvent) => setState((prev) => sessionReducer(prev, event, config.rounds.length)),
    [setState, config.rounds.length],
  );

  const join = useCallback(
    (displayName: string) => {
      setMe({
        userId: getOrCreateUserId(),
        displayName: displayName.trim().slice(0, WS_CONFIG.DISPLAY_NAME_MAX),
        joinedAt: new Date().toISOString(),
        arguments: [],
        roundFinished: config.rounds.map(() => false),
        roundSummaries: [],
        placements: null,
      });
    },
    [setMe, config.rounds],
  );

  const submitArgument = useCallback(
    async (round: number, text: string) => {
      const scorer = getScorer();
      // Immer den aktuellen Stand lesen, nicht den Closure-Stand (mehrere Aufrufe hintereinander)
      const current = readStored<Participant>(meKey(code));
      if (!current) return;
      const idx = current.arguments.filter((a) => a.round === round).length;
      if (idx >= WS_CONFIG.ARGUMENTS_PER_ROUND) return;
      const [result] = await Promise.all([scorer.scoreArgument({ config, round, idx, text }), wait(FAKE_LATENCY_MS)]);
      const scored = {
        round,
        idx,
        text,
        evaluation: result.evaluation,
        feedback: result.feedback,
        points: pointsForArgument(result.evaluation),
        scorer: scorer.name,
      };
      setMe((prev) => (prev ? { ...prev, arguments: [...prev.arguments, scored] } : prev));
      return scored;
    },
    [config, code, setMe],
  );

  const finishRound = useCallback(
    async (round: number) => {
      const scorer = getScorer();
      const current = readStored<Participant>(meKey(code));
      if (!current || current.roundFinished[round]) return;
      const args = current.arguments.filter((a) => a.round === round);
      const [text] = await Promise.all([scorer.summarizeRound({ config, round, arguments: args }), wait(FAKE_LATENCY_MS)]);
      const summary = { round, points: args.reduce((s, a) => s + a.points, 0), maxPoints: maxPointsPerRound(), text };
      setMe((prev) =>
        prev
          ? {
              ...prev,
              roundFinished: prev.roundFinished.map((f, i) => (i === round ? true : f)),
              roundSummaries: [...prev.roundSummaries.filter((s) => s.round !== round), summary],
            }
          : prev,
      );
    },
    [config, code, setMe],
  );

  const submitMatrix = useCallback(
    (placements: Placement[]) => {
      const results = scoreMatrix(placements, config.matrix, config.brands);
      setMe((prev) => (prev && !prev.placements ? { ...prev, placements: results } : prev));
    },
    [config, setMe],
  );

  const leave = useCallback(() => setMe(null), [setMe]);

  return {
    config,
    state,
    me,
    loaded: stateLoaded && meLoaded,
    dispatch,
    join,
    leave,
    submitArgument,
    finishRound,
    submitMatrix,
  };
}

export type LocalSession = ReturnType<typeof useLocalSession>;
