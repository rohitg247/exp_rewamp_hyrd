import { useState, useCallback, Fragment } from 'react';
import { Sun, Moon, Camera } from 'lucide-react';
import { useDigitalJoin, useAnalogJoinSendOnly } from '../../hooks/useJoin';
import { DIGITAL_JOINS, ANALOG_JOINS } from '../../crestron/joins';
import { safeSessionStorage } from '../../utils/safeStorage';
import Button from '../ui/Button';
import LayoutApplyBar from '../ui/LayoutApplyBar';

const sendPulse = (setFn) => {
  setFn(true);
  setTimeout(() => setFn(false), 100);
};

// Tap = recall. Presets lock while the camera moves.
const RECALL_LOCK_MS = 5000;

const PRESET_NAMES = [
  'Room_View',
  'Front_cameras',
  'Sightline',
  'Sightline_AI',
  'SightlineAI_PIP',
  'SightlineAI_Conv',
  'Training_room',
  'Training Room_Conv',
  'Preset 9',
];

function PresetButton({ name, disabled, onRecall }) {
  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={disabled}
      onClick={onRecall}
      className="w-full h-full flex items-center justify-center px-2 py-2 select-none"
    >
      <span className="text-sm touchPanel:text-base font-semibold text-center leading-tight break-words">
        {name.split('_').map((part, i) => (
          <Fragment key={i}>{i > 0 && <br />}{part}</Fragment>
        ))}
      </span>
    </Button>
  );
}

const CameraControl = () => {
  const sendPreset = useAnalogJoinSendOnly(ANALOG_JOINS.CAM_PRESET);
  const [busy, setBusy] = useState(null); // index of the preset being recalled
  const clearBusy = useCallback(() => setBusy(null), []);

  const recallPreset = (index) => {
    sendPreset(index + 1);
    // Back to 0 so the same preset re-triggers next time (analog only fires on change)
    setTimeout(() => sendPreset(0), 200);
    setBusy(index);
  };

  // Wake / Sleep — mutually exclusive, UI-side only (no processor feedback)
  const [powerMode, setPowerMode] = useState(() => safeSessionStorage.getItem('cameraPowerMode') || 'wake');
  const [, , sendWake] = useDigitalJoin(DIGITAL_JOINS.CAM_WAKE);
  const [, , sendSleep] = useDigitalJoin(DIGITAL_JOINS.CAM_SLEEP);

  const handlePower = (next, sendFn) => {
    if (powerMode === next) return;
    setPowerMode(next);
    safeSessionStorage.setItem('cameraPowerMode', next);
    sendPulse(sendFn);
  };

  return (
    <div className="h-full w-full flex flex-col gap-3 touchPanel:gap-4">
      <div className="flex-1 min-h-0 grid grid-cols-3 grid-rows-3 gap-3 touchPanel:gap-3">
        {PRESET_NAMES.map((name, index) =>
          busy === index ? (
            <LayoutApplyBar
              key={name}
              icon={Camera}
              label={name}
              status="Recalling…"
              duration={RECALL_LOCK_MS}
              onComplete={clearBusy}
            />
          ) : (
            <PresetButton
              key={name}
              name={name}
              disabled={busy !== null}
              onRecall={() => recallPreset(index)}
            />
          )
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 touchPanel:gap-3 flex-shrink-0">
        {[
          { key: 'wake', text: 'Wake', Icon: Sun, sendFn: sendWake },
          { key: 'sleep', text: 'Sleep', Icon: Moon, sendFn: sendSleep },
        ].map(({ key, text, Icon, sendFn }) => (
          <Button
            key={key}
            variant={powerMode === key ? 'primary' : 'secondary'}
            size="md"
            onClick={() => handlePower(key, sendFn)}
            className="flex items-center justify-center gap-2 py-3 touchPanel:py-4"
          >
            <Icon className="w-5 h-5 touchPanel:w-6 touchPanel:h-6" />
            <span className="text-sm touchPanel:text-base font-semibold">{text}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CameraControl;
