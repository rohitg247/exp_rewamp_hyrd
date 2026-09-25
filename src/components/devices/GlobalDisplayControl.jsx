import { useState } from 'react';
import { Play, Power } from 'lucide-react';
import { useDigitalJoin } from '../../hooks/useJoin';
import { DIGITAL_JOINS } from '../../crestron/joins';
import { safeSessionStorage } from '../../utils/safeStorage';
import Button from '../ui/Button';
import { DISPLAY_CONFIGS } from './DisplayPowerGrid';

const sendPulse = (setFn) => {
  setFn(true);
  setTimeout(() => setFn(false), 100);
};

// 'on' / 'off' when every display agrees, otherwise null (mixed)
const readAllState = () => {
  const states = DISPLAY_CONFIGS.map(({ storageKey }) => safeSessionStorage.getItem(storageKey) || 'off');
  return states.every((s) => s === states[0]) ? states[0] : null;
};

// One ON / OFF pair for every display. The backend fans the global join out;
// the per-display session keys are updated so Room Controls shows the same status.
const GlobalDisplayControl = () => {
  const [allState, setAllState] = useState(readAllState);
  const [, , sendAllOn] = useDigitalJoin(DIGITAL_JOINS.GLOBAL_DISPLAY_ON);
  const [, , sendAllOff] = useDigitalJoin(DIGITAL_JOINS.GLOBAL_DISPLAY_OFF);

  const setAll = (next, sendFn) => {
    DISPLAY_CONFIGS.forEach(({ storageKey }) => safeSessionStorage.setItem(storageKey, next));
    setAllState(next);
    sendPulse(sendFn);
  };

  return (
    <div className="grid grid-rows-2 gap-3 md:gap-4 touchPanel:gap-5 h-full w-full">
      <Button
        variant={allState === 'on' ? 'success' : 'secondary'}
        size="md"
        onClick={() => setAll('on', sendAllOn)}
        className="flex items-center justify-center gap-3 h-full min-h-[64px] touchPanel:min-h-[80px]"
      >
        <Play className="w-5 h-5 md:w-6 md:h-6 touchPanel:w-7 touchPanel:h-7" />
        <span className="text-sm md:text-base touchPanel:text-lg font-semibold">All ON</span>
      </Button>
      <Button
        variant={allState === 'off' ? 'danger' : 'secondary'}
        size="md"
        onClick={() => setAll('off', sendAllOff)}
        className="flex items-center justify-center gap-3 h-full min-h-[64px] touchPanel:min-h-[80px]"
      >
        <Power className="w-5 h-5 md:w-6 md:h-6 touchPanel:w-7 touchPanel:h-7" />
        <span className="text-sm md:text-base touchPanel:text-lg font-semibold">All OFF</span>
      </Button>
    </div>
  );
};

export default GlobalDisplayControl;
