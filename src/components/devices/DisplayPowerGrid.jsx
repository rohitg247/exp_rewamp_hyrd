import { useState } from 'react';
import { Monitor, MonitorX, Play, Power } from 'lucide-react';
import { useDigitalJoin } from '../../hooks/useJoin';
import { DIGITAL_JOINS } from '../../crestron/joins';
import { safeSessionStorage } from '../../utils/safeStorage';
import Button from '../ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';

const sendPulse = (setFn) => {
  setFn(true);
  setTimeout(() => setFn(false), 100);
};

// 6 real displays for this room
export const DISPLAY_CONFIGS = [
  { key: 'side-1', label: 'Side Display 1', storageKey: 'sideDisplay1Power', onJoinKey: 'SIDE_DISPLAY_1_ON', offJoinKey: 'SIDE_DISPLAY_1_OFF', hdmi1JoinKey: 'SIDE_DISPLAY_1_HDMI1', hdmi2JoinKey: 'SIDE_DISPLAY_1_HDMI2' },
  { key: 'side-2', label: 'Side Display 2', storageKey: 'sideDisplay2Power', onJoinKey: 'SIDE_DISPLAY_2_ON', offJoinKey: 'SIDE_DISPLAY_2_OFF', hdmi1JoinKey: 'SIDE_DISPLAY_2_HDMI1', hdmi2JoinKey: 'SIDE_DISPLAY_2_HDMI2' },
  { key: 'side-3', label: 'Side Display 3', storageKey: 'sideDisplay3Power', onJoinKey: 'SIDE_DISPLAY_3_ON', offJoinKey: 'SIDE_DISPLAY_3_OFF', hdmi1JoinKey: 'SIDE_DISPLAY_3_HDMI1', hdmi2JoinKey: 'SIDE_DISPLAY_3_HDMI2' },
  { key: 'side-4', label: 'Side Display 4', storageKey: 'sideDisplay4Power', onJoinKey: 'SIDE_DISPLAY_4_ON', offJoinKey: 'SIDE_DISPLAY_4_OFF', hdmi1JoinKey: 'SIDE_DISPLAY_4_HDMI1', hdmi2JoinKey: 'SIDE_DISPLAY_4_HDMI2' },
  { key: 'back', label: 'Back Display', storageKey: 'backDisplayPower', onJoinKey: 'BACK_DISPLAY_ON', offJoinKey: 'BACK_DISPLAY_OFF', hdmi1JoinKey: 'BACK_DISPLAY_HDMI1', hdmi2JoinKey: 'BACK_DISPLAY_HDMI2' },
  { key: 'videowall', label: 'Video Wall', storageKey: 'videoWallPower', onJoinKey: 'VIDEOWALL_ON', offJoinKey: 'VIDEOWALL_OFF', hdmi1JoinKey: 'VIDEOWALL_HDMI1', hdmi2JoinKey: 'VIDEOWALL_HDMI2' },
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

function DisplayPowerTile({ label, storageKey, onJoinKey, offJoinKey, hdmi1JoinKey, hdmi2JoinKey }) {
  const [powerState, setPowerState] = useState(
    () => safeSessionStorage.getItem(storageKey) || 'off'
  );

  const [, , sendOn] = useDigitalJoin(DIGITAL_JOINS[onJoinKey]);
  const [, , sendOff] = useDigitalJoin(DIGITAL_JOINS[offJoinKey]);

  // HDMI input — mutually exclusive, UI-side only (no processor feedback)
  const [input, setInput] = useState(() => safeSessionStorage.getItem(`${storageKey}Input`));
  const [, , sendHdmi1] = useDigitalJoin(DIGITAL_JOINS[hdmi1JoinKey]);
  const [, , sendHdmi2] = useDigitalJoin(DIGITAL_JOINS[hdmi2JoinKey]);

  const handleInput = (next, sendFn) => {
    if (input === next) return;
    setInput(next);
    safeSessionStorage.setItem(`${storageKey}Input`, next);
    sendPulse(sendFn);
  };

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

  // One card per display — same structure as the Audio Controls channel cards
  return (
    <Card variant="gradient" tone="video" className="flex flex-col min-h-0 min-w-0">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center justify-center gap-2 text-md text-heading text-center">
          {label}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3 touchPanel:gap-4">
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

        {/* ON / OFF side by side — keeps the tile short enough for the 3x2 grid */}
        <div className="grid grid-cols-2 gap-3 touchPanel:gap-4 w-full flex-shrink-0">
          <Button
            variant={isOn ? 'success' : 'secondary'}
            size="sm"
            onClick={handlePowerOn}
            aria-label={`Turn on ${label}`}
            className="w-full flex items-center justify-center gap-2 py-2 px-2 touchPanel:py-3"
          >
            <Play className="w-4 h-4 touchPanel:w-5 touchPanel:h-5 flex-shrink-0" />
            <span className="text-sm touchPanel:text-base">ON</span>
          </Button>

          <Button
            variant={!isOn ? 'danger' : 'secondary'}
            size="sm"
            onClick={handlePowerOff}
            aria-label={`Turn off ${label}`}
            className="w-full flex items-center justify-center gap-2 py-2 px-2 touchPanel:py-3"
          >
            <Power className="w-4 h-4 touchPanel:w-5 touchPanel:h-5 flex-shrink-0" />
            <span className="text-sm touchPanel:text-base">OFF</span>
          </Button>
        </div>

        {/* HDMI input select — mutually exclusive */}
        <div className="grid grid-cols-2 gap-3 touchPanel:gap-4 w-full flex-shrink-0">
          {[
            { key: 'hdmi1', text: 'HDMI 1', sendFn: sendHdmi1 },
            { key: 'hdmi2', text: 'HDMI 2', sendFn: sendHdmi2 },
          ].map((option) => (
            <Button
              key={option.key}
              variant={input === option.key ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleInput(option.key, option.sendFn)}
              aria-label={`${label} ${option.text}`}
              className="w-full flex items-center justify-center py-2 px-1 touchPanel:py-3"
            >
              <span className="text-sm touchPanel:text-base whitespace-nowrap">{option.text}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

const DisplayPowerGrid = () => {
  return (
    <div className="h-full w-full grid grid-cols-3 grid-rows-2 gap-6 touchPanel:gap-8">
      {DISPLAY_CONFIGS.map((display) => (
        <DisplayPowerTile
          key={display.key}
          label={display.label}
          storageKey={display.storageKey}
          onJoinKey={display.onJoinKey}
          offJoinKey={display.offJoinKey}
          hdmi1JoinKey={display.hdmi1JoinKey}
          hdmi2JoinKey={display.hdmi2JoinKey}
        />
      ))}
    </div>
  );
};

export default DisplayPowerGrid;