export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[var(--color-obsidian)]">
      {/* drifting aurora blobs */}
      <div
        className="cm-aurora-a absolute -left-[10%] -top-[15%] h-[60vh] w-[60vh] rounded-full opacity-60 blur-[80px]"
        style={{ background: "radial-gradient(circle, var(--color-emerald-glow), transparent 70%)" }}
      />
      <div
        className="cm-aurora-b absolute right-[-12%] top-[10%] h-[55vh] w-[55vh] rounded-full opacity-40 blur-[90px]"
        style={{ background: "radial-gradient(circle, var(--color-teal-glow), transparent 70%)" }}
      />
      <div
        className="cm-aurora-a absolute bottom-[-20%] left-[28%] h-[50vh] w-[50vh] rounded-full opacity-30 blur-[100px]"
        style={{ background: "radial-gradient(circle, var(--color-amber-glow), transparent 70%)" }}
      />
      {/* faint moving grid */}
      <div className="cm-grid-bg absolute inset-0 opacity-50" />
      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 0%, transparent 40%, var(--color-obsidian) 100%)" }}
      />
    </div>
  )
}
