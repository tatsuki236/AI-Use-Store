"use client";

export function HeroGlow() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {/* Multi-layer mesh gradient */}
      <div
        className="absolute inset-0 opacity-70 dark:opacity-30"
        style={{
          background: [
            "radial-gradient(ellipse 90% 70% at 15% 35%, oklch(0.75 0.20 250 / 0.40), transparent 65%)",
            "radial-gradient(ellipse 50% 90% at 85% 25%, oklch(0.70 0.18 290 / 0.30), transparent 65%)",
            "radial-gradient(ellipse 80% 40% at 50% 90%, oklch(0.78 0.14 200 / 0.25), transparent 65%)",
            "radial-gradient(ellipse 40% 50% at 60% 10%, oklch(0.80 0.12 320 / 0.15), transparent 60%)",
          ].join(", "),
        }}
      />

      {/* Large floating orb — primary */}
      <div
        className="hero-float-1 absolute top-[5%] left-[10%] w-[28rem] h-[28rem] rounded-full opacity-25 dark:opacity-12 blur-[80px]"
        style={{
          background: "oklch(0.62 0.22 250)",
          animation: "hero-float-1 18s ease-in-out infinite",
        }}
      />

      {/* Medium orb — purple/pink accent */}
      <div
        className="hero-float-2 absolute top-[15%] right-[5%] w-[22rem] h-[22rem] rounded-full opacity-20 dark:opacity-10 blur-[70px]"
        style={{
          background: "oklch(0.68 0.18 290)",
          animation: "hero-float-2 25s ease-in-out infinite",
        }}
      />

      {/* Small orb — cyan accent */}
      <div
        className="hero-float-3 absolute bottom-[0%] left-[35%] w-[20rem] h-[20rem] rounded-full opacity-22 dark:opacity-10 blur-[60px]"
        style={{
          background: "oklch(0.74 0.16 200)",
          animation: "hero-float-3 20s ease-in-out infinite",
        }}
      />

      {/* Extra orb — warm accent for depth */}
      <div
        className="hero-float-2 absolute top-[60%] left-[65%] w-[16rem] h-[16rem] rounded-full opacity-15 dark:opacity-8 blur-[60px]"
        style={{
          background: "oklch(0.75 0.14 330)",
          animation: "hero-float-2 22s ease-in-out infinite 3s",
        }}
      />

      {/* Noise texture overlay for premium feel */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.025] dark:opacity-[0.04]">
        <filter id="hero-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#hero-noise)" />
      </svg>

      {/* Subtle top-to-bottom fade to blend with content below */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
