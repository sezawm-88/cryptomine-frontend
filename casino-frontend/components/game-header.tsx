"use client"

import { Gem, Activity, Wallet, ShieldCheck } from "lucide-react"
import { formatMoney } from "@/lib/game"
import { MusicToggle } from "@/components/music-toggle"

interface HeaderProps {
  balance: number
  telemetryMode: boolean
  onToggleTelemetry: (v: boolean) => void
  houseEdge: number
  onHouseEdgeChange: (v: number) => void
}

export function GameHeader({
  balance,
  telemetryMode,
  onToggleTelemetry,
  houseEdge,
  onHouseEdgeChange,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[var(--color-obsidian)]/40 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-emerald-glow)]/25 to-[var(--color-teal-glow)]/10 ring-1 ring-[var(--color-emerald-glow)]/40 shadow-[0_0_20px_rgba(0,240,138,0.3)]">
            <Gem className="h-5 w-5 text-[var(--color-emerald-glow)]" />
          </div>
          <div className="leading-tight">
            <h1 className="font-mono text-base font-bold tracking-tight text-foreground">
              CRYPTOMINE<span className="text-[var(--color-emerald-glow)]">:</span>TURBO
            </h1>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Grid Turbo Engine v2.4
            </p>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {/* House edge control (B2B) */}
          <div className="cm-glass-soft flex min-w-[180px] flex-1 items-center gap-3 rounded-2xl px-3 py-2 md:flex-none">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--color-amber-glow)]" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  House Edge Control
                </span>
                <span className="font-mono text-xs font-bold text-[var(--color-amber-glow)]">
                  {(houseEdge * 100).toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                step={0.1}
                value={houseEdge * 100}
                onChange={(e) => onHouseEdgeChange(Number(e.target.value) / 100)}
                aria-label="House edge percentage"
                className="cm-range cm-range-amber mt-1.5 w-full"
                style={{
                  background: `linear-gradient(to right, var(--color-amber-glow) ${
                    ((houseEdge * 100 - 1) / 4) * 100
                  }%, var(--color-panel-line) ${((houseEdge * 100 - 1) / 4) * 100}%)`,
                }}
              />
            </div>
          </div>

          {/* Music toggle */}
          <MusicToggle />

          {/* Telemetry toggle */}
                  <button style={{ display: 'none' }}
            type="button"
            onClick={() => onToggleTelemetry(!telemetryMode)}
            aria-pressed={telemetryMode}
            className={`cm-btn-sheen flex h-[52px] items-center gap-2 rounded-2xl px-3 transition-all active:scale-95 ${
              telemetryMode
                ? "cm-glass-soft text-[var(--color-emerald-glow)] ring-1 ring-[var(--color-emerald-glow)]/40"
                : "cm-glass-soft text-muted-foreground"
            }`}
          >
            <Activity className="h-4 w-4" />
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-[10px] font-semibold uppercase tracking-wider">Admin Telemetry</span>
              <span className="block text-xs font-bold">{telemetryMode ? "ON" : "OFF"}</span>
            </span>
            <span
              className={`relative h-5 w-9 rounded-full transition-colors ${
                telemetryMode ? "bg-[var(--color-emerald-glow)]" : "bg-[var(--color-panel-line)]"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                  telemetryMode ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
          <div className="cm-glass-soft flex h-[52px] items-center gap-2 rounded-2xl px-4">
            <Wallet className="h-4 w-4 text-[var(--color-emerald-glow)]" />
            <div className="leading-tight">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Balance
              </span>
              <span className="block font-mono text-sm font-bold text-foreground">{formatMoney(balance)}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
