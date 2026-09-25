import { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useDigitalJoin } from '../../hooks/useJoin';
import { DIGITAL_JOINS } from '../../crestron/joins';
import { safeSessionStorage } from '../../utils/safeStorage';
import Button from '../ui/Button';

const sendPulse = (setFn) => {
  setFn(true);
  setTimeout(() => setFn(false), 100);
};

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

function PresetButton({ index, name }) {
  const [, , send] = useDigitalJoin(DIGITAL_JOINS[`CAM_PRESET_${index + 1}`]);
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => sendPulse(send)}
      className="w-full h-full flex items-center justify-center px-2 py-2"
    >
      <span className="text-xs touchPanel:text-sm font-semibold text-center leading-tight break-words">{name}</span>
    </Button>
  );
}

const CameraControl = () => {
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
      <div className="flex-1 min-h-0 grid grid-cols-3 grid-rows-3 gap-2 touchPanel:gap-3">
        {PRESET_NAMES.map((name, index) => (
          <PresetButton key={name} index={index} name={name} />
        ))}
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
