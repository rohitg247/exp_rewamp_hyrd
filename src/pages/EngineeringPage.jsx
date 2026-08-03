// src/pages/EngineeringPage.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { Wrench, ArrowLeft, Users, Layers, GraduationCap, StopCircle, Mic, MicVocal, Camera } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useDigitalJoin } from '../hooks/useJoin';
import { DIGITAL_JOINS } from '../crestron/joins';
import { safeSessionStorage } from '../utils/safeStorage';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Logo from '../assets/images/Actis_logo.jpg';
import WhiteLogo from '../assets/images/White_logo.png';


// ─────────────────────────────────────────────────────────────
// Reboot Countdown Bar — orange→red gradient, wave + ripple
// ─────────────────────────────────────────────────────────────
const RebootCountdownBar = ({ duration = 10000, onComplete }) => {
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

  const secondsLeft = Math.ceil((duration - (progress / 100) * duration) / 1000);

  return (
    <div
      className="relative w-full h-full rounded-lg overflow-hidden shadow-md"
      style={{ border: '2px solid #ef4444' }}
    >
      {/* Background track */}
      <div className="absolute inset-0" style={{ backgroundColor: 'var(--color-bg-secondary)' }} />

      {/* Gradient fill */}
      <div
        className="absolute inset-y-0 left-0 transition-none"
        style={{ width: `${progress}%` }}
      >
        {/* Orange → red base fill */}
        <div className="absolute inset-0 reboot-fill-gradient" />
        {/* Shimmer wave overlay */}
        <div className="absolute inset-0 reboot-fill-wave" />
        {/* Right edge ripple */}
        <div className="absolute top-0 right-0 h-full w-6 reboot-fill-ripple" />
      </div>

      {/* Foreground content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full gap-1.5 px-3">
        <Camera
          className={`w-7 h-7 touchPanel:w-9 touchPanel:h-9 transition-colors duration-300 ${progress > 50 ? 'text-white' : 'text-red-500'}`}
        />
        <span className={`text-sm touchPanel:text-lg font-semibold text-center transition-colors duration-300 ${progress > 50 ? 'text-white' : 'text-red-500'}`}>
          Camera Reboot
        </span>
        {/* 2026-08-03 panel fix: slash-opacity doesn't apply on the panel — the
            countdown went black-on-red mid-reboot. Colour set inline. */}
        <span
          className="text-xs touchPanel:text-sm font-medium transition-colors duration-300"
          style={{ color: progress > 50 ? 'rgba(255,255,255,0.7)' : '#fb923c' }}
        >
          Rebooting… {secondsLeft}s
        </span>
      </div>
    </div>
  );
};


// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────
const EngineeringPage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [activeMode, setActiveMode] = useState(
    () => safeSessionStorage.getItem('ghostImageMode') || null
  );
  const [activeVoiceLift, setActiveVoiceLift] = useState(
    () => safeSessionStorage.getItem('voiceLiftMode') || null
  );

  // 'idle' | 'armed' | 'rebooting'
  const [rebootPhase, setRebootPhase] = useState('idle');
  const armTimerRef = useRef(null);

  // Ghost Image joins
  const [, , sendTownhallPulse]   = useDigitalJoin(DIGITAL_JOINS.GHOST_IMAGE_TOWNHALL);
  const [, , sendCombinedTRPulse] = useDigitalJoin(DIGITAL_JOINS.GHOST_IMAGE_COMBINED_TR);
  const [, , sendCombinedPulse]   = useDigitalJoin(DIGITAL_JOINS.GHOST_IMAGE_COMBINED);
  const [, , sendStopPulse]       = useDigitalJoin(DIGITAL_JOINS.GHOST_IMAGE_STOP);

  // Voice Lift joins
  const [, , sendVoiceLiftEnhanced] = useDigitalJoin(DIGITAL_JOINS.VOICE_LIFT_ENHANCED);
  const [, , sendVoiceLiftNatural]  = useDigitalJoin(DIGITAL_JOINS.VOICE_LIFT_NATURAL);

  // Camera Reboot join
  const [, , sendCameraReboot] = useDigitalJoin(DIGITAL_JOINS.CAMERA_REBOOT);

  useEffect(() => {
    if (activeMode) safeSessionStorage.setItem('ghostImageMode', activeMode);
    else safeSessionStorage.removeItem('ghostImageMode');
  }, [activeMode]);

  useEffect(() => {
    if (activeVoiceLift) safeSessionStorage.setItem('voiceLiftMode', activeVoiceLift);
    else safeSessionStorage.removeItem('voiceLiftMode');
  }, [activeVoiceLift]);

  useEffect(() => {
    return () => { if (armTimerRef.current) clearTimeout(armTimerRef.current); };
  }, []);

  const sendPulse = (setFunc, joinNumber, name) => {
    console.log(`📤 Sending pulse to ${name} (Join: ${joinNumber})`);
    setFunc(true);
    setTimeout(() => setFunc(false), 100);
  };

  const GHOST_MODES = {
    TOWNHALL: {
      key: 'TOWNHALL', name: 'Boardroom', icon: Users,
      sendPulse: sendTownhallPulse, joinNumber: DIGITAL_JOINS.GHOST_IMAGE_TOWNHALL,
    },
    COMBINED_TR: {
      key: 'COMBINED_TR', name: 'Combined TR', icon: GraduationCap,
      sendPulse: sendCombinedTRPulse, joinNumber: DIGITAL_JOINS.GHOST_IMAGE_COMBINED_TR,
    },
    COMBINED: {
      key: 'COMBINED', name: 'Training Room', icon: Layers,
      sendPulse: sendCombinedPulse, joinNumber: DIGITAL_JOINS.GHOST_IMAGE_COMBINED,
    },
  };

  const VOICE_MODES = {
    NATURAL: {
      key: 'NATURAL', name: 'Voice Lift — Natural', icon: Mic,
      sendPulse: sendVoiceLiftNatural, joinNumber: DIGITAL_JOINS.VOICE_LIFT_NATURAL,
    },
    ENHANCED: {
      key: 'ENHANCED', name: 'Voice Lift — Enhanced', icon: MicVocal,
      sendPulse: sendVoiceLiftEnhanced, joinNumber: DIGITAL_JOINS.VOICE_LIFT_ENHANCED,
    },
  };

  const handleGhostSelect = (modeKey) => {
    const selected = GHOST_MODES[modeKey];
    setActiveMode(modeKey);
    sendPulse(selected.sendPulse, selected.joinNumber, selected.name);
  };

  const handleStopGhost = () => {
    setActiveMode(null);
    sendPulse(sendStopPulse, DIGITAL_JOINS.GHOST_IMAGE_STOP, 'Stop Ghost Image');
  };

  const handleVoiceLiftSelect = (modeKey) => {
    const selected = VOICE_MODES[modeKey];
    setActiveVoiceLift(modeKey);
    sendPulse(selected.sendPulse, selected.joinNumber, selected.name);
  };

  const handleCameraReboot = () => {
    if (rebootPhase === 'idle') {
      setRebootPhase('armed');
      armTimerRef.current = setTimeout(() => setRebootPhase('idle'), 3000);
    } else if (rebootPhase === 'armed') {
      if (armTimerRef.current) clearTimeout(armTimerRef.current);
      sendPulse(sendCameraReboot, DIGITAL_JOINS.CAMERA_REBOOT, 'Camera Reboot');
      setRebootPhase('rebooting');
    }
  };

  const handleRebootComplete = useCallback(() => {
    setRebootPhase('idle');
  }, []);

  const showRebootBar = rebootPhase === 'rebooting';
  const rebootArmed  = rebootPhase === 'armed';

  // Shared button class for both columns — icon on top, label below
  const btnClass = "flex-1 flex flex-col items-center justify-center space-y-2 touchPanel:space-y-3 w-full min-h-0";

  return (
    <div className="h-screen w-screen bg-theme-bg flex flex-col overflow-hidden">

      {/* ── Top Bar ── */}
      <div
        className="grid grid-cols-[auto_1fr_auto] items-center px-6 touchPanel:px-8 py-3 touchPanel:py-4 flex-shrink-0 border-b"
        style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', height: '72px' }}
      >
        <div className="flex justify-start flex-shrink-0">
          <img src={isDarkMode ? WhiteLogo : Logo} alt="Logo" className="h-12 touchPanel:h-18 w-auto object-contain" />
        </div>
        <div className="flex justify-center items-center">
          <div className="flex items-center space-x-2 touchPanel:space-x-3">
            <Wrench className="w-5 h-5 md:w-6 md:h-6 touchPanel:w-7 touchPanel:h-7" style={{ color: 'var(--color-primary-500)' }} />
            <h1 className="text-lg md:text-xl touchPanel:text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Engineering</h1>
          </div>
        </div>
        <div className="flex justify-end flex-shrink-0">
          <Button variant="secondary" size="touchPanel" onClick={() => navigate(-1)} className="flex items-center space-x-2 touchPanel:px-5 touchPanel:py-4">
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 touchPanel:w-6 touchPanel:h-6" />
            <span className="touchPanel:text-xl">Back</span>
          </Button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 flex items-center justify-center p-6 touchPanel:p-10 overflow-hidden">
        <div className="w-full max-w-5xl grid grid-cols-2 gap-6 touchPanel:gap-8 h-full max-h-[600px] touchPanel:max-h-[750px]">

          {/* ── LEFT CARD: Ghost Images ── */}
          <Card variant="glass" className="flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="flex items-center space-x-2">
                <Layers className="w-5 h-5 touchPanel:w-6 touchPanel:h-6" />
                <span className="text-base md:text-lg touchPanel:text-xl">Ghost Images</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 px-4 touchPanel:px-6 pb-4 touchPanel:pb-6 flex flex-col justify-between gap-3 touchPanel:gap-4 min-h-0">

              {/* Ghost mode buttons */}
              {Object.values(GHOST_MODES).map((mode) => {
                const Icon = mode.icon;
                const isActive = activeMode === mode.key;
                return (
                  <Button
                    key={mode.key}
                    variant={isActive ? 'primary' : 'secondary'}
                    size="touchPanel"
                    onClick={() => handleGhostSelect(mode.key)}
                    className={btnClass}
                  >
                    <Icon className="w-7 h-7 touchPanel:w-10 touchPanel:h-10 flex-shrink-0" />
                    <span className="text-sm md:text-base touchPanel:text-xl font-semibold">{mode.name}</span>
                  </Button>
                );
              })}

              {/* Divider */}
              <div className="border-t flex-shrink-0" style={{ borderColor: 'var(--color-border)' }} />

              {/* Stop Ghost */}
              <Button
                variant="secondary"
                size="touchPanel"
                onClick={handleStopGhost}
                className={btnClass}
              >
                <StopCircle className="w-7 h-7 touchPanel:w-10 touchPanel:h-10 flex-shrink-0" />
                <span className="text-sm md:text-base touchPanel:text-xl font-semibold">Stop Ghost</span>
              </Button>

            </CardContent>
          </Card>

          {/* ── RIGHT CARD: Voice & Camera ── */}
          <Card variant="glass" className="flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="flex items-center space-x-2">
                <Mic className="w-5 h-5 touchPanel:w-6 touchPanel:h-6" />
                <span className="text-base md:text-lg touchPanel:text-xl">Voice & Camera</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 px-4 touchPanel:px-6 pb-4 touchPanel:pb-6 flex flex-col justify-between gap-3 touchPanel:gap-4 min-h-0">

              {/* Voice Lift buttons — same size as ghost buttons */}
              {Object.values(VOICE_MODES).map((mode) => {
                const Icon = mode.icon;
                const isActive = activeVoiceLift === mode.key;
                return (
                  <Button
                    key={mode.key}
                    variant={isActive ? 'primary' : 'secondary'}
                    size="touchPanel"
                    onClick={() => handleVoiceLiftSelect(mode.key)}
                    className={btnClass}
                  >
                    <Icon className="w-7 h-7 touchPanel:w-10 touchPanel:h-10 flex-shrink-0" />
                    <span className="text-sm md:text-base touchPanel:text-xl font-semibold">{mode.name}</span>
                  </Button>
                );
              })}

              {/* Divider */}
              <div className="border-t flex-shrink-0" style={{ borderColor: 'var(--color-border)' }} />

              {/* Camera Reboot — same flex-1 slot as Stop Ghost on the left */}
              <div className="flex-1 relative min-h-0">

                {/* Button layer */}
                <div className={`absolute inset-0 flex flex-col transition-all duration-250 ease-in-out ${
                  showRebootBar
                    ? 'opacity-0 scale-95 pointer-events-none'
                    : 'opacity-100 scale-100 pointer-events-auto'
                }`}>
                  <Button
                    variant={rebootArmed ? 'warning' : 'secondary'}
                    size="touchPanel"
                    onClick={handleCameraReboot}
                    className="flex-1 flex flex-col items-center justify-center space-y-2 touchPanel:space-y-3 w-full min-h-0"
                  >
                    <Camera className="w-7 h-7 touchPanel:w-10 touchPanel:h-10 flex-shrink-0" />
                    <span className="text-sm md:text-base touchPanel:text-xl font-semibold">
                      {rebootArmed ? 'Tap again to confirm' : 'Camera Reboot'}
                    </span>
                  </Button>
                  {/* Hint text sits outside button, below — same level as card bottom */}
                  <p className="text-center text-xs touchPanel:text-sm pt-1.5 flex-shrink-0"
                    style={{ color: rebootArmed ? '#f97316' : 'var(--color-text-light)' }}>
                    {rebootArmed ? '⚠️ Armed — tap again within 3s' : 'Double-tap to reboot'}
                  </p>
                </div>

                {/* Countdown bar layer */}
                <div className={`absolute inset-0 transition-all duration-300 ease-in-out ${
                  showRebootBar
                    ? 'opacity-100 scale-100 pointer-events-none'
                    : 'opacity-0 scale-95 pointer-events-none'
                }`}>
                  {showRebootBar && (
                    <RebootCountdownBar duration={10000} onComplete={handleRebootComplete} />
                  )}
                </div>

              </div>

            </CardContent>
          </Card>

        </div>
      </div>

    </div>
  );
};

export default EngineeringPage;