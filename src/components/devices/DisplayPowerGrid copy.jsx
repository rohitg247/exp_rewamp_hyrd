import { useState } from 'react';
import { Monitor, MonitorX, Play, Power } from 'lucide-react';
import { useDigitalJoin } from '../../hooks/useJoin';
import { DIGITAL_JOINS } from '../../crestron/joins';
import { safeSessionStorage } from '../../utils/safeStorage';
import Button from '../ui/Button';

const sendPulse = (setFn) => {
  setFn(true);
  setTimeout(() => setFn(false), 100);
};

// 6 real displays for this room: 4x 55" side displays, the 75" back display,
// and the video wall — matches AVMatrixPage.jsx's DISPLAY_TARGETS + combine zone.
const DISPLAY_CONFIGS = [
  { key: 'side-1', label: 'Side Display 1', storageKey: 'sideDisplay1Power', onJoinKey: 'SIDE_DISPLAY_1_ON', offJoinKey: 'SIDE_DISPLAY_1_OFF' },
  { key: 'side-2', label: 'Side Display 2', storageKey: 'sideDisplay2Power', onJoinKey: 'SIDE_DISPLAY_2_ON', offJoinKey: 'SIDE_DISPLAY_2_OFF' },
  { key: 'side-3', label: 'Side Display 3', storageKey: 'sideDisplay3Power', onJoinKey: 'SIDE_DISPLAY_3_ON', offJoinKey: 'SIDE_DISPLAY_3_OFF' },
  { key: 'side-4', label: 'Side Display 4', storageKey: 'sideDisplay4Power', onJoinKey: 'SIDE_DISPLAY_4_ON', offJoinKey: 'SIDE_DISPLAY_4_OFF' },
  { key: 'back', label: 'Back Display', storageKey: 'backDisplayPower', onJoinKey: 'BACK_DISPLAY_ON', offJoinKey: 'BACK_DISPLAY_OFF' },
  { key: 'videowall', label: 'Video Wall', storageKey: 'videoWallPower', onJoinKey: 'VIDEOWALL_ON', offJoinKey: 'VIDEOWALL_OFF' },
];

// Compact hero tile — same glow mechanics as the reference DisplayHeroControl.jsx
// (single .content-hero-breath class + inline color-mix glow), scaled down to fit
// six per card instead of one per screen.
function DisplayPowerTile({ label, storageKey, onJoinKey, offJoinKey }) {
  const [powerState, setPowerState] = useState(
    () => safeSessionStorage.getItem(storageKey) || 'off'
  );

  const [, , sendOn] = useDigitalJoin(DIGITAL_JOINS[onJoinKey]);
  const [, , sendOff] = useDigitalJoin(DIGITAL_JOINS[offJoinKey]);

  const isOn = powerState === 'on';
  const HeroIcon = isOn ? Monitor : MonitorX;

  const iconColor = isOn ? 'var(--color-success)' : 'var(--color-danger-500)';
  const glowBg = isOn
    ? 'color-mix(in srgb, var(--color-success) 14%, transparent)'
    : 'color-mix(in srgb, var(--color-danger-500) 14%, transparent)';
  const glowShadow = isOn
    ? '0 0 20px color-mix(in srgb, var(--color-success) 22%, transparent)'
    : '0 0 20px color-mix(in srgb, var(--color-danger-500) 18%, transparent)';

  const handlePowerOn = () => {
    if (isOn) return;
    setPowerState('on');
    safeSessionStorage.setItem(storageKey, 'on');
    sendPulse(sendOn);
  };

  const handlePowerOff = () => {
    if (!isOn) return;
    setPowerState('off');
    safeSessionStorage.setItem(storageKey, 'off');
    sendPulse(sendOff);
  };

  return (
    <div className="flex flex-col items-center gap-2 touchPanel:gap-2.5 w-full h-full justify-center px-1">
      <div
        key={powerState}
        className="p-4 touchPanel:p-4 rounded-full transition-all duration-500 content-hero-breath"
        style={{ backgroundColor: glowBg, boxShadow: glowShadow }}
      >
        <HeroIcon className="w-8 h-8 touchPanel:w-9 touchPanel:h-9 transition-all duration-500" style={{ color: iconColor }} />
      </div>

      <span className="text-xs touchPanel:text-sm font-semibold text-heading text-center truncate w-full">
        {label}
      </span>

      <div className="flex gap-1.5 touchPanel:gap-2 w-full">
        <Button
          variant={isOn ? 'success' : 'secondary'}
          size="sm"
          onClick={handlePowerOn}
          aria-label={`Turn on ${label}`}
          className="flex-1 flex items-center justify-center py-1.5 px-2 touchPanel:py-2"
        >
          <Play className="w-3.5 h-3.5 touchPanel:w-4 touchPanel:h-4" />
        </Button>
        <Button
          variant={!isOn ? 'danger' : 'secondary'}
          size="sm"
          onClick={handlePowerOff}
          aria-label={`Turn off ${label}`}
          className="flex-1 flex items-center justify-center py-1.5 px-2 touchPanel:py-2"
        >
          <Power className="w-3.5 h-3.5 touchPanel:w-4 touchPanel:h-4" />
        </Button>
      </div>

      <div className="w-full rounded-full h-1 content-status-fill" style={{ backgroundColor: 'var(--color-border)' }}>
        <div
          className="h-full rounded-full content-status-fill"
          style={{
            width: '100%',
            backgroundColor: isOn ? 'var(--color-success)' : 'var(--color-danger-500)',
          }}
        />
      </div>
    </div>
  );
}

const DisplayPowerGrid = () => {
  return (
    <div className="h-full w-full grid grid-cols-3 grid-rows-2 gap-3 touchPanel:gap-4">
      {DISPLAY_CONFIGS.map((display) => (
        <div key={display.key} className="min-h-0 min-w-0">
          <DisplayPowerTile
            label={display.label}
            storageKey={display.storageKey}
            onJoinKey={display.onJoinKey}
            offJoinKey={display.offJoinKey}
          />
        </div>
      ))}
    </div>
  );
};

export default DisplayPowerGrid;
