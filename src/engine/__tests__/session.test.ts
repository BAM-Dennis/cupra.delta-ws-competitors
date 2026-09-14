import { describe, expect, it } from "vitest";
import { INITIAL_SESSION, phaseSequence, sessionReducer, type SessionShape } from "../session";
import type { SessionState } from "../types";

const C1 = { type: "competitor-1" as const, rounds: 2 };
const C2 = { type: "competitor-2" as const, rounds: 2 };

function run(state: SessionState, n: number, shape: SessionShape = C1): SessionState {
  let s = state;
  for (let i = 0; i < n; i++) s = sessionReducer(s, { type: "NEXT" }, shape);
  return s;
}

describe("sessionReducer, Competitor I", () => {
  it("läuft die komplette Sequenz mit zwei Runden ab", () => {
    const seq = phaseSequence(C1).map((s) => `${s.phase}:${s.round}`);
    expect(seq).toEqual([
      "lobby:0",
      "persona:0",
      "explore:0",
      "argue:0",
      "persona:1",
      "explore:1",
      "argue:1",
      "matrix:1",
      "reveal:1",
      "leaderboard:1",
      "ended:1",
    ]);
  });
  it("NEXT erhöht die Version und bleibt am Ende stehen", () => {
    const end = run(INITIAL_SESSION, 10);
    expect(end.phase).toBe("ended");
    expect(end.version).toBe(10);
    expect(run(end, 1)).toEqual(end);
  });
  it("BACK geht eine Phase zurück, nicht vor die Lobby", () => {
    const s = run(INITIAL_SESSION, 4);
    expect(s).toMatchObject({ phase: "persona", round: 1 });
    const back = sessionReducer(s, { type: "BACK" }, C1);
    expect(back).toMatchObject({ phase: "argue", round: 0, version: 5 });
    expect(sessionReducer(INITIAL_SESSION, { type: "BACK" }, C1)).toEqual(INITIAL_SESSION);
  });
  it("RESET führt in die Lobby", () => {
    const s = run(INITIAL_SESSION, 7);
    expect(sessionReducer(s, { type: "RESET" }, C1)).toEqual({ phase: "lobby", round: 0, version: 8 });
  });
  it("ist generisch in der Rundenzahl", () => {
    expect(phaseSequence({ ...C1, rounds: 1 })).toHaveLength(1 + 3 + 4);
    expect(phaseSequence({ ...C1, rounds: 3 })).toHaveLength(1 + 9 + 4);
  });
});

describe("sessionReducer, Competitor II", () => {
  it("hat Interview und Motiv-Reveal je Runde, Zusammenfassung statt Matrix", () => {
    const seq = phaseSequence(C2).map((s) => `${s.phase}:${s.round}`);
    expect(seq).toEqual([
      "lobby:0",
      "persona:0",
      "interview:0",
      "motives:0",
      "explore:0",
      "features:0",
      "persona:1",
      "interview:1",
      "motives:1",
      "explore:1",
      "features:1",
      "summary:1",
      "leaderboard:1",
      "ended:1",
    ]);
  });
  it("läuft bis zum Ende durch", () => {
    const end = run(INITIAL_SESSION, 20, C2);
    expect(end).toMatchObject({ phase: "ended", round: 1, version: 13 });
  });
});
