import { useState, useEffect } from 'react';
import { Power, Monitor, MicOff, Volume2, Wind, Lightbulb } from 'lucide-react';

// Device-shutdown messages, cycled in sync with the progress bar
const SHUTDOWN_STEPS = [
  { label: "Turning off displays...",           icon: Monitor },
  { label: "Muting microphones...",             icon: MicOff },
  { label: "Powering down speakers...",         icon: Volume2 },
  { label: "Switching off air conditioning...", icon: Wind },
  { label: "Turning off lights...",             icon: Lightbulb },
  { label: "Ending session...",                 icon: Power },
];

const ShutdownScreen = ({ isVisible, onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      return;
    }

    // Shutdown screen total = FILL_MS + 500ms hold.
    // Driven by requestAnimationFrame so the bar fills smoothly per frame (~60fps)
    // instead of in visible steps. Change FILL_MS to adjust the duration.
    const FILL_MS = 9500; // 9.5s fill + 0.5s hold = 10s total
    let rafId;
    let completeTimer;
    let start;

    const tick = (ts) => {
      if (start === undefined) start = ts;
      const elapsed = ts - start;
      const pct = Math.min(100, (elapsed / FILL_MS) * 100);
      setProgress(pct);
      if (elapsed < FILL_MS) {
        rafId = requestAnimationFrame(tick);
      } else {
        completeTimer = setTimeout(() => onComplete(), 500); // hold at 100% before leaving
      }
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(completeTimer);
    };
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  // Current device-shutdown step, derived from progress (synced to the bar/ring)
  const stepIndex = Math.min(
    SHUTDOWN_STEPS.length - 1,
    Math.floor((progress / 100) * SHUTDOWN_STEPS.length)
  );
  const StepIcon = SHUTDOWN_STEPS[stepIndex].icon;

  return (
  <>
    {/* 2026-08-06 UI revamp: backdrop restyle only, the rAF progress logic above
        is untouched. Was `from-primary via-primary/90 to-black opacity-95` —
        via-primary/90 is slash-opacity, which does not apply on the panel, so
        the middle gradient stop silently dropped on hardware. Inline literals
        now, plus a vignette to pull focus to the centre. */}
    <div
      className="fixed inset-0 z-50"
      style={{
        backgroundImage: `
          radial-gradient(ellipse 100% 100% at 50% 50%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.58) 100%),
          linear-gradient(155deg, var(--color-primary-900) 0%, var(--color-primary-700) 48%, #05070d 100%)`,
      }}
    >
      <div className="shutdown-shimmer" aria-hidden="true" />
    </div>

    {/* Content Layer at Full Opacity */}
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="text-center space-y-8 touchPanel:space-y-16 animate-fadeIn pointer-events-auto">
        {/* Logo/Icon */}
        <div className="relative">
          <div className="w-24 h-24 touchPanel:w-40 touchPanel:h-40 bg-danger rounded-full flex items-center justify-center mx-auto mb-8 touchPanel:mb-16 shadow-2xl">
            <Power className="w-12 h-12 touchPanel:w-24 touchPanel:h-24 text-white" />
          </div>

          {/* Progress Circle */}
          <div className="relative w-32 h-32 touchPanel:w-64 touchPanel:h-64 mx-auto">
            <svg className="w-32 h-32 touchPanel:w-64 touchPanel:h-64 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background Circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="8"
                fill="none"
                className="touchPanel:stroke-[11.2]"
              />
              {/* Progress Circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#f21212"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${progress * 2.51} 251`}
                className="touchPanel:stroke-[11.2]"
              />
            </svg>
            
            {/* Progress Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl touchPanel:text-5xl font-bold text-white">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>

        {/* Status Text */}
        <div className="space-y-4 touchPanel:space-y-8">
          <h2
            className="text-4xl touchPanel:text-7xl text-white"
            style={{ fontWeight: 300, letterSpacing: '-0.02em' }}
          >
            Putting on standby...
          </h2>
          {/* Hairline rule — the cue that separates a title from a status line
              without adding another block of chrome. */}
          <div
            aria-hidden="true"
            className="mx-auto h-px w-48 touchPanel:w-80"
            style={{
              backgroundImage:
                'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 100%)',
            }}
          />
          <div
            key={stepIndex}
            className="flex items-center justify-center gap-3 touchPanel:gap-4 animate-fadeIn"
          >
            <StepIcon className="w-5 h-5 touchPanel:w-8 touchPanel:h-8 text-gray-300 flex-shrink-0" />
            <p className="text-xl touchPanel:text-3xl text-gray-200">
              {SHUTDOWN_STEPS[stepIndex].label}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-80 touchPanel:w-[40rem] mx-auto">
          {/* Inline colors: bg-danger resolves via a nested var() chain the Crestron panel drops,
              so the fill paints nothing on the panel. Literal #f21212 matches the SVG ring. */}
          <div
            className="w-full rounded-full h-1.5 touchPanel:h-2.5 overflow-hidden"
            style={{ backgroundColor: "rgba(255,255,255,0.16)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                backgroundImage: "linear-gradient(90deg, #b90d0d 0%, #f21212 100%)",
                boxShadow: "0 0 10px rgba(242,18,18,0.55)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  </>

  );
};

export default ShutdownScreen;