"use client"

import { Wallet } from "lucide-react"

interface GameHeaderProps {
    balance: number
    telemetryMode: boolean
    formatMoney: (amount: number) => string
    onToggleTelemetry: () => void
    onHouseEdgeChange: (val: number) => void
}

export default function GameHeader({
    balance,
    telemetryMode,
    formatMoney,
    onToggleTelemetry,
    onHouseEdgeChange
}: GameHeaderProps) {
    return (
        <header className="w-full border-b border-panel-line bg-background/50 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <span className="font-mono text-lg font-bold tracking-wider">
                        CRYPTOMINE
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex h-[52px] items-center gap-2 rounded-2xl px-4">
                        <Wallet className="h-4 w-4 text-emerald-500" />
                        <div className="leading-tight">
                            <span className="block text-[10px] uppercase text-muted-foreground">Balance</span>
                            <span className="block font-mono text-sm font-bold">{formatMoney(balance)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}