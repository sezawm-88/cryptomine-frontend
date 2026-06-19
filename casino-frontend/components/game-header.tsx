"use client"

import { Wallet } from "lucide-react"

interface GameHeaderProps {
    balance: number
    telemetryMode: boolean
    formatMoney: (amount: number) => string
}

export default function GameHeader({ balance, telemetryMode, formatMoney }: GameHeaderProps) {
    return (
        <header className="w-full border-b border-panel-line bg-background/50 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                {/* Left Side Logo / App Title */}
                <div className="flex items-center gap-3">
                    <span className="font-mono text-lg font-bold tracking-wider text-text-foreground">
                        CRYPTOMINE<span className="text-[var(--color-emerald-glow)]">: TURBO</span>
                    </span>
                </div>

                {/* Right Side Info Controls */}
                <div className="flex items-center gap-4">
                    {/* Admin Telemetry Panel (Hidden out of sight) */}
                    <div style={{ display: "none" }} className="flex items-center gap-2 text-muted-foreground">
                        <div className="flex flex-col items-end">
                            <span className="block text-[10px] font-semibold uppercase tracking-wider">Admin Telemetry</span>
                            <span className="block text-xs font-bold">{telemetryMode ? "ON" : "OFF"}</span>
                        </div>
                        <span className={`relative h-5 w-9 rounded-full transition-colors ${telemetryMode ? "bg-[var(--color-emerald-glow)]" : "bg-[var(--color-panel-line)]"}`}>
                            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${telemetryMode ? "translate-x-4" : "translate-x-0.5"}`} />
                        </span>
                    </div>

                    {/* User Balance Display */}
                    <div className="cm-glass-soft flex h-[52px] items-center gap-2 rounded-2xl px-4">
                        <Wallet className="h-4 w-4 text-[var(--color-emerald-glow)]" />
                        <div className="leading-tight">
                            <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Balance</span>
                            <span className="block font-mono text-sm font-bold text-text-foreground">{formatMoney(balance)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
                    