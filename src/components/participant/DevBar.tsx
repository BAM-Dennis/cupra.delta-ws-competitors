"use client";

import { useEffect } from "react";
import { PHASE_LABEL } from "@/engine/session";
import type { SessionEvent, SessionState } from "@/engine/types";
import { useClientValue } from "@/lib/useClientValue";
import { Glyph } from "../shared/bits";

/**
 * Nur Phase 0: schaltet die Phasen ohne Trainer durch. Sichtbar mit `?dev=1`.
 * Fällt weg, sobald der Server die Phase liefert.
 */
export function DevBar({ state, dispatch, onLeave }: { state: SessionState; dispatch: (e: SessionEvent) => void; onLeave?: () => void }) {
  const visible = useClientValue(() => new URLSearchParams(window.location.search).get("dev") === "1", false);
  // Platz für die Leiste schaffen, damit sie die Kopfzeile nicht überdeckt
  useEffect(() => {
    if (!visible) return;
    document.documentElement.classList.add("dev-bar");
    return () => document.documentElement.classList.remove("dev-bar");
  }, [visible]);
  if (!visible) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center pt-1">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-warn/50 bg-night/90 px-2 py-1 text-[11px] shadow-card backdrop-blur">
        <span className="px-1 font-medium uppercase tracking-[1px] text-warn">dev</span>
        <button type="button" onClick={() => dispatch({ type: "BACK" })} className="rounded-full p-1 hover:bg-white/10" aria-label="Previous phase">
          <Glyph name="chevron-left" className="size-3.5" />
        </button>
        <span className="min-w-[110px] text-center tabular-nums">
          {PHASE_LABEL[state.phase]} <span className="text-white/50">r{state.round + 1} v{state.version}</span>
        </span>
        <button type="button" onClick={() => dispatch({ type: "NEXT" })} className="rounded-full p-1 hover:bg-white/10" aria-label="Next phase">
          <Glyph name="chevron-right" className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => {
            dispatch({ type: "RESET" });
            onLeave?.();
          }}
          className="rounded-full p-1 hover:bg-white/10"
          aria-label="Reset session and participant"
        >
          <Glyph name="refresh" className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
