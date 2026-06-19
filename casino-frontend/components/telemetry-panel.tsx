"use client"

import { TrendingUp, Gauge, Target, Sigma } from "lucide-react"
import { formatMult, formatMoney } from "@/lib/game"
import type { RoundStatus } from "@/lib/game"

interface TelemetryProps {
  status: RoundStatus
  currentMult: number
  nextMult: number
  potentialPayout: number
  picks: number
  safeRemaining: number
  houseEdge: number
  telemetryMode: boolean
}

export function TelemetryPanel({
  status,
  currentMult,
  nextMult,
  potentialPayout,
  picks,
  safeRemaining,
  houseEdge,
  telemetryMode,
}: TelemetryProps) {
  const active = status === "active"

  return (
    <div className="cm-glass rounded-3xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Gauge className="h-3.5 w-3.5 text-[var(--color-emerald-glow)]" />
          Live Telemetry
        </span>
        <span
          className={`h-2 w-2 rounded-full ${
            active ? "bg-[var(--color-emerald-glow)] shadow-[0_0_8px_var(--color-emerald-glow)]" : "bg-[var(--color-panel-line)]"
          }`}
        />
      </div>

      {/* Current multiplier — hero */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--color-emerald-glow)]/25 bg-gradient-to-br from-[var(--color-emerald-glow)]/12 via-[var(--color-teal-glow)]/5 to-transparent p-4 text-center">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Current Multiplier
        </span>
        <div
          className={`font-mono text-5xl font-extrabold tracking-tight ${
            active || status === "cashed"
              ? "text-[var(--color-emerald-glow)] drop-shadow-[0_0_18px_rgba(0,240,138,0.5)]"
              : "text-foreground/70"
          }`}
        >
          {formatMult(currentMult)}
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          Potential payout {formatMoney(potentialPayout)}
        </span>
      </div>

      {/* Stat grid */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Stat
          icon={<TrendingUp className="h-3.5 w-3.5 text-[var(--color-emerald-glow)]" />}
          label="Next Tile"
          value={active ? formatMult(nextMult) : "—"}
        />
        <Stat
          icon={<Target className="h-3.5 w-3.5 text-[var(--color-amber-glow)]" />}
          label="Safe Left"
          value={active ? String(safeRemaining) : "—"}
        />
      </div>

      {/* B2B math breakdown */}
      {telemetryMode && (
        <div className="cm-rise mt-3 rounded-xl border border-dashed border-[var(--color-amber-glow)]/40 bg-[var(--color-amber-glow)]/5 p-3">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-amber-glow)]">
            <Sigma className="h-3 w-3" />
            B2B Math Engine
          </span>
          <dl className="mt-2 space-y-1 font-mono text-[11px]">
            <Row label="House Edge" value={`${(houseEdge * 100).toFixed(1)}%`} />
            <Row label="RTP" value={`${(100 - houseEdge * 100).toFixed(1)}%`} />
            <Row label="Picks Made" value={String(picks)} />
            <Row
              label="Next Step Raw"
              value={active && safeRemaining > 0 ? `${(nextMult / (1 - houseEdge)).toFixed(4)}` : "—"}
            />
            <Row label="Edge-Adj Step" value={active && safeRemaining > 0 ? nextMult.toFixed(4) : "—"} />
          </dl>
        </div>
      )}
    </div>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-[var(--color-panel-soft)] p-3">
      <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="mt-0.5 block font-mono text-lg font-bold text-foreground">{value}</span>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-bold text-foreground">{value}</dd>
    </div>
  )
}
