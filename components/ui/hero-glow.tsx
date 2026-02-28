"use client";

export function HeroGlow() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {/* Mesh gradient layer */}
      <div
        className="absolute inset-0 opacity-60 dark:opacity-30"
        style={{
          background: [
            "radial-gradient(ellipse 80% 60% at 20% 40%, oklch(0.72 0.18 250 / 0.35), transparent 70%)",
            "radial-gradient(ellipse 60% 80% at 80% 30%, oklch(0.68 0.15 290 / 0.25), transparent 70%)",
            "radial-gradient(ellipse 70% 50% at 50% 80%, oklch(0.75 0.12 200 / 0.20), transparent 70%)",
          ].join(", "),
        }}
      />

      {/* Floating orb 1 */}
      <div
        className="hero-float-1 absolute top-[10%] left-[15%] w-72 h-72 rounded-full opacity-30 dark:opacity-15 blur-3xl"
        style={{
          background: "oklch(0.65 0.20 250)",
          animation: "hero-float-1 18s ease-in-out infinite",
        }}
      />

      {/* Floating orb 2 */}
      <div
        className="hero-float-2 absolute top-[20%] right-[10%] w-96 h-96 rounded-full opacity-20 dark:opacity-10 blur-3xl"
        style={{
          background: "oklch(0.70 0.16 290)",
          animation: "hero-float-2 25s ease-in-out infinite",
        }}
      />

      {/* Floating orb 3 */}
      <div
        className="hero-float-3 absolute bottom-[5%] left-[40%] w-80 h-80 rounded-full opacity-25 dark:opacity-12 blur-3xl"
        style={{
          background: "oklch(0.72 0.14 200)",
          animation: "hero-float-3 20s ease-in-out infinite",
        }}
      />

      {/* Noise texture overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.05]">
        <filter id="hero-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#hero-noise)" />
      </svg>
    </div>
  );
}
