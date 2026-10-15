// src/pages/LandingPage.jsx
import { useState, useEffect, useRef } from "react";
import { useAudioContext } from "../context/AudioContext";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  ArrowRight,
  Power,
  Check,
  Lightbulb,
  Wind,
  Thermometer,
  Volume2,
  MicOff,
  Monitor,
  Camera,
} from "lucide-react";
import Button from "../components/ui/Button";
import { useDigitalJoin } from "../hooks/useJoin";
import { DIGITAL_JOINS, PRESET_BRIGHTNESS } from "../crestron/joins";
import { safeSessionStorage } from "../utils/safeStorage";
import { DISPLAY_CONFIGS } from "../components/devices/DisplayPowerGrid";

const INIT_STEPS = [
  { key: "lights", label: "Turning on lights...", short: "Lights", icon: Lightbulb },
  { key: "ac-on", label: "Powering AC on...", short: "AC On", icon: Wind },
  { key: "ac-temp", label: "Setting AC temperature...", short: "Set Temp", icon: Thermometer },
  { key: "speakers", label: "Unmuting speakers...", short: "Speaker", icon: Volume2 },
  { key: "mics", label: "Muting microphones...", short: "Mute Mic", icon: MicOff },
  { key: "display", label: "Powering displays on...", short: "Display", icon: Monitor },
  { key: "camera", label: "Activating camera...", short: "Camera", icon: Camera },
];

// const STEP_DURATION = 2075;
// const STEP_TRANSITION = 180;
// const DONE_HOLD = 450;

// Matches ShutdownScreen: 7 × 1357 ≈ 9.5s fill + 0.5s hold = 10s total
const STEP_DURATION = 1357;
const STEP_TRANSITION = 180;
const DONE_HOLD = 500;

// The frosted card, ambient orbs, step dots and progress bar now come from the
// .landing-*-subtle / .startup-*-subtle classes in global.css. They were written
// for this screen and never wired up; after the color-mix migration they are
// panel-safe AND theme-reactive, which the inline rgba literals here were not.
const MAIN_PAGE_TITLE = "Main Page";
const MAIN_PAGE_ROUTE = "/main-page";

