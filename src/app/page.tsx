"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Background } from "@/components/shared/Background";
import { PrimaryButton, SecondaryButton } from "@/components/shared/ui";

/** Einstieg ohne QR: Session-Code eingeben. Plus Links für die Prototyp-Demo. */
export default function Home() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const clean = code.trim().toLowerCase();
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col">
      <Background variant="start" />
      <form
        className="relative flex flex-1 flex-col px-5 pb-[max(32px,env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))]"
        onSubmit={(e) => {
          e.preventDefault();
          if (clean) router.push(`/s/${clean}`);
        }}
      >
        <div className="mt-[16dvh] flex flex-col items-center">
          <img alt="CUPRA" src="/design/emblem.svg" className="h-[102px] w-[132px]" />
          <p className="mt-12 text-[11px] font-medium uppercase tracking-[2px] text-white/60">Global Launch Training</p>
          <h1 className="mt-2 text-center text-[32px] font-light leading-[1.05]">
            Competitor <span className="font-medium">Workshop</span>
          </h1>
          <p className="mt-4 text-center text-[15px] text-white/70">Scan the QR code on the screen, or enter the session code.</p>
        </div>
        <div className="mt-auto flex flex-col gap-3 pt-8">
          <div className="flex h-[54px] items-center rounded-[6px] border border-white/25 bg-white/5 px-4 focus-within:border-white/60">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoComplete="off"
              autoCapitalize="characters"
              placeholder="Session code"
              className="min-w-0 flex-1 bg-transparent text-center text-[18px] uppercase tracking-[4px] text-white outline-none placeholder:text-[14px] placeholder:tracking-[0.5px] placeholder:text-white/50"
            />
          </div>
          <PrimaryButton type="submit" disabled={!clean}>
            Join
          </PrimaryButton>
          <div className="mt-6 flex flex-col gap-2 rounded-[8px] border border-warn/30 bg-warn/5 p-4">
            <span className="text-[10px] font-medium uppercase tracking-[1.5px] text-warn">Prototype demo</span>
            <SecondaryButton href="/s/demo?dev=1">Participant view (with dev bar)</SecondaryButton>
            <SecondaryButton href="/t/demo">Trainer screen</SecondaryButton>
            <p className="text-[11px] leading-[1.4] text-white/50">
              Open both in the same browser: the trainer screen controls the phase, the participant tab follows. Cross-device sync comes with phase 1.{" "}
              <Link href="/s/demo" className="underline">
                Participant without dev bar
              </Link>
            </p>
          </div>
        </div>
      </form>
    </main>
  );
}
