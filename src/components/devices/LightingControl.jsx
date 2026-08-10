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

  // ── Button style definitions ──────────────────────────────────
  // Same three-state treatment as the Aircon +/− buttons (see
  // AirconControl.jsx) so the two controls match. Only the styling is shared —
  // the SHAPE stays as it was here: full-height flex-1 rectangles with
  // rounded-lg, not the Aircon's circles.
  const dimBtnDefaultStyle = {
    backgroundColor: 'var(--color-bg-secondary)',
    color: 'var(--color-text)',
    border: '2px solid var(--color-border)',
    boxShadow:
      '0 4px 12px rgba(0, 0, 0, 0.10), 0 1px 3px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
    transition:
      'background-color 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
  };

  const dimBtnHoverStyle = {
    backgroundColor: 'var(--control-active-bg)',
    borderColor: 'var(--color-primary)',
    boxShadow:
      '0 6px 16px rgba(0, 0, 0, 0.14), 0 2px 4px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
  };

  const dimBtnPressedStyle = {
    backgroundColor: 'var(--color-primary-50)',
    borderColor: 'var(--color-primary)',
    boxShadow:
      'inset 0 2px 6px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.06)',
  };

  const handleBtnEnter = (e) => Object.assign(e.currentTarget.style, dimBtnHoverStyle);
  const handleBtnLeave = (e) => Object.assign(e.currentTarget.style, dimBtnDefaultStyle);
  const handleBtnDown = (e) => Object.assign(e.currentTarget.style, dimBtnPressedStyle);
  const handleBtnUp = (e) => Object.assign(e.currentTarget.style, dimBtnHoverStyle);

  return (
    <div className="flex flex-col gap-2 touchPanel:gap-3 w-full h-full">

      {/* ── Status Display ── */}
      <div className="flex-shrink-0 w-full bg-secondary rounded-lg p-3 touchPanel:p-5 border-2 border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isLightsOn ? (
              <Lightbulb className="w-5 h-5 touchPanel:w-7 touchPanel:h-7 text-success flex-shrink-0" />
            ) : (
              <Power className="w-5 h-5 touchPanel:w-7 touchPanel:h-7 text-muted-foreground flex-shrink-0" />
            )}
            <div className="flex flex-col">
              <span className="text-xs touchPanel:text-sm text-muted-foreground font-medium">Current Mode</span>
              <span className="text-base touchPanel:text-2xl font-bold text-heading leading-tight">
                {activePresetName}
              </span>
            </div>
          </div>
          <span className={`text-2xl touchPanel:text-4xl font-bold ${isLightsOn ? 'text-heading' : 'text-muted-foreground'}`}>
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
          className="press-fx flex-1 h-full flex items-center justify-center font-bold text-2xl touchPanel:text-4xl rounded-lg disabled:opacity-40 disabled:cursor-not-allowed select-none"
          style={dimBtnDefaultStyle}
          onMouseEnter={handleBtnEnter}
          onMouseLeave={handleBtnLeave}
          onMouseDown={handleBtnDown}
          onMouseUp={handleBtnUp}
        >
          −
        </button>
        <button
          onClick={handleIncrease}
          disabled={brightness >= 100}
          className="press-fx flex-1 h-full flex items-center justify-center font-bold text-2xl touchPanel:text-4xl rounded-lg disabled:opacity-40 disabled:cursor-not-allowed select-none"
          style={dimBtnDefaultStyle}
          onMouseEnter={handleBtnEnter}
          onMouseLeave={handleBtnLeave}
          onMouseDown={handleBtnDown}
          onMouseUp={handleBtnUp}
        >
          +
        </button>
      </div>

    </div>
  );
};

export default LightingControl;
