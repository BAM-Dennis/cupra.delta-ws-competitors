"use client";

import { maxMatrixPoints, maxPointsPerRound, roundPoints } from "@/engine/scoring";
import type { LeaderboardEntry, WorkshopConfig } from "@/engine/types";
import { participantScore, type Participant } from "@/lib/participant";
import { BigStat } from "../shared/bits";
import { LeaderboardList } from "../shared/LeaderboardList";
import { Overline, Panel, StatTile } from "../shared/ui";

interface Props {
  config: WorkshopConfig;
  me: Participant;
  leaderboard: { top: LeaderboardEntry[]; me: LeaderboardEntry | null; all: LeaderboardEntry[] };
}

/** US-9: eigenes Ergebnis mit Aufschlüsselung und Leaderboard. */
export function ResultScreen({ config, me, leaderboard }: Props) {
  const total = participantScore(me);
  const matrixPts = me.placements?.reduce((s, m) => s + m.points, 0) ?? 0;
  return (
    <div className="flex flex-col gap-5 pt-5">
      <Panel className="items-center animate-slide-up">
        <Overline className="text-teal">Your result</Overline>
        <BigStat value={total} label="points" />
        {leaderboard.me && (
          <p className="text-[14px] text-white/70">
            Rank <span className="font-medium text-white">{leaderboard.me.rank}</span> of {leaderboard.all.length} in the room
          </p>
        )}
        <div className="flex w-full gap-2 pt-2">
          {config.rounds.map((r, i) => (
            <StatTile key={r.id} label={`Round ${i + 1}`} footer={`of ${maxPointsPerRound()}`}>
              {roundPoints(me.arguments, i)}
            </StatTile>
          ))}
          <StatTile label="Matrix" footer={`of ${maxMatrixPoints(config.brands)}`}>
            {matrixPts}
          </StatTile>
        </div>
      </Panel>
      <section className="flex flex-col gap-2 animate-fade-up [animation-delay:0.2s]">
        <Overline className="text-white/60">Leaderboard</Overline>
        <LeaderboardList top={leaderboard.top} me={leaderboard.me} highlightId={me.userId} />
      </section>
      <p className="pb-6 text-center text-[12px] text-white/40">Your points are saved to your participant ID for the whole series.</p>
    </div>
  );
}
