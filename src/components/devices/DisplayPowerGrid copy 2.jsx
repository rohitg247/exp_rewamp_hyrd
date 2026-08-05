// src/components/devices/DisplayPowerGrid.jsx
// Enhanced display power tiles — vertically stacked buttons, larger icons,
// individual glass tile surfaces. Join logic untouched.

import { useState } from 'react';
import { Monitor, MonitorX, Power, Play } from 'lucide-react';
import { useDigitalJoin } from '../../hooks/useJoin';
import { DIGITAL_JOINS } from '../../crestron/joins';
import { safeSessionStorage } from '../../utils/safeStorage';

const sendPulse = (setFn) => {
  setFn(true);
  setTimeout(() => setFn(false), 100);
};

const DISPLAY_CONFIGS = [
  { key: 'side-1', label: 'Side Display 1', storageKey: 'sideDisplay1Power', onJoinKey: 'SIDE_DISPLAY_1_ON', offJoinKey: 'SIDE_DISPLAY_1_OFF' },
  { key: 'side-2', label: 'Side Display 2', storageKey: 'sideDisplay2Power', onJoinKey: 'SIDE_DISPLAY_2_ON', offJoinKey: 'SIDE_DISPLAY_2_OFF' },
  { key: 'side-3', label: 'Side Display 3', storageKey: 'sideDisplay3Power', onJoinKey: 'SIDE_DISPLAY_3_ON', offJoinKey: 'SIDE_DISPLAY_3_OFF' },
  { key: 'side-4', label: 'Side Display 4', storageKey: 'sideDisplay4Power', onJoinKey: 'SIDE_DISPLAY_4_ON', offJoinKey: 'SIDE_DISPLAY_4_OFF' },
  { key: 'back', label: 'Back Display', storageKey: 'backDisplayPower', onJoinKey: 'BACK_DISPLAY_ON', offJoinKey: 'BACK_DISPLAY_OFF' },
  { key: 'videowall', label: 'Video Wall', storageKey: 'videoWallPower', onJoinKey: 'VIDEOWALL_ON', offJoinKey: 'VIDEOWALL_OFF' },
];

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
    ? 'color-mix(in srgb, var(--color-success) 16%, transparent)'
    : 'color-mix(in srgb, var(--color-danger-500) 16%, transparent)';

  const glowShadow = isOn
    ? '0 0 28px color-mix(in srgb, var(--color-success) 30%, transparent), 0 0 8px color-mix(in srgb, var(--color-success) 20%, transparent)'
    : '0 0 28px color-mix(in srgb, var(--color-danger-500) 26%, transparent), 0 0 8px color-mix(in srgb, var(--color-danger-500) 18%, transparent)';

  const statusBarShadow = isOn
    ? '0 0 8px color-mix(in srgb, var(--color-success) 50%, transparent)'
    : '0 0 8px color-mix(in srgb, var(--color-danger-500) 40%, transparent)';

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

  // Tile card surface — individual glass elevation per tile
  const tileStyle = {
    backgroundColor: 'var(--color-bg-secondary)',
    backgroundImage: 'var(--surface-glass)',
    boxShadow: 'var(--surface-hairline), var(--surface-edge), var(--elev-rest)',
    borderRadius: '0.875rem',
    // Subtle colored top rail matching state
    borderTop: `2px solid ${isOn ? 'var(--color-success)' : 'var(--color-danger-500)'}`,
    transition: 'border-top-color 320ms ease',
  };

  return (
    <div
      className="flex flex-col items-center gap-3 w-full h-full justify-center px-3 py-4 touchPanel:px-4 touchPanel:py-5"
      style={tileStyle}
    >
      {/* Hero icon with glow ring */}
      <div
        key={powerState}
        className="p-4 touchPanel:p-5 rounded-full transition-all duration-500 content-hero-breath flex-shrink-0"
        style={{ backgroundColor: glowBg, boxShadow: glowShadow }}
      >
        <HeroIcon
          className="w-10 h-10 touchPanel:w-12 touchPanel:h-12 transition-all duration-500"
          style={{ color: iconColor }}
        />
      </div>

      {/* Label — two-line clamp instead of truncate */}
      <span
        className="text-sm touchPanel:text-base font-semibold text-heading text-center leading-tight w-full flex-shrink-0"
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {label}
      </span>

      {/* Buttons — stacked vertically, full width, proper touch targets */}
      <div className="flex flex-col gap-2 w-full flex-shrink-0">
        <button
          onClick={handlePowerOn}
          disabled={isOn}
          aria-label={`Turn on ${label}`}
          className="press-fx w-full flex items-center justify-center gap-2 py-2.5 touchPanel:py-3 rounded-lg font-semibold text-sm touchPanel:text-base transition-all duration-200"
          style={{
            backgroundColor: isOn
              ? 'color-mix(in srgb, var(--color-success) 22%, var(--color-bg-secondary))'
              : 'var(--color-success)',
            color: isOn ? 'var(--color-success)' : '#ffffff',
            boxShadow: isOn
              ? 'inset 0 0 0 1.5px var(--color-success)'
              : 'var(--elev-rest)',
            opacity: isOn ? 0.7 : 1,
            cursor: isOn ? 'default' : 'pointer',
          }}
        >
          <Play className="w-4 h-4 touchPanel:w-5 touchPanel:h-5 flex-shrink-0" />
          <span>ON</span>
        </button>

        <button
          onClick={handlePowerOff}
          disabled={!isOn}
          aria-label={`Turn off ${label}`}
          className="press-fx w-full flex items-center justify-center gap-2 py-2.5 touchPanel:py-3 rounded-lg font-semibold text-sm touchPanel:text-base transition-all duration-200"
          style={{
            backgroundColor: !isOn
              ? 'color-mix(in srgb, var(--color-danger-500) 22%, var(--color-bg-secondary))'
              : 'var(--color-danger-500)',
            color: !isOn ? 'var(--color-danger-500)' : '#ffffff',
            boxShadow: !isOn
              ? 'inset 0 0 0 1.5px var(--color-danger-500)'
              : 'var(--elev-rest)',
            opacity: !isOn ? 0.7 : 1,
            cursor: !isOn ? 'default' : 'pointer',
          }}
        >
          <Power className="w-4 h-4 touchPanel:w-5 touchPanel:h-5 flex-shrink-0" />
          <span>OFF</span>
        </button>
      </div>

      {/* Status bar — thicker with glow */}
      <div
        className="w-full rounded-full h-2 flex-shrink-0"
        style={{ backgroundColor: 'var(--color-border)' }}
      >
        <div
          className="h-full rounded-full content-status-fill"
          style={{
            width: '100%',
            backgroundColor: isOn ? 'var(--color-success)' : 'var(--color-danger-500)',
            boxShadow: statusBarShadow,
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