"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { WS_CONFIG } from "@/engine/config";
import type { WorkshopConfig } from "@/engine/types";
import { getOrCreateUserId, shortId } from "@/lib/identity";
import { useClientValue } from "@/lib/useClientValue";
import { Background } from "../shared/Background";
import { Glyph } from "../shared/bits";
import { PrimaryButton } from "../shared/ui";

interface Props {
  config: WorkshopConfig;
  code: string;
  onJoin: (displayName: string) => void;
}

/** US-1: Beitritt nach dem QR-Scan. Anzeigename optional, ID wird gezeigt. */
export function JoinScreen({ config, code, onJoin }: Props) {
  const [name, setName] = useState("");
  const userId = useClientValue(() => getOrCreateUserId(), null);

  return (
    <>
      <Background variant="start" />
      <form
        className="relative flex flex-1 flex-col px-5 pb-[max(32px,env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))]"
        onSubmit={(e) => {
          e.preventDefault();
          onJoin(name);
        }}
      >
        <div className="mt-[12dvh] flex flex-col items-center">
          <div className="relative h-[102px] w-[132px]">
            <img alt="" aria-hidden src="/design/gradient-shape.webp" className="pointer-events-none absolute -z-[1] max-w-none" style={{ left: "-206.8%", top: "-302%", width: "512.9%", height: "551%" }} />
            <img alt="CUPRA" src="/design/emblem.svg" className="relative h-[102px] w-[132px]" />
          </div>
          <p className="mt-12 text-[11px] font-medium uppercase tracking-[2px] text-white/60">Global Launch Training</p>
          <h1 className="mt-2 text-center text-[32px] font-light leading-[1.05]">
            {config.title.split(" ").slice(0, -1).join(" ")} <span className="font-medium">{config.title.split(" ").at(-1)}</span>
          </h1>
          <p className="mt-4 max-w-[300px] text-center text-[15px] leading-[1.3] text-white/70">
            Explore the cars, argue for the CUPRA, place the brands. Your points count across the whole training series.
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-8">
          <div className="flex items-center justify-between rounded-[6px] border border-white/15 bg-white/5 px-4 py-3 text-[12px]">
            <span className="text-white/60">Session</span>
            <span className="font-medium uppercase tracking-[2px]">{code}</span>
          </div>
          <div className="flex h-[54px] items-center rounded-[6px] border border-white/25 bg-white/5 px-4 focus-within:border-white/60">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={WS_CONFIG.DISPLAY_NAME_MAX}
              autoComplete="off"
              placeholder="Display name (optional)"
              className="min-w-0 flex-1 bg-transparent text-[14px] uppercase tracking-[0.56px] text-white outline-none placeholder:text-white/50"
            />
          </div>
          <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-white/40">
            <Glyph name="lock" className="size-3" />
            Your participant ID {userId ? shortId(userId) : "…"} stays the same in every workshop.
          </p>
          <PrimaryButton type="submit">Join the session</PrimaryButton>
        </div>
      </form>
    </>
  );
}
