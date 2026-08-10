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

// 6 real displays for this room
const DISPLAY_CONFIGS = [
  { key: 'side-1', label: 'Side Display 1', storageKey: 'sideDisplay1Power', onJoinKey: 'SIDE_DISPLAY_1_ON', offJoinKey: 'SIDE_DISPLAY_1_OFF' },
  { key: 'side-2', label: 'Side Display 2', storageKey: 'sideDisplay2Power', onJoinKey: 'SIDE_DISPLAY_2_ON', offJoinKey: 'SIDE_DISPLAY_2_OFF' },
  { key: 'side-3', label: 'Side Display 3', storageKey: 'sideDisplay3Power', onJoinKey: 'SIDE_DISPLAY_3_ON', offJoinKey: 'SIDE_DISPLAY_3_OFF' },
  { key: 'side-4', label: 'Side Display 4', storageKey: 'sideDisplay4Power', onJoinKey: 'SIDE_DISPLAY_4_ON', offJoinKey: 'SIDE_DISPLAY_4_OFF' },
  { key: 'back', label: 'Back Display', storageKey: 'backDisplayPower', onJoinKey: 'BACK_DISPLAY_ON', offJoinKey: 'BACK_DISPLAY_OFF' },
  { key: 'videowall', label: 'Video Wall', storageKey: 'videoWallPower', onJoinKey: 'VIDEOWALL_ON', offJoinKey: 'VIDEOWALL_OFF' },
];

const STATE_UI = {
  on: {
    iconColor: 'var(--color-success)',
    glowBg: 'rgba(16, 185, 129, 0.14)',
    glowShadow: '0 0 20px rgba(16, 185, 129, 0.24)',
    pillBg: 'var(--color-success)',
    pillWidth: '72%',
    pillScale: 'scaleY(1)',
    pillShadow: '0 0 10px rgba(16, 185, 129, 0.28)',
  },
  off: {
    iconColor: 'var(--color-danger-500)',
    glowBg: 'rgba(242, 18, 18, 0.12)',
    glowShadow: '0 0 18px rgba(242, 18, 18, 0.18)',
    pillBg: 'var(--color-danger-500)',
    pillWidth: '38%',
    pillScale: 'scaleY(0.78)',
    pillShadow: '0 0 8px rgba(242, 18, 18, 0.18)',
  },
};

function DisplayPowerTile({ label, storageKey, onJoinKey, offJoinKey }) {
  const [powerState, setPowerState] = useState(
    () => safeSessionStorage.getItem(storageKey) || 'off'
  );

  const [, , sendOn] = useDigitalJoin(DIGITAL_JOINS[onJoinKey]);
  const [, , sendOff] = useDigitalJoin(DIGITAL_JOINS[offJoinKey]);

  const isOn = powerState === 'on';
  const HeroIcon = isOn ? Monitor : MonitorX;
  const ui = isOn ? STATE_UI.on : STATE_UI.off;

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

  const tileStyle = {
    backgroundColor: 'var(--color-bg-secondary)',
    backgroundImage: 'var(--gloss-specular), var(--surface-glass)',
    boxShadow: 'var(--surface-hairline), var(--surface-edge), var(--elev-rest)',
    borderRadius: '0.875rem',
  };

  return (
    <div
      className="flex flex-col items-center justify-center gap-2 touchPanel:gap-2.5 w-full h-full px-2 py-3 touchPanel:px-3 touchPanel:py-4"
      style={tileStyle}
    >
      {/* Hero icon with preserved floating motion */}
      <div
        className="p-3.5 touchPanel:p-4 rounded-full transition-all duration-500 content-hero-breath flex-shrink-0"
        style={{
          backgroundColor: ui.glowBg,
          boxShadow: ui.glowShadow,
        }}
      >
        <HeroIcon
          className="w-8 h-8 touchPanel:w-9 touchPanel:h-9 transition-all duration-500"
          style={{ color: ui.iconColor }}
        />
      </div>

      {/* Label */}
      <div className="w-full min-h-[2.25rem] touchPanel:min-h-[2.5rem] flex items-center justify-center px-1">
        <span className="text-xs touchPanel:text-sm font-semibold text-heading text-center leading-tight">
          {label}
        </span>
      </div>

      {/* Full-colour status pill: only size changes */}
      <div className="w-full h-2 touchPanel:h-2.5 flex items-center justify-center flex-shrink-0">
        <div
          className="rounded-full content-status-fill"
          style={{
            width: ui.pillWidth,
            height: '100%',
            backgroundColor: ui.pillBg,
            boxShadow: ui.pillShadow,
            transform: ui.pillScale,
            transformOrigin: 'center center',
            opacity: 1,
            transition:
              'width 420ms ease, transform 420ms ease, background-color 320ms ease, box-shadow 320ms ease',
          }}
        />
      </div>

      {/* Vertically stacked buttons using your Button component */}
      <div className="flex flex-col gap-1.5 touchPanel:gap-2 w-full flex-shrink-0">
        <Button
          variant={isOn ? 'success' : 'secondary'}
          size="sm"
          onClick={handlePowerOn}
          aria-label={`Turn on ${label}`}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-2 touchPanel:py-2"
        >
          <Play className="w-3.5 h-3.5 touchPanel:w-4 touchPanel:h-4 flex-shrink-0" />
          <span className="text-xs touchPanel:text-sm">ON</span>
        </Button>

        <Button
          variant={!isOn ? 'danger' : 'secondary'}
          size="sm"
          onClick={handlePowerOff}
          aria-label={`Turn off ${label}`}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-2 touchPanel:py-2"
        >
          <Power className="w-3.5 h-3.5 touchPanel:w-4 touchPanel:h-4 flex-shrink-0" />
          <span className="text-xs touchPanel:text-sm">OFF</span>
        </Button>
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