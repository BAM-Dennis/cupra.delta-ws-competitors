"use client";

import { useCallback, useMemo } from "react";
import { configForCode } from "@/data/config";
import { WS_CONFIG } from "@/engine/config";
import {
  maxPointsPerRound,
  maxPointsPerRound2,
  pointsForArgument,
  pointsForFeature,
  pointsForInterviewTurn,
  scoreMatrix,
} from "@/engine/scoring";
import { INITIAL_SESSION, sessionReducer } from "@/engine/session";
import type { Placement, SessionEvent, SessionState } from "@/engine/types";
import { getScorer } from "@/scoring";
import { getOrCreateUserId } from "./identity";
import { discoveredMotives, emptyParticipant, meKey, sessionKey, type Participant } from "./participant";
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
  const config = useMemo(() => configForCode(code), [code]);
  const shape = useMemo(() => ({ type: config.type, rounds: config.rounds.length }), [config]);
  const [state, setState, stateLoaded] = useStoredValue<SessionState>(sessionKey(code), INITIAL_SESSION);
  const [me, setMe, meLoaded] = useStoredValue<Participant | null>(meKey(code), null);

  const dispatch = useCallback(
    (event: SessionEvent) => setState((prev) => sessionReducer(prev, event, shape)),
    [setState, shape],
  );

  const join = useCallback(
    (displayName: string) => {
      setMe(emptyParticipant(getOrCreateUserId(), displayName.trim().slice(0, WS_CONFIG.DISPLAY_NAME_MAX), config.rounds.length));
    },
    [setMe, config.rounds.length],
  );

  /* ---------------- Competitor I ---------------- */

  const submitArgument = useCallback(
    async (round: number, text: string) => {
      if (config.type !== "competitor-1") return;
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

  const submitMatrix = useCallback(
    (placements: Placement[]) => {
      if (config.type !== "competitor-1") return;
      const results = scoreMatrix(placements, config.matrix, config.brands);
      setMe((prev) => (prev && !prev.placements ? { ...prev, placements: results } : prev));
    },
    [config, setMe],
  );

  /* ---------------- Competitor II ---------------- */

  const askQuestion = useCallback(
    async (round: number, question: string) => {
      if (config.type !== "competitor-2") return;
      const scorer = getScorer();
      const current = readStored<Participant>(meKey(code));
      if (!current) return;
      const history = (current.interviews ?? []).filter((t) => t.round === round);
      const idx = history.length;
      if (idx >= config.interviewQuestions) return;
      const [result] = await Promise.all([
        scorer.answerInterview({ config, round, idx, question, history, discoveredMotiveIds: discoveredMotives(current, round) }),
        wait(FAKE_LATENCY_MS),
      ]);
      const turn = {
        round,
        idx,
        question,
        reply: result.reply,
        isOpen: result.isOpen,
        discoveredMotiveId: result.discoveredMotiveId,
        points: pointsForInterviewTurn(result.discoveredMotiveId),
        scorer: scorer.name,
      };
      setMe((prev) => (prev ? { ...prev, interviews: [...(prev.interviews ?? []), turn] } : prev));
      return turn;
    },
    [config, code, setMe],
  );

  const submitFeature = useCallback(
    async (round: number, text: string, motiveId: string) => {
      if (config.type !== "competitor-2") return;
      const scorer = getScorer();
      const current = readStored<Participant>(meKey(code));
      if (!current) return;
      const idx = (current.features ?? []).filter((f) => f.round === round).length;
      if (idx >= WS_CONFIG.FEATURES_PER_ROUND) return;
      const [result] = await Promise.all([scorer.scoreFeature({ config, round, idx, text, motiveId }), wait(FAKE_LATENCY_MS)]);
      const scored = {
        round,
        idx,
        text,
        evaluation: result.evaluation,
        feedback: result.feedback,
        points: pointsForFeature(result.evaluation),
        scorer: scorer.name,
      };
      setMe((prev) => (prev ? { ...prev, features: [...(prev.features ?? []), scored] } : prev));
      return scored;
    },
    [config, code, setMe],
  );

  /* ---------------- gemeinsam ---------------- */

  const finishRound = useCallback(
    async (round: number) => {
      const scorer = getScorer();
      const current = readStored<Participant>(meKey(code));
      if (!current || current.roundFinished[round]) return;

      let text: string;
      let points: number;
      let maxPoints: number;
      if (config.type === "competitor-1") {
        const args = current.arguments.filter((a) => a.round === round);
        [text] = await Promise.all([scorer.summarizeRound({ config, round, arguments: args }), wait(FAKE_LATENCY_MS)]);
        points = args.reduce((s, a) => s + a.points, 0);
        maxPoints = maxPointsPerRound();
      } else {
        const interviews = (current.interviews ?? []).filter((t) => t.round === round);
        const features = (current.features ?? []).filter((f) => f.round === round);
        [text] = await Promise.all([scorer.summarizeRound2({ config, round, interviews, features }), wait(FAKE_LATENCY_MS)]);
        points = interviews.reduce((s, t) => s + t.points, 0) + features.reduce((s, f) => s + f.points, 0);
        maxPoints = maxPointsPerRound2(config, round);
      }
      const summary = { round, points, maxPoints, text };
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
    submitMatrix,
    askQuestion,
    submitFeature,
    finishRound,
  };
}

export type LocalSession = ReturnType<typeof useLocalSession>;