const LandingPage = () => {
  const navigate = useNavigate();
  const [isEntering, setIsEntering] = useState(false);
  const { setCeiling1Muted, setCeiling2Muted, setHeadworn1Muted, setHeadworn2Muted, setHandheldMuted, setLapelMuted } = useAudioContext();

  const [stepIndex, setStepIndex] = useState(0);
  const [stepPhase, setStepPhase] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);

  const progressRef = useRef(null);
  const timerRef = useRef(null);

  // Reset all mics to unmuted on LandingPage mount (startup/shutdown cycle) — UI only
  useEffect(() => {
    setCeiling1Muted(1);
    setCeiling2Muted(1);
    setHeadworn1Muted(1);
    setHeadworn2Muted(1);
    setHandheldMuted(1);
    setLapelMuted(1);
    console.log('🎤 All mics reset to UNMUTED on LandingPage mount');
  }, []);

  // Startup join hook
  const [, , sendStartupCombined] = useDigitalJoin(DIGITAL_JOINS.SYSTEM_STARTUP);

  // Pulse helper (100ms true→false)
  const sendPulse = (setFunction, joinNumber, name) => {
    console.log(`📤 Sending pulse to ${name} (Join: ${joinNumber})`);
    setFunction(true);
    setTimeout(() => {
      setFunction(false);
      console.log(`✅ Pulse completed for ${name} (Join: ${joinNumber})`);
    }, 100);
  };

  // Animated boot sequence — drives the step messages + progress bar, then navigates
  useEffect(() => {
    if (!isEntering) return;

    const totalDuration = INIT_STEPS.length * STEP_DURATION;
    const progressStep = 100 / (totalDuration / 50);

    setStepIndex(0);
    setStepPhase("enter");
    setProgress(0);
    setIsDone(false);
    setCompletedSteps([]);

    progressRef.current = setInterval(() => {
      setProgress((prev) => Math.min(prev + progressStep, 100));
    }, 50);

    const runStep = (index) => {
      setStepIndex(index);
      setStepPhase("enter");

      timerRef.current = setTimeout(() => {
        setStepPhase("visible");

        const isLast = index === INIT_STEPS.length - 1;

        if (isLast) {
          timerRef.current = setTimeout(() => {
            setCompletedSteps(INIT_STEPS.map((_, idx) => idx));
            setIsDone(true);
            setProgress(100);
            clearInterval(progressRef.current);

            timerRef.current = setTimeout(() => {
              navigate(MAIN_PAGE_ROUTE);
            }, DONE_HOLD);
          }, STEP_DURATION - STEP_TRANSITION);
        } else {
          timerRef.current = setTimeout(() => {
            setStepPhase("exit");
            setCompletedSteps((prev) => [...prev, index]);

            timerRef.current = setTimeout(() => {
              runStep(index + 1);
            }, STEP_TRANSITION);
          }, STEP_DURATION - STEP_TRANSITION * 2);
        }
      }, STEP_TRANSITION);
    };

    runStep(0);

    return () => {
      clearInterval(progressRef.current);
      clearTimeout(timerRef.current);
    };
  }, [isEntering, navigate]);

  const handleEnterSystem = () => {
    setIsEntering(true);
    console.log(`🚀 Entering ${MAIN_PAGE_TITLE}...`);

    // Show AC as ON by default at startup (backend turns it on; no signal sent from here).
    // The force-on flag makes AcStatusListener hold ON until the backend confirms ON.
    safeSessionStorage.setItem('acPowerBoardroom', 'true');
    safeSessionStorage.setItem('acPower', 'true');
    safeSessionStorage.setItem('acForceOnBoardroom', 'true');
    console.log('❄️ AC primed ON for startup (acForceOnBoardroom set)');

    // Displays: all ON with HDMI 1 selected, camera awake — UI only, backend switches them on startup.
    // (Main Page mode defaults to Presentation: SourceSelection seeds it when no routing is stored.)
    DISPLAY_CONFIGS.forEach(({ storageKey }) => {
      safeSessionStorage.setItem(storageKey, 'on');
      safeSessionStorage.setItem(`${storageKey}Input`, 'hdmi1');
    });
    safeSessionStorage.setItem('cameraPowerMode', 'wake');
    // Camera comes up on Sightline AI - string must match PRESET_NAMES[3] in CameraControl.jsx
    safeSessionStorage.setItem("cameraActivePreset", "Sightline_AI");

    // Lights: show "Welcome" preset selected on startup — UI only, no backend pulse.
    // The lighting components seed their active preset from this sessionStorage key.
    safeSessionStorage.setItem('lightingActivePreset', 'welcome');
    safeSessionStorage.setItem('lightingBrightness', String(PRESET_BRIGHTNESS.welcome));
    console.log('💡 Lights primed to Welcome for startup (UI only, no pulse)');

    // Send startup pulse (navigation happens at the end of the boot sequence)
    sendPulse(sendStartupCombined, DIGITAL_JOINS.SYSTEM_STARTUP, 'SYSTEM_STARTUP');
  };

  const msgTransformClass =
    stepPhase === "enter"
      ? "translate-y-2 opacity-0"
      : stepPhase === "exit"
      ? "-translate-y-2 opacity-0"
      : "translate-y-0 opacity-100";

  const currentStep = INIT_STEPS[stepIndex] || INIT_STEPS[0];
  const CurrentStepIcon = currentStep.icon;

  // Copy-3 ambient backdrop (grid + blurred orbs) — confirmed working on the panel.
  const gridLayer = (
    <div className="absolute inset-0 opacity-20" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />
    </div>
  );

  // Themed drifting orbs. The radial-gradient bakes the soft edge in, so there is
  // no filter:blur or mix-blend-mode for the panel to composite per frame.
  const orbLayer = (
    <div className="landing-orb-layer" aria-hidden="true">
      <div className="landing-orb landing-orb-1" />
      <div className="landing-orb landing-orb-2" />
      <div className="landing-orb landing-orb-3" />
    </div>
  );

  // 2026-08-03 revamp: paper grain over the big primary gradient. A 1920x1200
  // panel shows visible banding across a gradient this large; static SVG noise
  // breaks it up and reads as premium print rather than flat web. No repaint.
  const grainLayer = (
    <div
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
      style={{
        backgroundImage: "var(--grain)",
        opacity: "var(--grain-opacity)",
        mixBlendMode: "overlay",
      }}
    />
  );

  return (
    <div className="h-full relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500">
      {/* Animated Grid Background */}
      {gridLayer}

      {/* Floating orbs */}
      {orbLayer}

      {/* Paper grain */}
      {grainLayer}

      {/* Landing Content (copy-3 basic screen) */}
      <div
        className={`relative z-10 flex items-center justify-center min-h-full px-6 touchPanel:px-12 transition-all duration-500 ${
          isEntering ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        <div className="landing-shell-subtle rounded-[3rem] touchPanel:rounded-[4rem] p-12 touchPanel:p-24 max-w-3xl touchPanel:max-w-5xl w-full animate-fadeIn">
          {/* Logo with glow effect */}
          {/* The glow is .landing-icon-wrap-subtle::before — a radial-gradient,
              not a filter:blur, so the panel composites it for free. */}
          <div className="landing-icon-wrap-subtle mb-8 touchPanel:mb-16">
            <div className="landing-icon-ring-subtle mx-auto">
              <Building2 className="w-16 h-16 touchPanel:w-24 touchPanel:h-24 text-white drop-shadow-lg" />
            </div>
          </div>

          {/* Title */}
          <h1 className="landing-room-title-subtle mb-6 touchPanel:mb-12 text-center animate-slideUp transition-all duration-500">
            {MAIN_PAGE_TITLE}
          </h1>

          {/* Enter Button */}
          <div className="animate-slideUp flex justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={handleEnterSystem}
              disabled={isEntering}
              className="landing-enter-btn-subtle text-white text-xl touchPanel:text-3xl px-12 touchPanel:px-24 py-6 touchPanel:py-12 rounded-2xl touchPanel:rounded-3xl shadow-2xl transition-all duration-300 hover:scale-105"
              style={{
                WebkitBackdropFilter: "blur(4px)",
                backdropFilter: "blur(4px)",
                backgroundColor: "rgba(255,255,255,0.20)",
                borderColor: "rgba(255,255,255,0.40)",
                borderWidth: "2px",
              }}
              onMouseEnter={(e) => !isEntering && (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.30)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.20)")}
            >
              <div className="flex items-center gap-4 touchPanel:gap-8">
                <Power className="w-6 h-6 touchPanel:w-12 touchPanel:h-12" />
                <span>Enter Control System</span>
                <ArrowRight
                  className={`w-6 h-6 touchPanel:w-12 touchPanel:h-12 transition-transform duration-300 ${
                    isEntering ? "translate-x-2" : ""
                  }`}
                />
              </div>
            </Button>
          </div>

          {/* Status Indicator */}
          <div className="mt-10 touchPanel:mt-16 flex items-center justify-center gap-3 touchPanel:gap-6 text-white animate-slideUp">
            {/* .startup-status-dot-subtle carries both fill and halo. bg-success
                resolved through the --color-success alias; the class uses the
                numbered step, and its glow replaces the slash-opacity shadow that
                never applied on the panel. */}
            <div className="startup-status-dot-subtle animate-pulse" />
            <span className="text-lg touchPanel:text-2xl">System ready for control</span>
          </div>
        </div>
      </div>

      {/* ===== Boot / startup sequence overlay — built on the copy-3 aesthetic ===== */}
      {isEntering && (
        <div className="startup-scrim fixed inset-0 z-20 overflow-hidden flex items-center justify-center px-6">
          {/* Same ambient backdrop as the landing */}
          {gridLayer}
          {orbLayer}
          {grainLayer}

          {/* Glass panel (same frosted card as the landing) */}
          <div
            className="startup-panel-subtle relative z-10 rounded-[3rem] touchPanel:rounded-[4rem] p-10 md:p-14 touchPanel:p-24 max-w-xl touchPanel:max-w-4xl w-full animate-fadeIn"
            style={{ color: "#ffffff" }}
          >
            <div className="flex flex-col items-center text-center">
              {/* Header chip */}
              <div className="startup-header-subtle mb-8 touchPanel:mb-12">
                <div className="startup-status-dot-subtle animate-pulse" />
                <span className="startup-header-text-subtle">System startup</span>
              </div>

              {/* Current step icon — same glowing white-glass ring as the landing logo */}
              <div className="startup-icon-wrap-subtle mb-8 touchPanel:mb-12">
                <div
                  className={`${isDone ? "startup-done-subtle" : "startup-current-icon-subtle"} transition-colors duration-300`}
                >
                  {isDone ? (
                    <Check
                      className="w-12 h-12 touchPanel:w-20 touchPanel:h-20 drop-shadow-lg"
                      style={{ color: "var(--color-success-500)" }}
                    />
                  ) : (
                    <CurrentStepIcon className="w-12 h-12 touchPanel:w-20 touchPanel:h-20 text-white drop-shadow-lg" />
                  )}
                </div>
              </div>

              {/* Step message (animates via transform/opacity) */}
              <div className="h-14 touchPanel:h-24 flex items-center justify-center overflow-hidden mb-2">
                <p
                  className={`text-white text-3xl md:text-4xl touchPanel:text-6xl font-semibold tracking-tight transition-all duration-200 ease-in-out ${msgTransformClass}`}
                >
                  {isDone ? "System ready" : currentStep.label}
                </p>
              </div>

              <p
                className="text-base touchPanel:text-2xl mb-8 touchPanel:mb-12"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                {isDone ? "Startup sequence complete" : currentStep.short}
              </p>

              {/* Mini step dots */}
              <div className="startup-mini-steps mb-8 touchPanel:mb-12">
                {INIT_STEPS.map((step, idx) => {
                  const done = completedSteps.includes(idx) || isDone;
                  const active = idx === stepIndex && !isDone;
                  return (
                    <span
                      key={step.key}
                      className={`startup-mini-step ${active ? "is-active" : done ? "is-done" : ""}`}
                    />
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-md touchPanel:max-w-2xl">
                <div className="startup-progress-meta flex justify-between text-xs md:text-sm touchPanel:text-lg mb-3 uppercase tracking-[0.16em]">
                  <span>Boot sequence</span>
                  <span className="tabular-nums">{Math.round(progress)}%</span>
                </div>
                <div className="startup-progress-track-subtle w-full rounded-full h-2.5 touchPanel:h-4 overflow-hidden">
                  <div
                    className="startup-progress-fill-subtle h-2.5 touchPanel:h-4 rounded-full transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Counter */}
              <p className="startup-counter-subtle mt-5 touchPanel:mt-8 text-xs touchPanel:text-lg tracking-[0.06em]">
                {isDone
                  ? `${INIT_STEPS.length} / ${INIT_STEPS.length}`
                  : `${stepIndex + 1} / ${INIT_STEPS.length}`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;