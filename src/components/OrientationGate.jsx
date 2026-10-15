// src/components/OrientationGate.jsx
//
// Landscape lock for Crestron WKWebView / WebXPanel, per the house guide
// (see TOUCHPANEL-BREAKPOINT.md and Docs/crestron-panel-safe-css.md).
//
// Rules this file must keep:
//   1. children render UNCONDITIONALLY - the overlay sits on top. Unmounting
//      them would drop the processor connection on a tilt.
//   2. matchMedia state is initialised synchronously, so a landscape boot never
//      flashes the overlay.
//   3. screen.orientation.lock() is advisory and WKWebView ignores it, so it is
//      wrapped in try/catch and must never throw.
//   4. PANEL RULE (TSW-1070): every visible colour here is an inline rgba()/var().
//      Slash-opacity classes (bg-white/10) silently do not apply on the panel,
//      which would render this overlay black-on-black.
//
// On a wall-mounted TSW-1070 this never shows - the panel is fixed landscape.
// It earns its keep on the iPad / WebXPanel builds.
import { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

const PortraitOverlay = () => (
  <div
    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-8 px-10 animate-gate-fade-in"
    style={{ backgroundColor: 'var(--color-bg)' }}
  >
    <div
      className="relative flex items-center justify-center rounded-3xl animate-gate-reveal"
      style={{
        width: '150px',
        height: '150px',
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        boxShadow: 'var(--elev-raised)',
      }}
    >
      <RotateCcw
        className="animate-gate-rotate"
        style={{ width: '72px', height: '72px', color: 'var(--color-primary)' }}
      />
    </div>

    <div className="text-center animate-gate-reveal">
      <h1
        className="text-3xl font-bold tracking-tight"
        style={{ color: 'var(--color-text)' }}
      >
        Rotate to landscape
      </h1>
      <p
        className="mt-3 text-base font-medium"
        style={{ color: 'var(--color-text-light)' }}
      >
        This control panel runs in landscape only.
      </p>
    </div>

    <div className="flex items-center gap-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="rounded-full animate-gate-dot-pulse"
          style={{
            width: '10px',
            height: '10px',
            backgroundColor: 'var(--color-primary)',
            animationDelay: `${i * 0.28}s`,
          }}
        />
      ))}
    </div>
  </div>
);

export default function OrientationGate({ children }) {
  const [isPortrait, setIsPortrait] = useState(
    () => window.matchMedia('(orientation: portrait)').matches
  );

  useEffect(() => {
    try { screen?.orientation?.lock('landscape').catch(() => {}); } catch { /* WKWebView: advisory only */ }

    const mq = window.matchMedia('(orientation: portrait)');
    const handler = (e) => setIsPortrait(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <>
      {children}
      {isPortrait && <PortraitOverlay />}
    </>
  );
}
