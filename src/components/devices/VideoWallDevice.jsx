import { useState, useEffect } from 'react';
import { Maximize2, Grid2X2 } from 'lucide-react';
import { useDigitalJoin } from '../../hooks/useJoin';
import { safeSessionStorage } from '../../utils/safeStorage';
import Button from '../ui/Button';

const VideoWallDevice = ({ 
  powerOnJoin,
  powerOffJoin,
  layoutFullJoin,
  layoutIndividualJoin
}) => {
  // Power state
  const [powerState, setPowerState] = useState(() => 
    safeSessionStorage.getItem('videoWallPower') || null
  );

  // Layout state (full or individual)
  const [layoutState, setLayoutState] = useState(() => 
    safeSessionStorage.getItem('videoWallLayout') || null
  );

  // Persist states
  useEffect(() => {
    if (powerState) safeSessionStorage.setItem('videoWallPower', powerState);
    else safeSessionStorage.removeItem('videoWallPower');
  }, [powerState]);

  useEffect(() => {
    if (layoutState) safeSessionStorage.setItem('videoWallLayout', layoutState);
    else safeSessionStorage.removeItem('videoWallLayout');
  }, [layoutState]);

  // Digital joins
  const [, , sendPowerOn] = useDigitalJoin(powerOnJoin);
  const [, , sendPowerOff] = useDigitalJoin(powerOffJoin);
  const [, , sendLayoutFull] = useDigitalJoin(layoutFullJoin);
  const [, , sendLayoutIndividual] = useDigitalJoin(layoutIndividualJoin);

  // Send pulse helper
  const sendPulse = (setFunc, joinNumber, actionName) => {
    console.log(`📤 Video Wall: ${actionName} (Join: ${joinNumber})`);
    setFunc(true);
    setTimeout(() => {
      setFunc(false);
      console.log(`✅ Video Wall: Pulse completed`);
    }, 100);
  };

  // Power handlers
  const handlePowerOn = () => {
    if (powerState === 'on') return;
    setPowerState('on');
    sendPulse(sendPowerOn, powerOnJoin, 'Power ON');
  };

  const handlePowerOff = () => {
    if (powerState === 'off') return;
    setPowerState('off');
    sendPulse(sendPowerOff, powerOffJoin, 'Power OFF');
  };

  // Layout handlers
  const handleLayoutFull = () => {
    if (layoutState === 'full') return;
    setLayoutState('full');
    sendPulse(sendLayoutFull, layoutFullJoin, 'Layout FULL');
  };

  const handleLayoutIndividual = () => {
    if (layoutState === 'individual') return;
    setLayoutState('individual');
    sendPulse(sendLayoutIndividual, layoutIndividualJoin, 'Layout INDIVIDUAL');
  };

  return (
    <div className="flex flex-col space-y-6 touchPanel:space-y-8 w-full max-w-sm mx-auto">
      
      {/* Power Control Section */}
      <div className="flex flex-col items-center space-y-4 touchPanel:space-y-5">
        <div className="p-3 bg-orange-500/10 rounded-full">
          <Maximize2 size={28} className="text-orange-500 touchPanel:w-10 touchPanel:h-10" />
        </div>

        <h3 className="text-base touchPanel:text-lg font-semibold text-heading">
          Power Control
        </h3>

        <div className="flex flex-col gap-3 w-full">
          <Button
            variant={powerState === 'on' ? 'success' : 'secondary'}
            size="md"
            onClick={handlePowerOn}
            className="flex items-center justify-center gap-2 py-3 touchPanel:py-4 w-full"
          >
            <Maximize2 size={18} className="touchPanel:w-5 touchPanel:h-5" />
            <span className="text-sm touchPanel:text-base">On</span>
          </Button>

          <Button
            variant={powerState === 'off' ? 'danger' : 'secondary'}
            size="md"
            onClick={handlePowerOff}
            className="flex items-center justify-center gap-2 py-3 touchPanel:py-4 w-full"
          >
            <Maximize2 size={18} className="touchPanel:w-5 touchPanel:h-5 rotate-180" />
            <span className="text-sm touchPanel:text-base">Off</span>
          </Button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t-2 border-orange-200" />

      {/* Layout Selection Section */}
      <div className="flex flex-col items-center space-y-4 touchPanel:space-y-5">
        <div className="p-3 bg-orange-500/10 rounded-full">
          <Grid2X2 size={28} className="text-orange-500 touchPanel:w-10 touchPanel:h-10" />
        </div>

        <h3 className="text-base touchPanel:text-lg font-semibold text-heading">
          Layout Selection
        </h3>

        <div className="flex flex-col gap-3 w-full">
          <Button
            variant={layoutState === 'full' ? 'primary' : 'secondary'}
            size="md"
            onClick={handleLayoutFull}
            className="flex items-center justify-center gap-2 py-3 touchPanel:py-4 w-full"
          >
            <Maximize2 size={18} className="touchPanel:w-5 touchPanel:h-5" />
            <span className="text-sm touchPanel:text-base">Full</span>
          </Button>

          <Button
            variant={layoutState === 'individual' ? 'primary' : 'secondary'}
            size="md"
            onClick={handleLayoutIndividual}
            className="flex items-center justify-center gap-2 py-3 touchPanel:py-4 w-full"
          >
            <Grid2X2 size={18} className="touchPanel:w-5 touchPanel:h-5" />
            <span className="text-sm touchPanel:text-base">Individual</span>
          </Button>
        </div>
      </div>

    </div>
  );
};

export default VideoWallDevice;
