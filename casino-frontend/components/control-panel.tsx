"use client"

import { Coins, Bomb, Minus, Plus } from "lucide-react"
import { formatMoney } from "@/lib/game"
import type { RoundStatus } from "@/lib/game"

interface ControlPanelProps {
  bet: number
  setBet: (v: number) => void
  mines: number
  setMines: (v: number) => void
  balance: number
  status: RoundStatus
}

const MIN_BET = 1
const MAX_BET = 1000

export function ControlPanel({ bet, setBet, mines, setMines, balance, status }: ControlPanelProps) {
  const locked = status === "active"

  const clampBet = (v: number) => Math.max(MIN_BET, Math.min(MAX_BET, Math.min(balance, v)))

  return (
    <div className="flex flex-col gap-5">
      {/* Bet amount */}
      <div>
        <label className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Coins className="h-3.5 w-3.5 text-[var(--color-emerald-glow)]" />
          Bet Amount
        </label>
        <div className="flex items-center overflow-hidden rounded-xl border border-border bg-[var(--color-panel-soft)] focus-within:border-[var(--color-emerald-glow)]/60">
          <span className="pl-3 font-mono text-sm text-muted-foreground">£</span>
          <input
            type="number"
            inputMode="decimal"
            min={MIN_BET}
            max={MAX_BET}
            value={bet}
            disabled={locked}
            onChange={(e) => setBet(clampBet(Number(e.target.value) || 0))}
            aria-label="Bet amount"
            className="w-full bg-transparent px-2 py-3 font-mono text-base font-bold text-foreground outline-none disabled:opacity-60"
          />
          <div className="flex divide-x divide-border border-l border-border">
            {(["½", "2x", "Max"] as const).map((label) => (
              <button
                key={label}
                type="button"
                disabled={locked}
                onClick={() => {
                  if (label === "½") setBet(clampBet(Math.round((bet / 2) * 100) / 100))
                  else if (label === "2x") setBet(clampBet(bet * 2))
                  else setBet(clampBet(balance))
                }}
                className="px-3 py-3 font-mono text-xs font-bold text-muted-foreground transition-colors hover:bg-[var(--color-panel)] hover:text-[var(--color-emerald-glow)] disabled:opacity-40"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            disabled={locked}
            onClick={() => setBet(MIN_BET)}
            className="flex-1 rounded-lg border border-border bg-[var(--color-panel-soft)] py-1.5 font-mono text-[11px] font-bold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
          >
            MIN {formatMoney(MIN_BET)}
          </button>
          <button
            type="button"
            disabled={locked}
            onClick={() => setBet(clampBet(MAX_BET))}
            className="flex-1 rounded-lg border border-border bg-[var(--color-panel-soft)] py-1.5 font-mono text-[11px] font-bold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
          >
            MAX {formatMoney(MAX_BET)}
          </button>
        </div>
      </div>

      {/* Mines count */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Bomb className="h-3.5 w-3.5 text-[var(--color-danger)]" />
            Mines / Traps
          </label>
          <span className="font-mono text-sm font-bold text-[var(--color-danger-soft)]">{mines}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={locked || mines <= 1}
            onClick={() => setMines(Math.max(1, mines - 1))}
            aria-label="Decrease mines"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-[var(--color-panel-soft)] text-foreground transition-colors hover:border-[var(--color-danger)]/50 disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <input
            type="range"
            min={1}
            max={24}
            step={1}
            value={mines}
            disabled={locked}
            onChange={(e) => setMines(Number(e.target.value))}
            aria-label="Number of mines"
            className="cm-range cm-range-amber w-full disabled:opacity-50"
            style={{
              background: `linear-gradient(to right, var(--color-danger) ${
                ((mines - 1) / 23) * 100
              }%, var(--color-panel-line) ${((mines - 1) / 23) * 100}%)`,
            }}
          />
          <button
            type="button"
            disabled={locked || mines >= 24}
            onClick={() => setMines(Math.min(24, mines + 1))}
            aria-label="Increase mines"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-[var(--color-panel-soft)] text-foreground transition-colors hover:border-[var(--color-emerald-glow)]/50 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 flex gap-1.5">
          {[1, 3, 5, 10].map((preset) => (
            <button
              key={preset}
              type="button"
              disabled={locked}
              onClick={() => setMines(preset)}
              className={`flex-1 rounded-lg border py-1.5 font-mono text-[11px] font-bold transition-colors disabled:opacity-40 ${
                mines === preset
                  ? "border-[var(--color-danger)]/60 bg-[var(--color-danger)]/15 text-[var(--color-danger-soft)]"
                  : "border-border bg-[var(--color-panel-soft)] text-muted-foreground hover:text-foreground"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
