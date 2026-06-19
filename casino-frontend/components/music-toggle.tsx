"use client"

import { useEffect, useState } from "react"
import { Music, VolumeX } from "lucide-react"
import { getAudio } from "@/lib/audio"

export function MusicToggle() {
  const [on, setOn] = useState(false)

  // keep state in sync if engine changes elsewhere
  useEffect(() => {
    setOn(getAudio().musicOn)
  }, [])

  const toggle = () => {
    const next = getAudio().toggleMusic()
    setOn(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Pause background music" : "Play background music"}
      className={`cm-btn-sheen flex h-[52px] items-center gap-2.5 rounded-2xl px-3.5 transition-all active:scale-95 ${
        on
          ? "cm-glass-soft text-[var(--color-teal-glow)] ring-1 ring-[var(--color-teal-glow)]/40"
          : "cm-glass-soft text-muted-foreground"
      }`}
    >
      {on ? (
        <span className="flex h-5 w-5 items-end justify-center gap-[2px]" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="cm-eq-bar w-[3px] rounded-full bg-[var(--color-teal-glow)]"
              style={{ height: "100%", animationDelay: `${i * 0.13}s` }}
            />
          ))}
        </span>
      ) : (
        <VolumeX className="h-5 w-5" />
      )}
      <span className="hidden text-left leading-tight sm:block">
        <span className="block text-[10px] font-semibold uppercase tracking-wider">Ambient</span>
        <span className="flex items-center gap-1 text-xs font-bold">
          <Music className="h-3 w-3" />
          {on ? "Playing" : "Muted"}
        </span>
      </span>
    </button>
  )
}
