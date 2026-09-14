"use client";

import { useState } from "react";
import type { WorkshopConfig } from "@/engine/types";
import type { Participant } from "@/lib/participant";
import { Chip, Glyph } from "../shared/bits";
import { Overline, Panel } from "../shared/ui";

/* ------------------------------------------------------------------ */
/* Lobby                                                               */
/* ------------------------------------------------------------------ */

export function LobbyScreen({ me, participants }: { me: Participant; participants: number }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
      <div className="relative flex size-28 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-teal/20 animate-pulse-soft" />
        <span className="absolute inset-4 rounded-full bg-teal/30 animate-pulse-soft [animation-delay:0.4s]" />
        <Glyph name="check" className="relative size-10 text-teal" />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-[26px] font-light leading-tight">
          You&apos;re in{me.displayName ? `, ${me.displayName}` : ""}.
        </h2>
        <p className="text-[15px] leading-[1.35] text-white/70">Waiting for the trainer to start the workshop. Keep this page open.</p>
      </div>
      <Chip tone="glass">
        <Glyph name="users" className="size-3.5" />
        {participants} in the room
      </Chip>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Persona                                                             */
/* ------------------------------------------------------------------ */

export function PersonaScreen({ config, round }: { config: WorkshopConfig; round: number }) {
  const r = config.rounds[round];
  const competitor = config.brands.find((b) => b.id === r.competitorBrandId);
  const cupra = config.brands.find((b) => b.isCupra);
  const needs = config.needs.filter((n) => r.persona.needIds.includes(n.id));
  return (
    <div className="flex flex-col gap-5 pt-6">
      <Panel className="animate-fade-up">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Overline className="text-teal">Your customer</Overline>
            <h2 className="mt-2 text-[30px] font-light leading-none">{r.persona.name}</h2>
            {r.persona.tagline && <p className="mt-1.5 text-[13px] text-white/60">{r.persona.tagline}</p>}
          </div>
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-copper-gradient text-[22px] font-medium">{r.persona.name[0]}</div>
        </div>
        <p className="text-[15px] leading-[1.45] text-white/85">{r.persona.description}</p>
      </Panel>

      <section className="flex flex-col gap-2.5 animate-fade-up [animation-delay:0.1s]">
        <Overline className="text-white/60">What {r.persona.name} needs</Overline>
        <ul className="flex flex-col gap-2">
          {needs.map((n, i) => (
            <li key={n.id} className="glass flex items-start gap-3 rounded-[6px] p-3.5">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-[4px] bg-teal/25 text-[12px] font-medium text-teal">{i + 1}</span>
              <span className="text-[15px] leading-[1.3]">{n.text}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="glass flex items-center justify-between rounded-[6px] p-3.5 animate-fade-up [animation-delay:0.2s]">
        <div className="flex flex-col gap-1">
          <Overline className="text-white/50">This round</Overline>
          <span className="text-[15px] font-medium">
            {cupra?.name} <span className="font-light text-white/60">vs</span> {competitor?.name}
          </span>
        </div>
        <Glyph name="arrow-right" className="size-5 text-copper-light" />
      </section>
      <p className="text-center text-[12px] text-white/40">The trainer moves everyone on to the exploration.</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Exploration                                                         */
/* ------------------------------------------------------------------ */

export function ExploreScreen({ config, round }: { config: WorkshopConfig; round: number }) {
  const r = config.rounds[round];
  const [open, setOpen] = useState<string | null>(r.categories[0]?.id ?? null);
  const competitor = config.brands.find((b) => b.id === r.competitorBrandId);
  return (
    <div className="flex flex-col gap-4 pt-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-[24px] font-light leading-tight">Go to the cars.</h2>
        <p className="text-[14px] leading-[1.35] text-white/70">
          Compare the CUPRA with the {competitor?.name} along these categories, with {r.persona.name} in mind. Nothing to type here, just look, touch, ask.
        </p>
      </div>
      <ul className="flex flex-col gap-2">
        {r.categories.map((c, i) => {
          const isOpen = open === c.id;
          return (
            <li key={c.id} className={`overflow-hidden rounded-[8px] border transition ${isOpen ? "border-teal/50 bg-teal/10" : "border-white/10 bg-white/5"}`}>
              <button type="button" onClick={() => setOpen(isOpen ? null : c.id)} className="flex w-full items-center gap-3 p-4 text-left">
                <span className={`flex size-7 shrink-0 items-center justify-center rounded-[4px] text-[12px] font-medium ${isOpen ? "bg-teal text-night" : "bg-white/10"}`}>{i + 1}</span>
                <span className="flex-1 text-[16px] font-medium leading-none">{c.title}</span>
                <Glyph name="chevron-right" className={`size-4 text-white/50 transition ${isOpen ? "rotate-90" : ""}`} />
              </button>
              {isOpen && (
                <ol className="flex flex-col gap-2.5 px-4 pb-4 animate-fade-up">
                  {c.prompts.map((p, j) => (
                    <li key={j} className="flex gap-3 text-[14px] leading-[1.4] text-white/85">
                      <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-copper-light" />
                      {p}
                    </li>
                  ))}
                </ol>
              )}
            </li>
          );
        })}
      </ul>
      <p className="text-center text-[12px] text-white/40">You&apos;ll formulate your arguments in the next step.</p>
    </div>
  );
}
