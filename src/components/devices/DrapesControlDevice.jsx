import { ChevronUp, ChevronDown, Square } from 'lucide-react';
import { useDigitalJoin } from '../../hooks/useJoin';
import { DIGITAL_JOINS } from '../../crestron/joins';
import Button from '../ui/Button';

const DrapesControlDevice = () => {
  // Digital controls - All Shades
  const [, , triggerAllUp] = useDigitalJoin(DIGITAL_JOINS.DRAPES_UP);
  const [, , triggerAllStop] = useDigitalJoin(DIGITAL_JOINS.DRAPES_STOP);
  const [, , triggerAllDown] = useDigitalJoin(DIGITAL_JOINS.DRAPES_DOWN);

  // Digital controls - Individual sections
  const [, , triggerLeftUp] = useDigitalJoin(DIGITAL_JOINS.DRAPES_LEFT_UP);
  const [, , triggerLeftStop] = useDigitalJoin(DIGITAL_JOINS.DRAPES_LEFT_STOP);
  const [, , triggerLeftDown] = useDigitalJoin(DIGITAL_JOINS.DRAPES_LEFT_DOWN);

  const [, , triggerCenterUp] = useDigitalJoin(DIGITAL_JOINS.DRAPES_CENTER_UP);
  const [, , triggerCenterStop] = useDigitalJoin(DIGITAL_JOINS.DRAPES_CENTER_STOP);
  const [, , triggerCenterDown] = useDigitalJoin(DIGITAL_JOINS.DRAPES_CENTER_DOWN);

  const [, , triggerRightUp] = useDigitalJoin(DIGITAL_JOINS.DRAPES_RIGHT_UP);
  const [, , triggerRightStop] = useDigitalJoin(DIGITAL_JOINS.DRAPES_RIGHT_STOP);
  const [, , triggerRightDown] = useDigitalJoin(DIGITAL_JOINS.DRAPES_RIGHT_DOWN);

  // Pulse sending function
  const sendPulse = (setFunc, actionName) => {
    console.log(`📤 Drapes: ${actionName}`);
    setFunc(true);
    setTimeout(() => {
      setFunc(false);
      console.log(`✅ Drapes: ${actionName} pulse completed`);
    }, 100);
  };

  const drapesSections = [
    {
      name: 'All Shades',
      key: 'all',
      controls: { 
        up: () => sendPulse(triggerAllUp, 'All Shades Up'),
        stop: () => sendPulse(triggerAllStop, 'All Shades Stop'),
        down: () => sendPulse(triggerAllDown, 'All Shades Down')
      }
    },
    {
      name: 'Left',
      key: 'left',
      controls: { 
        up: () => sendPulse(triggerLeftUp, 'Left Up'),
        stop: () => sendPulse(triggerLeftStop, 'Left Stop'),
        down: () => sendPulse(triggerLeftDown, 'Left Down')
      }
    },
    {
      name: 'Center',
      key: 'center',
      controls: { 
        up: () => sendPulse(triggerCenterUp, 'Center Up'),
        stop: () => sendPulse(triggerCenterStop, 'Center Stop'),
        down: () => sendPulse(triggerCenterDown, 'Center Down')
      }
    },
    {
      name: 'Right',
      key: 'right',
      controls: { 
        up: () => sendPulse(triggerRightUp, 'Right Up'),
        stop: () => sendPulse(triggerRightStop, 'Right Stop'),
        down: () => sendPulse(triggerRightDown, 'Right Down')
      }
    }
  ];

  return (
    <div className="h-full w-full flex flex-col gap-2 md:gap-2 touchPanel:gap-6">
      {drapesSections.map((section) => (
        <div key={section.key} className="flex-1 flex flex-col gap-1 touchPanel:gap-1.5 min-h-0">
          {/* Section Name */}
          <div className="text-center flex-shrink-0">
            <h4 className="text-xs md:text-sm touchPanel:text-xl font-semibold text-heading leading-tight touchPanel:pb-4">
              {section.name}
            </h4>
          </div>

          {/* Control Buttons - 3 columns with dynamic height */}
          <div className="flex-1 grid grid-cols-3 gap-1.5 md:gap-2 touchPanel:gap-2 w-full">
            <Button
              variant="secondary"
              size="sm"
              onClick={section.controls.up}
              className="flex flex-col items-center justify-center space-y-0.5 touchPanel:space-y-1 h-full"
            >
              <ChevronUp className="w-4 h-4 md:w-5 md:h-5 touchPanel:w-8 touchPanel:h-8" />
              <span className="text-xs md:text-xs touchPanel:text-lg leading-tight">Up</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={section.controls.stop}
              className="flex flex-col items-center justify-center space-y-0.5 touchPanel:space-y-1 h-full"
            >
              <Square className="w-4 h-4 md:w-5 md:h-5 touchPanel:w-7 touchPanel:h-7" />
              <span className="text-xs md:text-xs touchPanel:text-lg leading-tight">Stop</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={section.controls.down}
              className="flex flex-col items-center justify-center space-y-0.5 touchPanel:space-y-1 h-full"
            >
              <ChevronDown className="w-4 h-4 md:w-5 md:h-5 touchPanel:w-8 touchPanel:h-8" />
              <span className="text-xs md:text-xs touchPanel:text-lg leading-tight">Down</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DrapesControlDevice;
