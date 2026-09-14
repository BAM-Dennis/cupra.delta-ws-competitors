"use client";
/* eslint-disable @next/next/no-img-element */

import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { WS_CONFIG } from "@/engine/config";
import type { Comp1Config, LeaderboardEntry, WorkshopConfig } from "@/engine/types";
import { demoCorrectShare, type DemoProgress } from "@/lib/demoData";
import { useClientValue } from "@/lib/useClientValue";
import { Bar, BigStat, Chip, Glyph } from "../shared/bits";
import { LeaderboardList } from "../shared/LeaderboardList";
import { BrandChip, Matrix } from "../shared/Matrix";

const H = "text-[44px] font-light leading-none";
const SUB = "text-[18px] leading-[1.4] text-white/70";

/* ---------------- Lobby: QR ---------------- */

export function LobbyView({ code, participants }: { code: string; participants: number }) {
  const [qr, setQr] = useState<string | null>(null);
  const origin = useClientValue(() => window.location.origin, "");
  const url = origin ? `${origin}/s/${code}` : "";
  useEffect(() => {
    if (!url) return;
    let alive = true;
    QRCode.toDataURL(url, { margin: 1, width: 640, color: { dark: "#ffffff", light: "#00000000" } })
      .then((d) => alive && setQr(d))
      .catch(() => alive && setQr(null));
    return () => {
      alive = false;
    };
  }, [url]);
  return (
    <div className="grid flex-1 grid-cols-2 items-center gap-16">
      <div className="flex flex-col gap-6">
        <span className="text-[13px] font-medium uppercase tracking-[3px] text-teal">Welcome</span>
        <h1 className="text-[64px] font-light leading-[1.02]">
          Scan to join
          <br />
          <span className="font-medium">the workshop.</span>
        </h1>
        <p className={SUB}>Open your camera, scan the code, keep the page open. No app, no install. Your points count across the whole series.</p>
        <div className="flex items-center gap-4 pt-4">
          <BigStat value={participants} label="joined" />
          <span className="h-12 w-px bg-white/15" />
          <div className="flex flex-col">
            <span className="text-[12px] uppercase tracking-[1px] text-white/50">or type</span>
            <span className="text-[22px] font-medium tracking-[4px]">{code}</span>
            <span className="text-[13px] text-white/40">{url.replace(/^https?:\/\//, "")}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center">
        <div className="rounded-[24px] border border-white/15 bg-white/5 p-8 shadow-glow-strong">
          {qr ? <img alt={`QR code for ${url}`} src={qr} className="size-[380px]" /> : <div className="size-[380px] animate-pulse rounded bg-white/10" />}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Persona ---------------- */

export function PersonaView({ config, round }: { config: Comp1Config; round: number }) {
  const r = config.rounds[round];
  const competitor = config.brands.find((b) => b.id === r.competitorBrandId);
  const cupra = config.brands.find((b) => b.isCupra);
  const needs = config.needs.filter((n) => r.persona.needIds.includes(n.id));
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
        <p className="text-[22px] leading-[1.45] text-white/85">{r.persona.description}</p>
        <div className="mt-auto flex items-center gap-4 text-[22px]">
          <span className="font-medium">{cupra?.name}</span>
          <span className="text-white/40">vs</span>
          <span className="font-medium">{competitor?.name}</span>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <span className="text-[13px] font-medium uppercase tracking-[3px] text-teal">What {r.persona.name} needs</span>
        <ul className="flex flex-col gap-3">
          {needs.map((n, i) => (
            <li key={n.id} className="glass flex items-start gap-4 rounded-[8px] p-5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-[6px] bg-teal/25 text-[16px] font-medium text-teal">{i + 1}</span>
              <span className="text-[22px] leading-[1.3]">{n.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------------- Exploration ---------------- */

export function ExploreView({ config, round }: { config: WorkshopConfig; round: number }) {
  const r = config.rounds[round];
  return (
    <div className="flex flex-1 flex-col gap-8">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-4">
          <RoundTag round={round} total={config.rounds.length} />
          <h1 className={H}>To the cars.</h1>
        </div>
        <p className="max-w-[480px] text-right text-[18px] text-white/60">Explore along the categories on your phone. Nothing to type yet.</p>
      </div>
      <div className="grid flex-1 grid-cols-4 gap-4">
        {r.categories.map((c, i) => (
          <div key={c.id} className="glass flex flex-col gap-4 rounded-[10px] p-6">
            <span className="flex size-10 items-center justify-center rounded-[6px] bg-white/10 text-[16px] font-medium">{i + 1}</span>
            <h2 className="text-[24px] font-medium leading-tight">{c.title}</h2>
            <ul className="flex flex-col gap-3">
              {c.prompts.map((p, j) => (
                <li key={j} className="flex gap-3 text-[15px] leading-[1.4] text-white/75">
                  <span className="mt-[8px] size-1.5 shrink-0 rounded-full bg-copper-light" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Argument-Fortschritt ---------------- */

export function ArgueProgressView({ config, round, progress }: { config: WorkshopConfig; round: number; progress: DemoProgress }) {
  const r = config.rounds[round];
  const competitor = config.brands.find((b) => b.id === r.competitorBrandId);
  return (
    <div className="grid flex-1 grid-cols-[1fr_1.2fr] gap-16">
      <div className="flex flex-col gap-6">
        <RoundTag round={round} total={config.rounds.length} />
        <h1 className={H}>
          Three arguments
          <br />
          for <span className="font-medium">{r.persona.name}</span>.
        </h1>
        <p className={SUB}>Why the CUPRA over the {competitor?.name}? One argument at a time, on your phone. You get coaching feedback after each one.</p>
        <div className="mt-auto flex flex-col gap-3 rounded-[10px] border border-teal/30 bg-teal/10 p-6">
          <span className="text-[13px] font-medium uppercase tracking-[2px] text-teal">A strong argument</span>
          <p className="text-[18px] leading-[1.4]">
            Names a real CUPRA advantage over <span className="font-medium">this</span> competitor and connects it to one of {r.persona.name}&apos;s needs.
          </p>
        </div>
      </div>
      <div className="flex flex-col justify-center gap-8">
        {Array.from({ length: WS_CONFIG.ARGUMENTS_PER_ROUND }, (_, i) => {
          const n = progress.argumentsSubmitted[i] ?? 0;
          return (
            <div key={i} className="flex flex-col gap-3">
              <div className="flex items-end justify-between">
                <span className="text-[22px]">Argument {i + 1}</span>
                <span className="text-[28px] tabular-nums">
                  {n} <span className="text-[16px] text-white/50">/ {progress.participants}</span>
                </span>
              </div>
              <Bar value={n / progress.participants} className="!h-3" tone={i === WS_CONFIG.ARGUMENTS_PER_ROUND - 1 ? "teal" : "copper"} />
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

/* ---------------- Matrix leer + Abgabe-Zähler ---------------- */

export function MatrixView({ config, progress }: { config: Comp1Config; progress: DemoProgress }) {
  return (
    <div className="grid flex-1 grid-cols-[1fr_1.4fr] gap-16">
      <div className="flex flex-col gap-6">
        <span className="text-[13px] font-medium uppercase tracking-[3px] text-teal">Positioning</span>
        <h1 className={H}>
          Where does
          <br />
          each brand <span className="font-medium">sit?</span>
        </h1>
        <p className={SUB}>Place all brands on your phone, then submit once. Brands that are not in the room count too. The CUPRA counts double.</p>
        <div className="flex flex-wrap gap-2 pt-2">
          {config.brands.map((b) => (
            <BrandChip key={b.id} brand={b} big />
          ))}
        </div>
        <div className="mt-auto">
          <div className="flex items-end justify-between">
            <span className="text-[22px]">Submitted</span>
            <span className="text-[44px] leading-none tabular-nums">
              {progress.matrixSubmitted} <span className="text-[18px] text-white/50">/ {progress.participants}</span>
            </span>
          </div>
          <Bar value={progress.matrixSubmitted / progress.participants} className="mt-3 !h-3" tone="teal" />
        </div>
      </div>
      <div className="flex items-center">
        <Matrix matrix={config.matrix} brands={config.brands} placements={{}} mode="readonly" size="screen" />
      </div>
    </div>
  );
}

/* ---------------- Auflösung ---------------- */

export function RevealView({ config }: { config: Comp1Config }) {
  return (
    <div className="grid flex-1 grid-cols-[1fr_1.4fr] gap-16 animate-reveal">
      <div className="flex flex-col gap-6">
        <span className="text-[13px] font-medium uppercase tracking-[3px] text-teal">The reveal</span>
        <h1 className={H}>
          This is where
          <br />
          they <span className="font-medium">really sit.</span>
        </h1>
        <p className={SUB}>The percentage shows how many in the room placed the brand correctly. Look at your phone to see where you differed.</p>
        <ul className="mt-auto flex flex-col gap-2">
          {config.brands.map((b) => {
            const share = demoCorrectShare(b.id);
            return (
              <li key={b.id} className="flex items-center gap-4">
                <span className="w-44 text-[18px]">{b.name}</span>
                <Bar value={share} className="flex-1 !h-2" tone={b.isCupra ? "copper" : "teal"} />
                <span className="w-14 text-right text-[18px] tabular-nums">{Math.round(share * 100)}%</span>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="flex items-center">
        <Matrix
          matrix={config.matrix}
          brands={config.brands}
          placements={{}}
          mode="reveal"
          size="screen"
          brandExtra={(b) => <span className="ml-1 text-[12px] tabular-nums text-white/60">{Math.round(demoCorrectShare(b.id) * 100)}%</span>}
        />
      </div>
    </div>
  );
}

/* ---------------- Leaderboard ---------------- */

export function LeaderboardView({ leaderboard, ended }: { leaderboard: { top: LeaderboardEntry[]; all: LeaderboardEntry[] }; ended: boolean }) {
  const [first, ...rest] = leaderboard.top;
  return (
    <div className="grid flex-1 grid-cols-[1fr_1.2fr] gap-16">
      <div className="flex flex-col gap-6">
        <span className="text-[13px] font-medium uppercase tracking-[3px] text-teal">{ended ? "Thank you" : "Results"}</span>
        <h1 className={H}>
          {ended ? "Workshop" : "Today's"}
          <br />
          <span className="font-medium">{ended ? "complete." : "leaderboard."}</span>
        </h1>
        {first && (
          <div className="mt-4 flex flex-col gap-3 rounded-[12px] border border-teal/40 bg-teal-tint p-8 shadow-glow-strong">
            <span className="text-[13px] font-medium uppercase tracking-[2px] text-teal">Top of the room</span>
            <div className="flex items-end justify-between">
              <span className="text-[40px] font-medium leading-none">{first.displayName}</span>
              <span className="text-[56px] leading-none tabular-nums">
                {first.score} <span className="text-[18px] text-white/60">pts</span>
              </span>
            </div>
          </div>
        )}
        <p className={`${SUB} mt-auto`}>Points are saved to each participant ID and add up over the training series.</p>
      </div>
      <div className="flex min-h-0 flex-col justify-center">
        <div className="min-h-0 overflow-y-auto pr-1">
          <LeaderboardList top={rest.length ? [first, ...rest] : leaderboard.top} me={null} big />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Hilfen ---------------- */

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
