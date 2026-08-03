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

const STEP_DURATION = 100;
const STEP_TRANSITION = 10;
const DONE_HOLD = 45;

// Copy-3 frosted-glass card style (confirmed working on the TSW-1070) — reused
// for the landing card and the boot panel so they share one elegant aesthetic.
const glassStyle = {
  WebkitBackdropFilter: "blur(12px)",
  backdropFilter: "blur(12px)",
  backgroundColor: "rgba(255,255,255,0.06)",
  borderColor: "rgba(255,255,255,0.20)",
  boxShadow:
    "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(255,255,255,0.1)",
};

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

  // Reset all mics to muted on LandingPage mount (startup/shutdown cycle)
  useEffect(() => {
    setCeiling1Muted(0);
    setCeiling2Muted(0);
    setHeadworn1Muted(0);
    setHeadworn2Muted(0);
    setHandheldMuted(0);
    setLapelMuted(0);
    console.log('🎤 All mics reset to MUTED on LandingPage mount');
  }, []);

  // Startup join hook
  const [, , sendStartupCombined] = useDigitalJoin(DIGITAL_JOINS.SYSTEM_STARTUP_COMBINED);

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

    // Main Page defaults its source to Air Media (SourceSelection consumes this flag on mount).
    safeSessionStorage.setItem('combinedForceAirMediaSource', 'true');

    // Lights: show "Welcome" preset selected on startup — UI only, no backend pulse.
    // The lighting components seed their active preset from this sessionStorage key.
    safeSessionStorage.setItem('lightingActivePreset', 'welcome');
    safeSessionStorage.setItem('lightingBrightness', String(PRESET_BRIGHTNESS.welcome));
    console.log('💡 Lights primed to Welcome for startup (UI only, no pulse)');

    // Send startup pulse (navigation happens at the end of the boot sequence)
    sendPulse(sendStartupCombined, DIGITAL_JOINS.SYSTEM_STARTUP_COMBINED, 'SYSTEM_STARTUP_COMBINED');
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

  const orbLayer = (
    <div className="absolute inset-0 opacity-10" aria-hidden="true">
      <div className="absolute top-20 left-20 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" />
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500">
      {/* Animated Grid Background */}
      {gridLayer}

      {/* Floating orbs */}
      {orbLayer}

      {/* Paper grain */}
      {grainLayer}

      {/* Landing Content (copy-3 basic screen) */}
      <div
        className={`relative z-10 flex items-center justify-center min-h-screen px-6 touchPanel:px-12 transition-all duration-500 ${
          isEntering ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        <div
          className="rounded-[3rem] touchPanel:rounded-[4rem] p-12 touchPanel:p-24 border max-w-3xl touchPanel:max-w-5xl w-full animate-fadeIn"
          style={glassStyle}
        >
          {/* Logo with glow effect */}
          <div className="relative mb-8 touchPanel:mb-16">
            <div
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.3)", filter: "blur(48px)" }}
            />
            <div
              className="relative w-32 h-32 touchPanel:w-48 touchPanel:h-48 rounded-3xl touchPanel:rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl"
              style={{
                backgroundColor: "rgba(255,255,255,0.20)",
                border: "1px solid rgba(255,255,255,0.30)",
              }}
            >
              <Building2 className="w-16 h-16 touchPanel:w-24 touchPanel:h-24 text-white drop-shadow-lg" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-6xl touchPanel:text-8xl font-semibold text-white mb-6 touchPanel:mb-12 text-center animate-slideUp transition-all duration-500">
            {MAIN_PAGE_TITLE}
          </h1>

          {/* Enter Button */}
          <div className="animate-slideUp flex justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={handleEnterSystem}
              disabled={isEntering}
              className="text-white text-xl touchPanel:text-3xl px-12 touchPanel:px-24 py-6 touchPanel:py-12 rounded-2xl touchPanel:rounded-3xl shadow-2xl transition-all duration-300 hover:scale-105"
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
            {/* Glow set inline: `shadow-success/50` is slash-opacity and does not
                apply on the panel, so the status dot lost its halo on hardware. */}
            <div
              className="w-3 h-3 touchPanel:w-6 touchPanel:h-6 bg-success rounded-full animate-pulse"
              style={{ boxShadow: "0 0 12px 2px rgba(16,185,129,0.5)" }}
            ></div>
            <span className="text-lg touchPanel:text-2xl">System ready for control</span>
          </div>
        </div>
      </div>

      {/* ===== Boot / startup sequence overlay — built on the copy-3 aesthetic ===== */}
      {isEntering && (
        <div className="fixed inset-0 z-20 overflow-hidden bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 flex items-center justify-center px-6">
          {/* Same ambient backdrop as the landing */}
          {gridLayer}
          {orbLayer}
          {grainLayer}

          {/* Glass panel (same frosted card as the landing) */}
          <div
            className="relative z-10 rounded-[3rem] touchPanel:rounded-[4rem] p-10 md:p-14 touchPanel:p-24 border max-w-xl touchPanel:max-w-4xl w-full animate-fadeIn"
            style={{ ...glassStyle, color: "#ffffff" }}
          >
            <div className="flex flex-col items-center text-center">
              {/* Header chip */}
              <div className="flex items-center gap-3 mb-8 touchPanel:mb-12">
                <div
                  className="w-2.5 h-2.5 touchPanel:w-4 touchPanel:h-4 bg-success rounded-full animate-pulse"
                  style={{ boxShadow: "0 0 10px 2px rgba(16,185,129,0.5)" }}
                />
                <span
                  className="text-sm touchPanel:text-xl font-semibold uppercase tracking-[0.2em]"
                  style={{ color: "rgba(255,255,255,0.72)" }}
                >
                  System startup
                </span>
              </div>

              {/* Current step icon — same glowing white-glass ring as the landing logo */}
              <div className="relative mb-8 touchPanel:mb-12">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: "rgba(255,255,255,0.3)", filter: "blur(48px)" }}
                />
                <div
                  className="relative w-24 h-24 touchPanel:w-40 touchPanel:h-40 rounded-3xl touchPanel:rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl transition-colors duration-300"
                  style={{
                    backgroundColor: isDone ? "rgba(16,185,129,0.18)" : "rgba(255,255,255,0.20)",
                    border: isDone ? "1px solid rgba(16,185,129,0.45)" : "1px solid rgba(255,255,255,0.30)",
                  }}
                >
                  {isDone ? (
                    <Check className="w-12 h-12 touchPanel:w-20 touchPanel:h-20 text-success drop-shadow-lg" />
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
              <div className="flex items-center justify-center gap-2 touchPanel:gap-3 flex-wrap mb-8 touchPanel:mb-12">
                {INIT_STEPS.map((step, idx) => {
                  const done = completedSteps.includes(idx) || isDone;
                  const active = idx === stepIndex && !isDone;
                  return (
                    <span
                      key={step.key}
                      className={`rounded-full transition-all duration-200 w-2.5 h-2.5 touchPanel:w-4 touchPanel:h-4 ${
                        active ? "scale-110" : ""
                      }`}
                      style={{
                        backgroundColor: active
                          ? "#ffffff"
                          : done
                          ? "var(--color-success)"
                          : "rgba(255,255,255,0.25)",
                      }}
                    />
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-md touchPanel:max-w-2xl">
                <div
                  className="flex justify-between text-xs md:text-sm touchPanel:text-lg mb-3 uppercase tracking-[0.16em]"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  <span>Boot sequence</span>
                  <span className="tabular-nums">{Math.round(progress)}%</span>
                </div>
                <div
                  className="w-full rounded-full h-2.5 touchPanel:h-4 overflow-hidden"
                  style={{ backgroundColor: "rgba(255,255,255,0.22)" }}
                >
                  <div
                    className="h-2.5 touchPanel:h-4 rounded-full transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%`, backgroundColor: "#ffffff" }}
                  />
                </div>
              </div>

              {/* Counter */}
              <p
                className="mt-5 touchPanel:mt-8 text-xs touchPanel:text-lg tracking-[0.06em]"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
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
