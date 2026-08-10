import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Plus, Minus } from 'lucide-react';
import { useDigitalJoin, useAnalogJoin } from '../../hooks/useJoin';
import { safeSessionStorage } from '../../utils/safeStorage';
import VolumeSlider from '../ui/VolumeSlider';
import Button from '../ui/Button';

const AudioChannel = ({ 
  name, 
  muteJoin,
  volUpJoin,
  volDownJoin,
  volumeJoin,
  channelId,
  step = 5
}) => {
  // Volume state (0-100%)
  const [volumePercent, setVolumePercent] = useState(() => {
    const saved = safeSessionStorage.getItem(`audioVolume_ch${channelId}`);
    return saved ? parseInt(saved, 10) : 50;
  });

  // Mute state
  const [isMuted, setIsMuted] = useState(() => {
    const saved = safeSessionStorage.getItem(`audioMute_ch${channelId}`);
    return saved === 'true';
  });

  // Persist states
  useEffect(() => {
    safeSessionStorage.setItem(`audioVolume_ch${channelId}`, volumePercent);
  }, [volumePercent, channelId]);

  useEffect(() => {
    safeSessionStorage.setItem(`audioMute_ch${channelId}`, isMuted);
  }, [isMuted, channelId]);

  // Digital joins
  const [, , sendMuteToggle] = useDigitalJoin(muteJoin);
  const [, , sendVolUp] = useDigitalJoin(volUpJoin);
  const [, , sendVolDown] = useDigitalJoin(volDownJoin);

  // Analog join for volume
  const [, setVolumeLevel] = useAnalogJoin(volumeJoin, volumePercent);

  // Send pulse helper
  const sendPulse = (setFunc, joinNumber, actionName) => {
    console.log(`📤 ${name}: ${actionName} (Join: ${joinNumber})`);
    setFunc(true);
    setTimeout(() => {
      setFunc(false);
      console.log(`✅ ${name}: Pulse completed`);
    }, 100);
  };

  // Mute toggle handler
  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    sendPulse(sendMuteToggle, muteJoin, `Mute ${!isMuted ? 'ON' : 'OFF'}`);
  };

  // Volume handlers
  const handleVolumeChange = (newPercent) => {
    setVolumePercent(newPercent);
  };

  const handleVolumeChangeComplete = (finalPercent) => {
    setVolumePercent(finalPercent);
    setVolumeLevel(finalPercent);
    console.log(`📤 ${name}: Volume set to ${finalPercent}% (Join: ${volumeJoin})`);
  };

  const handleIncrement = () => {
    const newVolume = Math.min(100, volumePercent + step);
    setVolumePercent(newVolume);
    setVolumeLevel(newVolume);
    sendPulse(sendVolUp, volUpJoin, `Volume Up to ${newVolume}%`);
  };

  const handleDecrement = () => {
    const newVolume = Math.max(0, volumePercent - step);
    setVolumePercent(newVolume);
    setVolumeLevel(newVolume);
    sendPulse(sendVolDown, volDownJoin, `Volume Down to ${newVolume}%`);
  };

  return (
    <div className="rounded-lg p-4 touchPanel:p-6 bg-gradient-to-br from-blue-50 to-white shadow-sm flex flex-col items-center space-y-3 touchPanel:space-y-4 h-full">
    {/* <div className="rounded-lg p-4 touchPanel:p-6 bg-white shadow-sm flex flex-col items-center space-y-3 touchPanel:space-y-4 h-full"> */}
      {/* Volume Increase Button */}
      <Button
        variant="success"
        size="md"
        onClick={handleIncrement}
        disabled={volumePercent >= 100}
        className="w-20 touchPanel:w-24 flex items-center justify-center space-x-2
                   touchPanel:py-4 touchPanel:px-8 touchPanel:text-lg
                   h-auto font-semibold flex-shrink-0"
        aria-label="Increase volume"
      >
        <Plus size={20} />
      </Button>

      {/* Volume Slider */}
      <div className="flex-1 flex items-center justify-center w-full !bg-transparent">
        <VolumeSlider
          value={volumePercent}
          onChange={handleVolumeChange}
          onChangeComplete={handleVolumeChangeComplete}
          min={0}
          max={100}
          step={5}
          showValue={true}
          label=""
          interactive={true}
          className="flex flex-col items-center justify-center h-full"
        />
      </div>

      {/* Volume Decrease Button */}
      <Button
        variant="primary"
        size="md"
        onClick={handleDecrement}
        disabled={volumePercent <= 0}
        className="w-20 touchPanel:w-24 flex items-center justify-center space-x-2
                   touchPanel:py-4 touchPanel:px-8 touchPanel:text-lg
                   h-auto font-semibold flex-shrink-0"
        aria-label="Decrease volume"
      >
        <Minus size={20} />
      </Button>

      {/* Divider */}
      <div className="border-b border-gray-300 touchPanel:border-b-2 w-full" />

      {/* Mute Toggle Button */}
      <Button
        variant={isMuted ? 'danger' : 'success'}
        size="md"
        onClick={handleMuteToggle}
        className="w-20 touchPanel:w-24 flex items-center justify-center space-x-2
                   touchPanel:py-4 touchPanel:px-8 touchPanel:text-lg
                   h-auto font-semibold flex-shrink-0"
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </Button>
    </div>
  );
};

export default AudioChannel;
