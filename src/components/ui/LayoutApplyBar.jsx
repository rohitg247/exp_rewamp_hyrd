// src/components/ui/LayoutApplyBar.jsx
import { useEffect, useRef, useState } from 'react';

/**
 * LayoutApplyBar
 * A full-width animated fill bar shown while a layout is being applied.
 * 
 * Props:
 *  - icon: React component (Lucide icon)
 *  - label: string — layout name
 *  - duration: number — ms (default 5000)
 *  - onComplete: () => void — called when fill completes
 */
const LayoutApplyBar = ({ icon: IconComponent, label, duration = 5000, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    startRef.current = performance.now();

    const animate = (now) => {
      const elapsed = now - startRef.current;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);

      if (pct < 100) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [duration, onComplete]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-primary-200 shadow-md">
      
      {/* Background track */}
      <div className="absolute inset-0 bg-secondary" />

      {/* Liquid fill layer */}
      <div
        className="absolute inset-y-0 left-0 transition-none"
        style={{ width: `${progress}%` }}
      >
        {/* Solid fill */}
        <div className="absolute inset-0 bg-primary opacity-90" />

        {/* Watery shimmer wave overlay */}
        <div className="absolute inset-0 layout-apply-wave" />

        {/* Right edge ripple */}
        <div className="absolute top-0 right-0 h-full w-6 layout-apply-ripple" />
      </div>

      {/* Foreground content — icon + label + status */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full gap-1.5 px-3">
        <div className={`transition-colors duration-300 ${progress > 50 ? 'text-white' : 'text-primary'}`}>
          <IconComponent className="w-5 h-5 touchPanel:w-6 touchPanel:h-6" />
        </div>
        <span className={`text-xs touchPanel:text-sm font-semibold text-center leading-tight transition-colors duration-300 ${progress > 50 ? 'text-white' : 'text-buttonText-secondary'}`}>
          {label}
        </span>
        {/* 2026-08-03 panel fix: `text-white/70` is slash-opacity — it does not
            apply on the TSW-1070, so this line inherited the dark body colour and
            went black-on-blue mid-apply. Colour set inline instead. */}
        <span
          className="text-xs touchPanel:text-xs font-medium transition-colors duration-300"
          style={{
            color: progress > 50 ? 'rgba(255,255,255,0.7)' : 'var(--color-text-light)',
          }}
        >
          Applying…
        </span>
      </div>

    </div>
  );
};

export default LayoutApplyBar;