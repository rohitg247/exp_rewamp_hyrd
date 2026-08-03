import { useState, useEffect } from 'react';
import { Lightbulb, Power } from 'lucide-react';
import { useDigitalJoin, useAnalogJoin } from '../../hooks/useJoin';
import { DIGITAL_JOINS, ANALOG_JOINS, PRESET_BRIGHTNESS } from '../../crestron/joins';
import { safeSessionStorage } from '../../utils/safeStorage';
import Slider from '../ui/Slider';

const STEP = 5;

const LightingControl = () => {
  const [activePreset, setActivePreset] = useState(() =>
    safeSessionStorage.getItem('lightingActivePreset') || null
  );
  const [brightness, setBrightnessLocal] = useState(() =>
    parseInt(safeSessionStorage.getItem('lightingBrightness') || '50', 10)
  );

  const [, setBrightness] = useAnalogJoin(ANALOG_JOINS.LIGHTS_BRIGHTNESS, 50);

  const [welcomeActive] = useDigitalJoin(DIGITAL_JOINS.LIGHTS_WELCOME);
  const [presentationActive] = useDigitalJoin(DIGITAL_JOINS.LIGHTS_PRESENTATION);
  const [videoConfActive] = useDigitalJoin(DIGITAL_JOINS.LIGHTS_VIDEO_CONF);
  const [meetingActive] = useDigitalJoin(DIGITAL_JOINS.LIGHTS_MEETING);
  const [allOffActive] = useDigitalJoin(DIGITAL_JOINS.LIGHTS_ALL_OFF);

  // Sync from storage
  useEffect(() => {
    const syncFromStorage = () => {
      const storedPreset = safeSessionStorage.getItem('lightingActivePreset');
      const storedBrightness = safeSessionStorage.getItem('lightingBrightness');
      if (storedPreset !== activePreset) setActivePreset(storedPreset);
      if (storedBrightness) {
        const val = parseInt(storedBrightness, 10);
        if (val !== brightness) setBrightnessLocal(val);
      }
    };
    syncFromStorage();
    const id = setInterval(syncFromStorage, 200);
    return () => clearInterval(id);
  }, [activePreset, brightness]);

  // Sync preset from backend
  useEffect(() => {
    if (welcomeActive) {
      setActivePreset('welcome');
      setBrightnessLocal(PRESET_BRIGHTNESS.welcome);
      safeSessionStorage.setItem('lightingActivePreset', 'welcome');
      safeSessionStorage.setItem('lightingBrightness', String(PRESET_BRIGHTNESS.welcome));
    } else if (presentationActive) {
      setActivePreset('presentation');
      setBrightnessLocal(PRESET_BRIGHTNESS.presentation);
      safeSessionStorage.setItem('lightingActivePreset', 'presentation');
      safeSessionStorage.setItem('lightingBrightness', String(PRESET_BRIGHTNESS.presentation));
    } else if (videoConfActive) {
      setActivePreset('videoConf');
      setBrightnessLocal(PRESET_BRIGHTNESS.videoConf);
      safeSessionStorage.setItem('lightingActivePreset', 'videoConf');
      safeSessionStorage.setItem('lightingBrightness', String(PRESET_BRIGHTNESS.videoConf));
    } else if (meetingActive) {
      setActivePreset('meeting');
      setBrightnessLocal(PRESET_BRIGHTNESS.meeting);
      safeSessionStorage.setItem('lightingActivePreset', 'meeting');
      safeSessionStorage.setItem('lightingBrightness', String(PRESET_BRIGHTNESS.meeting));
    } else if (allOffActive) {
      setActivePreset('allOff');
      setBrightnessLocal(PRESET_BRIGHTNESS.allOff);
      safeSessionStorage.setItem('lightingActivePreset', 'allOff');
      safeSessionStorage.setItem('lightingBrightness', String(PRESET_BRIGHTNESS.allOff));
    }
  }, [welcomeActive, presentationActive, videoConfActive, meetingActive, allOffActive]);

  const getActivePresetName = () => {
    if (activePreset === 'custom') return 'Custom';
    if (activePreset === 'welcome') return 'Welcome';
    if (activePreset === 'presentation') return 'Presentation';
    if (activePreset === 'videoConf') return 'Video Conference';
    if (activePreset === 'meeting') return 'Meeting';
    if (activePreset === 'allOff') return 'All Lights Off';
    return 'No Selection';
  };

  const applyBrightness = (newVal) => {
    const clamped = Math.max(0, Math.min(100, newVal));
    setBrightnessLocal(clamped);
    setBrightness(clamped);
    safeSessionStorage.setItem('lightingBrightness', String(clamped));
    console.log(`💡 Brightness set to ${clamped}%`);
  };

  const handleBrightnessChange = (newPercent) => applyBrightness(newPercent);
  // const handleIncrease = (e) => { e?.stopPropagation(); applyBrightness(brightness + STEP); };
  // const handleDecrease = (e) => { e?.stopPropagation(); applyBrightness(brightness - STEP); };
  const handleIncrease = (e) => {
    e?.stopPropagation();
    applyBrightness(brightness + STEP);
    setActivePreset('custom');
    safeSessionStorage.setItem('lightingActivePreset', 'custom');
  };

  const handleDecrease = (e) => {
    e?.stopPropagation();
    applyBrightness(brightness - STEP);
    setActivePreset('custom');
    safeSessionStorage.setItem('lightingActivePreset', 'custom');
  };

  const activePresetName = getActivePresetName();
  const isLightsOn = brightness > 0;

  return (
    <div className="flex flex-col gap-2 touchPanel:gap-3 w-full h-full">

      {/* ── Status Display ── */}
      <div className="flex-shrink-0 w-full bg-[var(--color-bg-secondary)] rounded-lg p-3 touchPanel:p-5 border-2 border-[var(--color-border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isLightsOn ? (
              <Lightbulb className="w-5 h-5 touchPanel:w-7 touchPanel:h-7 text-success flex-shrink-0" />
            ) : (
              <Power className="w-5 h-5 touchPanel:w-7 touchPanel:h-7 text-[var(--color-text-muted)] flex-shrink-0" />
            )}
            <div className="flex flex-col">
              <span className="text-xs touchPanel:text-sm text-[var(--color-text-muted)] font-medium">Current Mode</span>
              <span className="text-base touchPanel:text-2xl font-bold text-heading leading-tight">
                {activePresetName}
              </span>
            </div>
          </div>
          <span className={`text-2xl touchPanel:text-4xl font-bold ${isLightsOn ? 'text-heading' : 'text-[var(--color-text-muted)]'}`}>
            {brightness}%
          </span>
        </div>
      </div>

      {/* ── Slider ── */}
      <div className="flex-shrink-0 w-full px-1">
        <Slider
          value={brightness}
          onChange={handleBrightnessChange}
          min={0}
          max={100}
          step={5}
          showValue={false}
        />
      </div>

      {/* ── −/+ Buttons — fills remaining height ── */}
      <div className="flex gap-2 touchPanel:gap-3 w-full flex-1 min-h-0">
        <button
          onClick={handleDecrease}
          disabled={brightness <= 0}
          className="flex-1 h-full flex items-center justify-center font-semibold text-2xl touchPanel:text-4xl rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor: 'var(--color-bg-glass-light)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border-glass)',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-glass-hover)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-glass-light)'}
        >
          −
        </button>
        <button
          onClick={handleIncrease}
          disabled={brightness >= 100}
          className="flex-1 h-full flex items-center justify-center font-semibold text-2xl touchPanel:text-4xl rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor: 'var(--color-bg-glass-light)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border-glass)',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-glass-hover)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-glass-light)'}
        >
          +
        </button>
      </div>

    </div>
  );
};

export default LightingControl;
