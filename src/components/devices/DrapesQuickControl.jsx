import { ChevronUp, ChevronDown, Square } from 'lucide-react';
import { useDigitalJoin } from '../../hooks/useJoin';
import { DIGITAL_JOINS } from '../../crestron/joins';
import Button from '../ui/Button';


const DrapesQuickControl = () => {
  const [, , triggerUp] = useDigitalJoin(DIGITAL_JOINS.DRAPES_UP);
  const [, , triggerStop] = useDigitalJoin(DIGITAL_JOINS.DRAPES_STOP);
  const [, , triggerDown] = useDigitalJoin(DIGITAL_JOINS.DRAPES_DOWN);

  const sendPulse = (setFunc, actionName) => {
    console.log(`📤 Drapes: ${actionName}`);
    setFunc(true);
    setTimeout(() => {
      setFunc(false);
      console.log(`✅ Drapes: ${actionName} pulse completed`);
    }, 100);
  };

  return (
    <div className="h-full w-full flex flex-col gap-2 md:gap-2 touchPanel:gap-5">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => sendPulse(triggerUp, 'All Drapes Up')}
        className="flex-1 flex items-center justify-center space-x-2 touchPanel:space-x-3"
      >
        <ChevronUp className="w-4 h-4 md:w-5 md:h-5 touchPanel:w-10 touchPanel:h-10" />
        <span className="text-xs md:text-sm touchPanel:text-lg font-medium">Up</span>
      </Button>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => sendPulse(triggerStop, 'All Drapes Stop')}
        className="flex-1 flex items-center justify-center space-x-2 touchPanel:space-x-3"
      >
        <Square className="w-4 h-4 md:w-5 md:h-5 touchPanel:w-9 touchPanel:h-9" />
        <span className="text-xs md:text-sm touchPanel:text-lg font-medium">Stop</span>
      </Button>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => sendPulse(triggerDown, 'All Drapes Down')}
        className="flex-1 flex items-center justify-center space-x-2 touchPanel:space-x-3"
      >
        <ChevronDown className="w-4 h-4 md:w-5 md:h-5 touchPanel:w-10 touchPanel:h-10" />
        <span className="text-xs md:text-sm touchPanel:text-lg font-medium">Down</span>
      </Button>
    </div>
  );
};


export default DrapesQuickControl;