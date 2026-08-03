import { useState, useEffect } from 'react';
import { Monitor, Play, Power } from 'lucide-react';
import { useDigitalJoin } from '../../hooks/useJoin';
import { DIGITAL_JOINS } from '../../crestron/joins';
import { safeSessionStorage } from '../../utils/safeStorage';
import Button from '../ui/Button';


const DisplayPowerControl = () => {
  // Display 1 - LED Wall
  const [display1Power, setDisplay1Power] = useState(() => 
    safeSessionStorage.getItem('display1Power') || 'on'
  );

  // Display 2 - Repeater
  const [display2Power, setDisplay2Power] = useState(() => 
    safeSessionStorage.getItem('display2Power') || 'on'
  );

  // Display 3 - Boardroom Display
  const [display3Power, setDisplay3Power] = useState(() => 
    safeSessionStorage.getItem('display3Power') || 'on'
  );

  // Persist states
  useEffect(() => {
    if (display1Power) safeSessionStorage.setItem('display1Power', display1Power);
    else safeSessionStorage.removeItem('display1Power');
  }, [display1Power]);

  useEffect(() => {
    if (display2Power) safeSessionStorage.setItem('display2Power', display2Power);
    else safeSessionStorage.removeItem('display2Power');
  }, [display2Power]);

  useEffect(() => {
    if (display3Power) safeSessionStorage.setItem('display3Power', display3Power);
    else safeSessionStorage.removeItem('display3Power');
  }, [display3Power]);

  // Digital joins
  const [, , sendDisplay1On] = useDigitalJoin(DIGITAL_JOINS.DISPLAY1_ON);
  const [, , sendDisplay1Off] = useDigitalJoin(DIGITAL_JOINS.DISPLAY1_OFF);
  const [, , sendDisplay2On] = useDigitalJoin(DIGITAL_JOINS.DISPLAY2_ON);
  const [, , sendDisplay2Off] = useDigitalJoin(DIGITAL_JOINS.DISPLAY2_OFF);
  const [, , sendDisplay3On] = useDigitalJoin(DIGITAL_JOINS.DISPLAY3_ON);
  const [, , sendDisplay3Off] = useDigitalJoin(DIGITAL_JOINS.DISPLAY3_OFF);

  const sendPulse = (setFunc, displayNum, action) => {
    console.log(`📤 Display ${displayNum}: ${action}`);
    setFunc(true);
    setTimeout(() => {
      setFunc(false);
      console.log(`✅ Display ${displayNum}: ${action} pulse completed`);
    }, 100);
  };

  return (
    <div className="flex flex-col w-full h-full gap-0 -mt-3">

      {/* Display 3 - Boardroom Display */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2 touchPanel:gap-3 w-full px-1">
        <div className="p-4 touchPanel:p-3 bg-blue-100 rounded-full flex-shrink-0">
          <Monitor className="w-7 h-7 touchPanel:w-7 touchPanel:h-7 text-primary" />
        </div>
        <h3 className="text-sm touchPanel:text-base font-semibold text-heading flex-shrink-0">
          Boardroom Display
        </h3>
        <div className="grid grid-cols-2 gap-2 touchPanel:gap-3 w-full" style={{ height: '32%' }}>
          <Button
            variant={display3Power === 'on' ? 'success' : 'secondary'}
            size="sm"
            onClick={() => { if (display3Power === 'on') return; setDisplay3Power('on'); sendPulse(sendDisplay3On, 3, 'Power ON'); }}
            className="flex items-center justify-center gap-2 h-full w-full py-0"
          >
            <Play className="w-4 h-4 touchPanel:w-5 touchPanel:h-5 flex-shrink-0" />
            <span className="text-xs touchPanel:text-sm">On</span>
          </Button>
          <Button
            variant={display3Power === 'off' ? 'danger' : 'secondary'}
            size="sm"
            onClick={() => { if (display3Power === 'off') return; setDisplay3Power('off'); sendPulse(sendDisplay3Off, 3, 'Power OFF'); }}
            className="flex items-center justify-center gap-2 h-full w-full py-0"
          >
            <Power className="w-4 h-4 touchPanel:w-5 touchPanel:h-5 flex-shrink-0" />
            <span className="text-xs touchPanel:text-sm">Off</span>
          </Button>
        </div>
      </div>

      <div className=" border-t-2 my-2 border-gray-200 w-full flex-shrink-0" />

      {/* Display 1 - Training Display */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2 touchPanel:gap-3 w-full px-1">
        <div className="p-4 touchPanel:p-3 bg-blue-100 rounded-full flex-shrink-0">
          <Monitor className="w-7 h-7 touchPanel:w-7 touchPanel:h-7 text-primary" />
        </div>
        <h3 className="text-sm touchPanel:text-base font-semibold text-heading flex-shrink-0">
          Training Room Display
        </h3>
        <div className="grid grid-cols-2 gap-2 touchPanel:gap-3 w-full" style={{ height: '32%' }}>
          <Button
            variant={display1Power === 'on' ? 'success' : 'secondary'}
            size="sm"
            onClick={() => { if (display1Power === 'on') return; setDisplay1Power('on'); sendPulse(sendDisplay1On, 1, 'Power ON'); }}
            className="flex items-center justify-center gap-2 h-full w-full py-0"
          >
            <Play className="w-4 h-4 touchPanel:w-5 touchPanel:h-5 flex-shrink-0" />
            <span className="text-xs touchPanel:text-sm">On</span>
          </Button>
          <Button
            variant={display1Power === 'off' ? 'danger' : 'secondary'}
            size="sm"
            onClick={() => { if (display1Power === 'off') return; setDisplay1Power('off'); sendPulse(sendDisplay1Off, 1, 'Power OFF'); }}
            className="flex items-center justify-center gap-2 h-full w-full py-0"
          >
            <Power className="w-4 h-4 touchPanel:w-5 touchPanel:h-5 flex-shrink-0" />
            <span className="text-xs touchPanel:text-sm">Off</span>
          </Button>
        </div>
      </div>

      <div className="border-t-2  my-2 border-gray-200 w-full flex-shrink-0" />

      {/* Display 2 - Repeater */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2 touchPanel:gap-3 w-full px-1">
        <div className="p-4 touchPanel:p-3 bg-blue-100 rounded-full flex-shrink-0">
          <Monitor className="w-7 h-7 touchPanel:w-7 touchPanel:h-7 text-primary" />
        </div>
        <h3 className="text-sm touchPanel:text-base font-semibold text-heading flex-shrink-0">
          Repeater Display
        </h3>
        <div className="grid grid-cols-2 gap-2 touchPanel:gap-3 w-full" style={{ height: '32%' }}>
          <Button
            variant={display2Power === 'on' ? 'success' : 'secondary'}
            size="sm"
            onClick={() => { if (display2Power === 'on') return; setDisplay2Power('on'); sendPulse(sendDisplay2On, 2, 'Power ON'); }}
            className="flex items-center justify-center gap-2 h-full w-full py-0"
          >
            <Play className="w-4 h-4 touchPanel:w-5 touchPanel:h-5 flex-shrink-0" />
            <span className="text-xs touchPanel:text-sm">On</span>
          </Button>
          <Button
            variant={display2Power === 'off' ? 'danger' : 'secondary'}
            size="sm"
            onClick={() => { if (display2Power === 'off') return; setDisplay2Power('off'); sendPulse(sendDisplay2Off, 2, 'Power OFF'); }}
            className="flex items-center justify-center gap-2 h-full w-full py-0"
          >
            <Power className="w-4 h-4 touchPanel:w-5 touchPanel:h-5 flex-shrink-0" />
            <span className="text-xs touchPanel:text-sm">Off</span>
          </Button>
        </div>
      </div>

    </div>
  );
};


export default DisplayPowerControl;