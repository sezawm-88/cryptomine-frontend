"use client"

import { Bomb, Gem } from "lucide-react"
import { formatMult } from "@/lib/game"
import type { TileState } from "@/lib/game"

interface TileProps {
  index: number
  state: TileState
  flipped: boolean
  stepMult: number
  clickable: boolean
  busted: boolean
  onClick: (index: number) => void
}

export function GameTile({ index, state, flipped, stepMult, clickable, busted, onClick }: TileProps) {
  const isTrap = state === "trap" || state === "revealed-trap"
  const isSafe = state === "safe"

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={() => onClick(index)}
      aria-label={`Tile ${index + 1}${flipped ? (isTrap ? ", trap" : ", safe") : ""}`}
      className="group relative aspect-square w-full select-none [perspective:700px] disabled:cursor-default"
    >
      <div className={`cm-flip relative h-full w-full ${flipped ? "cm-flipped" : ""}`}>
        {/* Back (hidden mystery tile) */}
        <div
          className={`cm-flip-back absolute inset-0 flex items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-[var(--color-panel-soft)] to-[var(--color-panel)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] transition-all ${
            clickable
              ? "group-hover:-translate-y-1 group-hover:border-[var(--color-emerald-glow)]/60 group-hover:shadow-[0_8px_24px_-6px_rgba(0,240,138,0.5),inset_0_1px_0_0_rgba(255,255,255,0.12)] group-active:translate-y-0"
              : ""
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full transition-all ${
              clickable
                ? "bg-[var(--color-emerald-glow)]/40 group-hover:h-2 group-hover:w-2 group-hover:bg-[var(--color-emerald-glow)] group-hover:shadow-[0_0_10px_var(--color-emerald-glow)]"
                : "bg-[var(--color-panel-line)]"
            }`}
          />
        </div>

        {/* Front (revealed) */}
        <div
          className={`cm-flip-front absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-2xl border ${
            isTrap
              ? "border-[var(--color-danger)]/60 bg-gradient-to-br from-[var(--color-danger)]/25 to-[var(--color-danger)]/10 shadow-[0_0_26px_rgba(255,59,70,0.45)]"
              : "cm-glow-burst border-[var(--color-emerald-glow)]/55 bg-gradient-to-br from-[var(--color-emerald-glow)]/22 to-[var(--color-teal-glow)]/8 shadow-[0_0_26px_rgba(0,240,138,0.35)]"
          }`}
        >
          {isTrap ? (
            <Bomb className={`h-6 w-6 text-[var(--color-danger)] ${state === "trap" ? "cm-pop" : ""}`} />
          ) : (
            <>
              <Gem className="h-5 w-5 text-[var(--color-emerald-glow)] drop-shadow-[0_0_6px_rgba(0,240,138,0.6)]" />
              {isSafe && stepMult > 0 && (
                <span className="cm-pop rounded-md bg-[var(--color-emerald-glow)] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[var(--color-obsidian)] shadow-[0_0_10px_rgba(0,240,138,0.5)]">
                  {formatMult(stepMult)}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </button>
  )
}
