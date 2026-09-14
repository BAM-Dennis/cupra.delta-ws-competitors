"use client";

import { useMemo, useState } from "react";
import { maxMatrixPoints } from "@/engine/scoring";
import type { Placement, WorkshopConfig } from "@/engine/types";
import type { Participant } from "@/lib/participant";
import { Chip, Glyph, PointsBadge } from "../shared/bits";
import { BrandChip, Matrix } from "../shared/Matrix";
import { Overline, Panel, PrimaryButton } from "../shared/ui";

/* ------------------------------------------------------------------ */
/* Zuordnung (US-7)                                                    */
/* ------------------------------------------------------------------ */

export function MatrixScreen({ config, me, onSubmit }: { config: WorkshopConfig; me: Participant; onSubmit: (p: Placement[]) => void }) {
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(config.brands[0]?.id ?? null);

  const unplaced = config.brands.filter((b) => !placements[b.id]);
  const allPlaced = unplaced.length === 0;

  const place = (positionId: string) => {
    if (!selected) return;
    setPlacements((p) => ({ ...p, [selected]: positionId }));
    const next = config.brands.find((b) => b.id !== selected && !placements[b.id]);
    setSelected(next?.id ?? null);
  };

  if (me.placements) return <WaitingForReveal config={config} me={me} />;

  return (
    <div className="flex flex-1 flex-col gap-4 pt-5">
      <p className="text-[14px] leading-[1.35] text-white/70">
        Where does each brand sit? Pick a brand, then tap its position. Brands that are not in the room count too.
      </p>

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Overline className="text-white/60">{unplaced.length > 0 ? `Place ${unplaced.length} more` : "All placed"}</Overline>
          {selected && <Chip tone="teal">Selected: {config.brands.find((b) => b.id === selected)?.short}</Chip>}
        </div>
        <div className="flex min-h-9 flex-wrap gap-1.5">
          {unplaced.map((b) => (
            <BrandChip key={b.id} brand={b} state="tray" selected={selected === b.id} onClick={() => setSelected(b.id)} />
          ))}
          {allPlaced && <span className="text-[12px] text-white/50">Tap a placed brand to move it.</span>}
        </div>
      </section>

      <Matrix
        matrix={config.matrix}
        brands={config.brands}
        placements={placements}
        mode="edit"
        selectedBrandId={selected}
        onCellTap={place}
        onBrandTap={(id) => setSelected(id)}
      />

      <div className="sticky bottom-0 z-20 -mx-5 mt-auto bg-gradient-to-b from-transparent via-night/90 to-night px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-6">
        <PrimaryButton
          disabled={!allPlaced}
          onClick={() => onSubmit(config.brands.map((b) => ({ brandId: b.id, positionId: placements[b.id] })))}
        >
          {allPlaced ? "Submit placement" : `Place all ${config.brands.length} brands`}
        </PrimaryButton>
      </div>
    </div>
  );
}

function WaitingForReveal({ config, me }: { config: WorkshopConfig; me: Participant }) {
  const placements = useMemo(() => Object.fromEntries((me.placements ?? []).map((p) => [p.brandId, p.positionId])), [me.placements]);
  return (
    <div className="flex flex-1 flex-col gap-5 pt-5">
      <div className="flex items-center gap-3 rounded-[8px] border border-teal/40 bg-teal/10 p-4">
        <Glyph name="check" className="size-5 text-teal" />
        <div className="flex flex-col">
          <span className="text-[15px] font-medium leading-none">Placement submitted</span>
          <span className="mt-1 text-[12px] text-white/60">The trainer reveals the solution on the screen.</span>
        </div>
      </div>
      <Overline className="text-white/60">Your placement</Overline>
      <Matrix matrix={config.matrix} brands={config.brands} placements={placements} mode="readonly" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Auflösung (D4)                                                      */
/* ------------------------------------------------------------------ */

export function RevealScreen({ config, me }: { config: WorkshopConfig; me: Participant }) {
  const results = me.placements ?? [];
  const placements = Object.fromEntries(results.map((p) => [p.brandId, p.positionId]));
  const points = results.reduce((s, r) => s + r.points, 0);
  const wrong = results.filter((r) => !r.correct);
  const posLabel = (id: string) => config.matrix.positions.find((p) => p.id === id)?.label ?? id;

  if (results.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <p className="text-[18px] font-light">No placement submitted.</p>
        <p className="text-[14px] text-white/60">Follow the reveal on the screen.</p>
        <div className="w-full pt-6">
          <Matrix matrix={config.matrix} brands={config.brands} placements={{}} mode="reveal" results={null} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-5 pt-5 animate-reveal">
      <Panel>
        <div className="flex items-center justify-between">
          <Overline className="text-teal">Positioning</Overline>
          <PointsBadge points={points} max={maxMatrixPoints(config.brands)} />
        </div>
        <p className="text-[15px] leading-[1.4]">
          {results.filter((r) => r.correct).length} of {results.length} brands placed correctly
          {results.find((r) => config.brands.find((b) => b.id === r.brandId)?.isCupra)?.correct ? ", including the CUPRA (double points)." : ". The CUPRA counts double, check where it really sits."}
        </p>
      </Panel>
      <Matrix matrix={config.matrix} brands={config.brands} placements={placements} mode="reveal" results={results} />
      {wrong.length > 0 && (
        <section className="flex flex-col gap-2">
          <Overline className="text-white/60">Where you differed</Overline>
          <ul className="flex flex-col gap-1.5">
            {wrong.map((w) => (
              <li key={w.brandId} className="glass flex flex-col gap-1 rounded-[6px] px-3.5 py-2.5 text-[13px]">
                <span className="font-medium">{config.brands.find((b) => b.id === w.brandId)?.name}</span>
                <span className="flex flex-wrap items-center gap-x-2 text-white/60">
                  <span className="line-through">{posLabel(w.positionId)}</span>
                  <Glyph name="arrow-right" className="size-3.5 text-teal" />
                  <span className="text-white">{posLabel(w.solutionPositionId)}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
