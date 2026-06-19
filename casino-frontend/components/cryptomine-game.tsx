"use client"

import { useCallback, useMemo, useState } from "react"
import { Play, TrendingDown, Zap } from "lucide-react"
import { GameHeader } from "@/components/game-header"
import { ControlPanel } from "@/components/control-panel"
import { TelemetryPanel } from "@/components/telemetry-panel"
import { GameTile } from "@/components/game-tile"
import { AmbientBackground } from "@/components/ambient-background"
import { getAudio } from "@/lib/audio"
import {
  GRID_SIZE,
  generateMines,
  cumulativeMultiplier,
  stepMultiplier,
  formatMoney,
  formatMult,
} from "@/lib/game"
import type { RoundStatus, TileState } from "@/lib/game"

interface Toast {
  id: number
  kind: "win" | "loss"
  title: string
  subtitle: string
}

export function CryptomineGame() {
  const [balance, setBalance] = useState(1000)
  const [bet, setBet] = useState(10)
  const [mines, setMines] = useState(3)
  const [houseEdge, setHouseEdge] = useState(0.03)
  const [telemetryMode, setTelemetryMode] = useState(false)

  const [status, setStatus] = useState<RoundStatus>("idle")
  const [mineSet, setMineSet] = useState<Set<number>>(new Set())
  const [revealed, setRevealed] = useState<Set<number>>(new Set())
  const [flipped, setFlipped] = useState<Set<number>>(new Set())
  const [busted, setBusted] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const [stakeAtRisk, setStakeAtRisk] = useState(0)

  const picks = revealed.size
  const safeTotal = GRID_SIZE - mines
  const safeRemaining = safeTotal - picks

  const currentMult = useMemo(
    () => cumulativeMultiplier(GRID_SIZE, mines, picks, houseEdge),
    [mines, picks, houseEdge],
  )

  const nextMult = useMemo(() => {
    if (safeRemaining <= 0) return currentMult
    const remainingTiles = GRID_SIZE - picks
    return currentMult * stepMultiplier(remainingTiles, safeRemaining, houseEdge)
  }, [currentMult, picks, safeRemaining, houseEdge])

  const potentialPayout = stakeAtRisk * currentMult

  const showToast = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now()
    setToast({ ...t, id })
    setTimeout(() => {
      setToast((cur) => (cur && cur.id === id ? null : cur))
    }, 3200)
  }, [])

  const placeBet = () => {
    if (bet <= 0 || bet > balance) return
    getAudio().bet()
    setBalance((b) => Math.round((b - bet) * 100) / 100)
    setStakeAtRisk(bet)
    setMineSet(generateMines(GRID_SIZE, mines))
    setRevealed(new Set())
    setFlipped(new Set())
    setBusted(false)
    setToast(null)
    setStatus("active")
  }

  const handleTile = (index: number) => {
    if (status !== "active" || flipped.has(index)) return

    if (mineSet.has(index)) {
      // BUST — reveal all mines
      getAudio().explode()
      const allFlipped = new Set(flipped)
      mineSet.forEach((m) => allFlipped.add(m))
      allFlipped.add(index)
      setFlipped(allFlipped)
      setBusted(true)
      setStatus("busted")
      showToast({
        kind: "loss",
        title: "BET DEFEATED",
        subtitle: `Trap detonated — ${formatMoney(stakeAtRisk)} lost`,
      })
    } else {
      const newRevealed = new Set(revealed)
      newRevealed.add(index)
      const newFlipped = new Set(flipped)
      newFlipped.add(index)
      setRevealed(newRevealed)
      setFlipped(newFlipped)
      getAudio().reveal(newRevealed.size)

      // auto cash out if all safe tiles cleared
      if (newRevealed.size === safeTotal) {
        const payout = Math.round(stakeAtRisk * cumulativeMultiplier(GRID_SIZE, mines, newRevealed.size, houseEdge) * 100) / 100
        getAudio().cashout()
        setBalance((b) => Math.round((b + payout) * 100) / 100)
        setStatus("cashed")
        revealRest(newFlipped)
        showToast({
          kind: "win",
          title: "PERFECT CLEAR",
          subtitle: `Banked ${formatMoney(payout)}`,
        })
      }
    }
  }

  const revealRest = (base: Set<number>) => {
    const all = new Set(base)
    for (let i = 0; i < GRID_SIZE; i++) all.add(i)
    setFlipped(all)
  }

  const cashOut = () => {
    if (status !== "active" || picks === 0) return
    getAudio().cashout()
    const payout = Math.round(potentialPayout * 100) / 100
    setBalance((b) => Math.round((b + payout) * 100) / 100)
    setStatus("cashed")
    revealRest(flipped)
    showToast({
      kind: "win",
      title: "CASHED OUT",
      subtitle: `Banked ${formatMoney(payout)} at ${formatMult(currentMult)}`,
    })
  }

  const newRound = () => {
    setStatus("idle")
    setRevealed(new Set())
    setFlipped(new Set())
    setMineSet(new Set())
    setBusted(false)
    setStakeAtRisk(0)
  }

  // tile state resolver
  const tileState = (i: number): TileState => {
    if (mineSet.has(i)) {
      return status === "busted" ? (revealed.has(i) ? "trap" : "revealed-trap") : "trap"
    }
    return "safe"
  }

  const stepMultFor = (i: number) => {
    // approximate the step multiplier badge as cumulative at the time order unknown;
    // show the per-pick step value for revealed safe tiles
    return stepMultiplier(GRID_SIZE - picks + 1, safeRemaining + 1, houseEdge)
  }

  const canCashOut = status === "active" && picks > 0
  const lowBalance = balance < bet

  return (
    <div className="relative min-h-dvh">
      <AmbientBackground />
      <GameHeader
        balance={balance}
        telemetryMode={telemetryMode}
        onToggleTelemetry={setTelemetryMode}
        houseEdge={houseEdge}
        onHouseEdgeChange={setHouseEdge}
      />

      <main className="mx-auto grid max-w-[1400px] grid-cols-1 gap-4 px-4 py-4 md:px-6 md:py-6 lg:grid-cols-[minmax(300px,30%)_1fr]">
        {/* LEFT — control deck */}
        <section className="flex flex-col gap-4">
          <div className="cm-glass rounded-3xl p-4">
            <ControlPanel
              bet={bet}
              setBet={setBet}
              mines={mines}
              setMines={setMines}
              balance={balance}
              status={status}
            />

            {/* Primary action */}
            <div className="mt-5">
              {status === "active" ? (
                <button
                  type="button"
                  onClick={cashOut}
                  disabled={!canCashOut}
                  className={`cm-btn-sheen cm-pulse-gold flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-[var(--color-gold)] to-[var(--color-amber-glow)] px-4 py-4 font-mono text-base font-extrabold text-[var(--color-obsidian)] transition-transform active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:[animation:none]`}
                >
                  <Zap className="h-5 w-5 fill-current" />
                  {canCashOut ? `CASH OUT ${formatMoney(potentialPayout)}` : "PICK A TILE TO START"}
                </button>
              ) : status === "idle" ? (
                <button
                  type="button"
                  onClick={placeBet}
                  disabled={lowBalance || bet <= 0}
                  className="cm-btn-sheen cm-breathe flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-[var(--color-emerald-glow)] to-[var(--color-emerald-deep)] px-4 py-4 font-mono text-base font-extrabold text-[var(--color-obsidian)] transition-transform active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:[animation:none]"
                >
                  <Play className="h-5 w-5 fill-current" />
                  {lowBalance ? "INSUFFICIENT BALANCE" : `PLACE BET ${formatMoney(bet)}`}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={newRound}
                  className={`cm-btn-sheen cm-glass-soft flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-4 font-mono text-base font-extrabold text-foreground transition-transform active:scale-[0.97] ${
                    status === "busted"
                      ? "ring-1 ring-[var(--color-danger)]/50"
                      : "ring-1 ring-[var(--color-emerald-glow)]/50"
                  }`}
                >
                  <Play className="h-5 w-5 fill-current" />
                  NEW ROUND
                </button>
              )}
            </div>
          </div>

                  {/* <TelemetryPanel ... /> */}
            status={status}
            currentMult={status === "idle" ? 1 : currentMult}
            nextMult={nextMult}
            potentialPayout={status === "idle" ? bet : potentialPayout}
            picks={picks}
            safeRemaining={safeRemaining}
            houseEdge={houseEdge}
            telemetryMode={telemetryMode}
          />
        </section>

        {/* CENTER — grid stage */}
        <section className="flex flex-col gap-3">
          {/* round telemetry strip */}
          <div className="cm-glass flex items-center justify-between rounded-3xl px-4 py-3">
            <div className="flex items-center gap-4">
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Round Status
                </span>
                <span
                  className={`font-mono text-sm font-bold capitalize ${
                    status === "active"
                      ? "text-[var(--color-emerald-glow)]"
                      : status === "busted"
                        ? "text-[var(--color-danger-soft)]"
                        : status === "cashed"
                          ? "text-[var(--color-gold)]"
                          : "text-muted-foreground"
                  }`}
                >
                  {status === "idle" ? "Awaiting Bet" : status}
                </span>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Stake At Risk
                </span>
                <span className="font-mono text-sm font-bold text-foreground">
                  {formatMoney(status === "idle" ? 0 : stakeAtRisk)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Gems Found
              </span>
              <span className="font-mono text-sm font-bold text-[var(--color-emerald-glow)]">
                {picks} / {safeTotal}
              </span>
            </div>
          </div>

          {/* the grid */}
          <div
            className={`cm-glass relative rounded-3xl p-3 sm:p-5 ${
              busted ? "cm-shake" : ""
            }`}
          >
            <div className="mx-auto grid aspect-square max-w-[560px] grid-cols-5 gap-2 sm:gap-3">
              {Array.from({ length: GRID_SIZE }, (_, i) => (
                <GameTile
                  key={i}
                  index={i}
                  state={tileState(i)}
                  flipped={flipped.has(i)}
                  stepMult={revealed.has(i) ? stepMultFor(i) : 0}
                  clickable={status === "active" && !flipped.has(i)}
                  busted={busted}
                  onClick={handleTile}
                />
              ))}
            </div>

            {status === "idle" && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-3xl bg-[var(--color-obsidian)]/40 backdrop-blur-[2px]">
                <div className="cm-rise cm-glass rounded-2xl px-5 py-3 text-center">
                  <p className="font-mono text-sm font-bold text-foreground">Configure your bet</p>
                  <p className="text-xs text-muted-foreground">Press Place Bet to deploy the grid</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Toast */}
      {toast && (
        <div
          className={`cm-toast cm-glass fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-3xl px-5 py-3.5 ${
            toast.kind === "win"
              ? "ring-1 ring-[var(--color-emerald-glow)]/50 shadow-[0_0_40px_rgba(0,240,138,0.35)]"
              : "ring-1 ring-[var(--color-danger)]/50 shadow-[0_0_40px_rgba(255,59,70,0.35)]"
          }`}
        >
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              toast.kind === "win"
                ? "bg-[var(--color-emerald-glow)]/15 text-[var(--color-emerald-glow)]"
                : "bg-[var(--color-danger)]/15 text-[var(--color-danger)]"
            }`}
          >
            {toast.kind === "win" ? <Zap className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          </div>
          <div className="leading-tight">
            <p
              className={`font-mono text-sm font-extrabold tracking-wide ${
                toast.kind === "win" ? "text-[var(--color-emerald-glow)]" : "text-[var(--color-danger-soft)]"
              }`}
            >
              {toast.title}
            </p>
            <p className="text-xs text-muted-foreground">{toast.subtitle}</p>
          </div>
        </div>
      )}
    </div>
  )
}
