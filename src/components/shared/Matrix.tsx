"use client";

import type { ReactNode } from "react";
import type { Brand, MatrixConfig, MatrixPosition, PlacementResult } from "@/engine/types";
import { Glyph } from "./bits";

export type MatrixMode = "edit" | "readonly" | "reveal";

interface Props {
  matrix: MatrixConfig;
  brands: Brand[];
  /** brandId → positionId (eigene Zuordnung) */
  placements: Record<string, string>;
  mode: MatrixMode;
  size?: "mobile" | "screen";
  selectedBrandId?: string | null;
  onCellTap?: (positionId: string) => void;
  onBrandTap?: (brandId: string) => void;
  /** reveal: Bewertung der eigenen Zuordnung */
  results?: PlacementResult[] | null;
  /** reveal auf der Leinwand: Zusatz pro Marke, z. B. Anteil richtig */
  brandExtra?: (brand: Brand) => ReactNode;
  /** Zusatz pro Zelle, z. B. Abgabe-Verteilung */
  cellExtra?: (position: MatrixPosition) => ReactNode;
}

/**
 * Die Positionierungs-Matrix. Eine Komponente für Teilnehmer-App und Leinwand,
 * gerendert aus derselben Konfiguration (Single Source of Truth, Briefing Abschnitt 8).
 */
export function Matrix({ matrix, brands, placements, mode, size = "mobile", selectedBrandId, onCellTap, onBrandTap, results, brandExtra, cellExtra }: Props) {
  const cols = Math.max(...matrix.positions.map((p) => p.x)) + 1;
  const rows = Math.max(...matrix.positions.map((p) => p.y)) + 1;
  const big = size === "screen";

  const cellFor = (x: number, y: number) => matrix.positions.find((p) => p.x === x && p.y === y);

  const brandsInCell = (positionId: string): Brand[] => {
    if (mode === "reveal") return brands.filter((b) => matrix.solution[b.id] === positionId);
    return brands.filter((b) => placements[b.id] === positionId);
  };

  const resultFor = (brandId: string) => results?.find((r) => r.brandId === brandId);

  return (
    <div className={`flex w-full ${big ? "gap-6" : "gap-2"}`}>
      {/* Y-Achse */}
      <div className={`flex shrink-0 flex-col items-center justify-between ${big ? "w-10 py-8" : "w-6 py-6"}`}>
        <span className={`${big ? "text-[14px]" : "text-[9px]"} font-medium uppercase tracking-[1px] text-white/70`} style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
          {matrix.axes.y.high}
        </span>
        <span className={`${big ? "text-[16px]" : "text-[10px]"} font-medium uppercase tracking-[1.5px] text-teal`} style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
          {matrix.axes.y.label}
        </span>
        <span className={`${big ? "text-[14px]" : "text-[9px]"} font-medium uppercase tracking-[1px] text-white/70`} style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
          {matrix.axes.y.low}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className={`grid ${big ? "gap-3" : "gap-2"}`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: rows }, (_, ri) => rows - 1 - ri).map((y) =>
            Array.from({ length: cols }, (_, x) => {
              const pos = cellFor(x, y);
              if (!pos) return <div key={`${x}-${y}`} />;
              const inCell = brandsInCell(pos.id);
              const clickable = mode === "edit" && Boolean(selectedBrandId) && Boolean(onCellTap);
              return (
                <div
                  key={pos.id}
                  role={clickable ? "button" : undefined}
                  tabIndex={clickable ? 0 : undefined}
                  aria-label={clickable ? `Place at ${pos.label}` : pos.label}
                  onClick={clickable ? () => onCellTap?.(pos.id) : undefined}
                  onKeyDown={
                    clickable
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onCellTap?.(pos.id);
                          }
                        }
                      : undefined
                  }
                  className={`relative flex flex-col rounded-[10px] border text-left transition ${
                    big ? "min-h-[240px] p-4" : "min-h-[124px] p-2.5"
                  } ${
                    clickable
                      ? "cursor-pointer border-teal/60 bg-teal/10 shadow-glow active:bg-teal/20"
                      : "border-white/12 bg-white/5"
                  }`}
                >
                  <span className={`${big ? "text-[13px]" : "text-[9px]"} font-medium uppercase leading-none tracking-[0.8px] text-white/50`}>{pos.label}</span>
                  <div className={`mt-2 flex flex-wrap ${big ? "gap-2" : "gap-1.5"}`}>
                    {inCell.map((b) => {
                      const r = mode === "reveal" ? resultFor(b.id) : undefined;
                      return (
                        <BrandChip
                          key={b.id}
                          brand={b}
                          big={big}
                          state={r ? (r.correct ? "correct" : "wrong") : mode === "edit" ? "placed" : "neutral"}
                          onClick={
                            mode === "edit" && onBrandTap
                              ? () => onBrandTap(b.id)
                              : undefined
                          }
                          extra={brandExtra?.(b)}
                        />
                      );
                    })}
                  </div>
                  {cellExtra && <div className="mt-auto pt-2">{cellExtra(pos)}</div>}
                  {clickable && <span className="absolute right-2 top-2 size-2 rounded-full bg-teal animate-pulse-soft" />}
                </div>
              );
            }),
          )}
        </div>
        {/* X-Achse */}
        <div className={`flex items-center justify-between ${big ? "mt-4 text-[14px]" : "mt-2 text-[9px]"} font-medium uppercase tracking-[1px] text-white/70`}>
          <span>{matrix.axes.x.low}</span>
          <span className={`${big ? "text-[16px]" : "text-[10px]"} tracking-[1.5px] text-teal`}>{matrix.axes.x.label}</span>
          <span>{matrix.axes.x.high}</span>
        </div>
      </div>
    </div>
  );
}

export function BrandChip({
  brand,
  big = false,
  state = "neutral",
  selected = false,
  onClick,
  extra,
}: {
  brand: Brand;
  big?: boolean;
  state?: "neutral" | "placed" | "correct" | "wrong" | "tray";
  selected?: boolean;
  onClick?: () => void;
  extra?: ReactNode;
}) {
  const base = brand.isCupra ? "bg-copper-gradient text-white" : "glass text-white";
  const ring =
    state === "correct"
      ? "ring-2 ring-correct"
      : state === "wrong"
        ? "ring-2 ring-signal"
        : selected
          ? "ring-2 ring-teal shadow-glow-strong"
          : "";
  const Comp = onClick ? "button" : "span";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={
        onClick
          ? (e: React.MouseEvent) => {
              e.stopPropagation();
              onClick();
            }
          : undefined
      }
      className={`inline-flex items-center gap-1.5 rounded-[6px] font-medium leading-none ${big ? "px-3 py-2 text-[15px]" : "px-2 py-1.5 text-[11px]"} ${base} ${ring} ${onClick ? "active:scale-[0.97]" : ""}`}
    >
      {state === "correct" && <Glyph name="check" className={big ? "size-4 text-correct" : "size-3 text-correct"} />}
      {state === "wrong" && <Glyph name="x" className={big ? "size-4 text-signal" : "size-3 text-signal"} />}
      <span>{brand.short ?? brand.name}</span>
      {!brand.present && <span className={`${big ? "text-[10px]" : "text-[8px]"} uppercase tracking-[0.5px] text-white/50`}>not here</span>}
      {extra}
    </Comp>
  );
}
