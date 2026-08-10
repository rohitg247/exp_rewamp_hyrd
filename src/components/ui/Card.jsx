// src/components/ui/Card.jsx
//
// 2026-08-03 UI revamp.
//
// PANEL RULE (TSW-1070): every visible colour is set with an inline style().
// The previous version used `border-white/70` (slash-opacity) and
// `bg-[radial-gradient(...)]` (arbitrary bracket) — both are documented in
// Docs/crestron-panel-safe-css.md as NOT applying on the panel, which is why
// the glass card edge never showed up on hardware.
//
// The "glass" here is a STATIC layered gradient plus a specular top hairline,
// not backdrop-filter: six live-blur cards on one screen is the real FPS risk
// on panel hardware. Live backdrop-filter is reserved for overlay surfaces
// (navbar / sidebar / modal), where only a couple exist at a time.

// Accent rail hues, by control category. Values come from the existing
// --color-* scales, so they follow every theme and dark mode for free.
const RAIL_TONES = {
  brand: ["var(--rail-from)", "var(--rail-to)"],
  audio: ["var(--color-primary-400)", "var(--color-primary-700)"],
  video: ["var(--color-danger-400)", "var(--color-danger-600)"],
  lighting: ["var(--color-warning-400)", "var(--color-warning-600)"],
  climate: ["var(--color-success-400)", "var(--color-success-600)"],
  neutral: ["var(--color-gray-400)", "var(--color-gray-600)"],
};

const SURFACES = {
  default: {
    backgroundColor: "var(--color-bg-secondary)",
    boxShadow: "var(--surface-edge), var(--elev-rest)",
  },
  glass: {
    backgroundColor: "var(--color-bg-secondary)",
    // 2026-08-06: raked specular highlight layered over the base glass gradient.
    // Order matters — the specular is the top layer or it reads as matte.
    backgroundImage: "var(--gloss-specular), var(--surface-glass)",
    boxShadow: "var(--surface-hairline), var(--surface-edge), var(--elev-rest)",
  },
  // 2026-08-10: primary-tinted diagonal, ported from the Experience Center
  // panels' `gradientone`. Unlike `glass` (a neutral white wash) this carries
  // the theme's own colour through the card. Dark mode is handled entirely by
  // the --surface-gradient override in global.css.
  gradient: {
    backgroundColor: "var(--color-bg-secondary)",
    // Specular kept on top of the tint so gradient cards keep the same raked
    // highlight as the rest of the app. Drop it for the reference's flatter look.
    backgroundImage: "var(--gloss-specular), var(--surface-gradient)",
    boxShadow: "var(--surface-hairline), var(--surface-edge), var(--elev-rest)",
  },
  // EXPERIMENTAL — intentionally not wired to any call site. Stacks all three
  // effects at once: primary tint (bottom) → frosted white wash → raked
  // specular → grain (top), over a live backdrop blur. Set a single card to
  // variant="gradientGlass" to compare it against a neighbouring `gradient`.
  //
  // Two known limitations, both deliberate:
  //   1. --grain-opacity (0.045 light / 0.055 dark) CANNOT be applied to a
  //      background layer from an inline style, so that token is not respected
  //      here — grain strength comes from backgroundBlendMode instead. Honouring
  //      it would need a real CSS class with an ::after.
  //   2. This is the one card surface using live backdrop-filter, which the
  //      header comment above explains was kept off cards on purpose (six
  //      live-blur cards on one screen is the FPS risk on panel hardware).
  //      Measure on the TSW-1070 before promoting this to real call sites.
  gradientGlass: {
    // Must stay translucent — behind an opaque background, backdrop-filter
    // has nothing to blur and silently does nothing.
    backgroundColor: "color-mix(in srgb, var(--color-bg-secondary) 62%, transparent)",
    backgroundImage: [
      "var(--grain)", // 1 · noise, topmost
      "var(--gloss-specular)", // 2 · raked highlight
      "var(--surface-glass)", // 3 · frosted white wash
      "var(--surface-tint-soft)", // 4 · primary diagonal, bottom
    ].join(", "),
    backgroundBlendMode: "soft-light, normal, normal, normal",
    backgroundRepeat: "repeat, no-repeat, no-repeat, no-repeat",
    backgroundSize: "140px 140px, cover, cover, cover",
    backdropFilter: "blur(var(--overlay-blur)) saturate(1.15)",
    WebkitBackdropFilter: "blur(var(--overlay-blur)) saturate(1.15)",
    boxShadow: "var(--surface-hairline), var(--surface-edge), var(--elev-rest)",
  },
};

const Card = ({
  children,
  className = "",
  variant = "default",
  tone,            // "audio" | "video" | "lighting" | "climate" | "brand" | "neutral"
  interactive = false,
  style,
  ...props
}) => {
  const surface = SURFACES[variant] || SURFACES.default;
  const [railFrom, railTo] = RAIL_TONES[tone] || RAIL_TONES.brand;

  return (
    <div
      className={`relative rounded-xl p-6 touchPanel:p-8 ${
        interactive ? "press-fx" : ""
      } ${className}`}
      style={{ ...surface, ...style }}
      {...props}
    >
      {tone && (
        // Category rail. Readable from across the room — the cue that makes a
        // wall panel look like an instrument rather than a web page.
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "var(--rail-height)",
            borderRadius: "0.75rem 0.75rem 0 0",
            backgroundImage: `linear-gradient(90deg, ${railFrom} 0%, ${railTo} 100%)`,
          }}
        />
      )}
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = "", ...props }) => (
  <div className={`mb-2 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = "", ...props }) => (
  <h3 className={`text-lg font-semibold text-heading ${className}`} {...props}>
    {children}
  </h3>
);

export const CardContent = ({ children, className = "", ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

// Icon plate — anchors a card title and carries the category hue.
// Usage: <CardIcon tone="lighting"><Lightbulb className="w-5 h-5" /></CardIcon>
export const CardIcon = ({ children, tone = "brand", className = "", ...props }) => {
  const [from, to] = RAIL_TONES[tone] || RAIL_TONES.brand;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg p-1.5 touchPanel:p-2 ${className}`}
      style={{
        backgroundImage: `linear-gradient(140deg, ${from} 0%, ${to} 100%)`,
        color: "#ffffff",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.28), 0 2px 6px -2px var(--color-shadow)",
      }}
      {...props}
    >
      {children}
    </span>
  );
};

export default Card;
