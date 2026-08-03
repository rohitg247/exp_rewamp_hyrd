import { useState } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { Power } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useDigitalJoin } from '../../hooks/useJoin';
import { DIGITAL_JOINS } from '../../crestron/joins';
import { safeSessionStorage } from '../../utils/safeStorage';

const ShutdownModal = ({ isOpen, onConfirm, onCancel }) => {
  const { setCeiling1Muted, setCeiling2Muted, setHeadworn1Muted, setHeadworn2Muted, setHandheldMuted, setLapelMuted } = useAudioContext();
  const [isShuttingDown, setIsShuttingDown] = useState(false);

  // Get set function for sending the shutdown pulse
  const [, , sendShutdownCombined] = useDigitalJoin(DIGITAL_JOINS.SYSTEM_SHUTDOWN_COMBINED);

  // Send momentary pulse (true → false) on join
  const sendPulse = (setFunction, joinNumber, name) => {
    console.log(`📤 Sending pulse to ${name} (Join: ${joinNumber})`);
    setFunction(true);
    setTimeout(() => {
      setFunction(false);
      console.log(`✅ Pulse completed for ${name} (Join: ${joinNumber})`);
    }, 100);
  };

  const handleConfirm = () => {
    setIsShuttingDown(true);

    // 🔥 Clear all sessionStorage (resets all UI states)
    safeSessionStorage.clear();
    window.dispatchEvent(new Event('system-shutdown'));
    console.log('🧹 SessionStorage cleared - all UI states reset');

    // Explicitly mute all mics (reinforces sessionStorage clear)
    // setCeiling1Muted(0);
    // setCeiling2Muted(0);
    // setHeadworn1Muted(0);
    // setHeadworn2Muted(0);
    // setHandheldMuted(0);
    // setLapelMuted(0);
    // console.log('🎤 All mics explicitly reset to MUTED on shutdown');

    // Explicitly mute all mics after 500ms delay
    setTimeout(() => {
      setCeiling1Muted(0);
      setCeiling2Muted(0);
      setHeadworn1Muted(0);
      setHeadworn2Muted(0);
      setHandheldMuted(0);
      setLapelMuted(0);
      console.log('🎤 All mics explicitly reset to MUTED on shutdown');
    }, 2000);    

    // 🔥 Send shutdown pulse
    sendPulse(sendShutdownCombined, DIGITAL_JOINS.SYSTEM_SHUTDOWN_COMBINED, 'SYSTEM_SHUTDOWN_COMBINED');

    // Navigate to landing page after animation
    setTimeout(() => {
      onConfirm();
      setIsShuttingDown(false);
    }, 500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Shutdown System"
      showCloseButton={!isShuttingDown}
      maxWidth="max-w-lg touchPanel:max-w-fit"
    >
      <div className="text-center py-6 touchPanel:py-12 touchPanel:px-12">
        <div className="mb-8 touchPanel:mb-16">
          <Power className="w-12 h-12 md:w-16 md:h-16 touchPanel:w-24 touchPanel:h-24 mx-auto text-danger mb-6 touchPanel:mb-12" />
          <p className="text-lg touchPanel:text-3xl text-danger font-semibold touchPanel:font-bold mb-4 touchPanel:mb-6 touchPanel:whitespace-nowrap">
            Are you sure you want to shut down the system?
          </p>
          <p className="text-sm touchPanel:text-xl text-gray-600 touchPanel:text-gray-800">
            This will power off all connected AV equipment and end the session.
          </p>
          <p className="text-xs touchPanel:text-lg text-gray-500 mt-2">
            Room: <strong className="uppercase">Main Page</strong>
          </p>
        </div>

        {isShuttingDown ? (
          <div className="space-y-4 touchPanel:space-y-8">
            <div className="animate-spin rounded-full h-8 w-8 touchPanel:h-16 touchPanel:w-16 border-b-2 touchPanel:border-b-4 border-danger mx-auto"></div>
            <p className="text-danger touchPanel:text-xl">Shutting down system...</p>
          </div>
        ) : (
          <div className="flex space-x-3 touchPanel:space-x-8 justify-center">
            <Button 
              variant="secondary" 
              size="responsive" 
              onClick={onCancel}
              className="py-2 touchPanel:py-8 px-6 touchPanel:px-12"
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              size="responsive" 
              onClick={handleConfirm}
              className="py-2 touchPanel:py-8 px-6 touchPanel:px-12"
            >
              Confirm Shutdown
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ShutdownModal;