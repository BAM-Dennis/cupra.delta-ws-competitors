import { describe, expect, it } from "vitest";
import { INITIAL_SESSION, phaseSequence, sessionReducer } from "../session";
import type { SessionState } from "../types";

function run(state: SessionState, n: number, rounds = 2): SessionState {
  let s = state;
  for (let i = 0; i < n; i++) s = sessionReducer(s, { type: "NEXT" }, rounds);
  return s;
}

describe("sessionReducer", () => {
  it("läuft die komplette Sequenz mit zwei Runden ab", () => {
    const seq = phaseSequence(2).map((s) => `${s.phase}:${s.round}`);
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
    const back = sessionReducer(s, { type: "BACK" }, 2);
    expect(back).toMatchObject({ phase: "argue", round: 0, version: 5 });
    expect(sessionReducer(INITIAL_SESSION, { type: "BACK" }, 2)).toEqual(INITIAL_SESSION);
  });
  it("RESET führt in die Lobby", () => {
    const s = run(INITIAL_SESSION, 7);
    expect(sessionReducer(s, { type: "RESET" }, 2)).toEqual({ phase: "lobby", round: 0, version: 8 });
  });
  it("ist generisch in der Rundenzahl", () => {
    expect(phaseSequence(1)).toHaveLength(1 + 3 + 4);
    expect(phaseSequence(3)).toHaveLength(1 + 9 + 4);
  });
});
