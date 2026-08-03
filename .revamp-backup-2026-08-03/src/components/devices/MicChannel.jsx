import { useState, useEffect } from 'react';
import { Mic, MicOff, Plus, Minus } from 'lucide-react';
import { safeSessionStorage } from '../../utils/safeStorage';
import VolumeSlider from '../ui/VolumeSlider';
import Button from '../ui/Button';

const MicChannel = ({
  name,
  channelId,
  contextMutedState,
  contextMutedSetter,
  serialJoinSetter,
  step = 1,
  icon: ActiveIcon = Mic,
  mutedIcon: MutedIcon = MicOff,
}) => {
  // Volume state (0-100%)
  const [volumePercent, setVolumePercent] = useState(() => {
    const saved = safeSessionStorage.getItem(`micVolume_${channelId}`);
    return saved ? parseInt(saved, 10) : 50;
  });

  // Get mute state from context
  const isMuted = contextMutedState === 0;

  // Persist volume
  useEffect(() => {
    safeSessionStorage.setItem(`micVolume_${channelId}`, volumePercent);
  }, [volumePercent, channelId]);

  // Helper: build and send mic data JSON via serial join — muted is inverted for backend: 1=muted, 0=unmuted
  const sendMicData = (overrides = {}) => {
    if (!serialJoinSetter) return;
    const mutedValue = overrides.muted ?? contextMutedState;
    const invertedMuted = mutedValue === 0 ? 1 : 0;
    const data = {
      id: channelId,
      value: overrides.value ?? volumePercent,
      muted: invertedMuted,
    };
    const jsonString = JSON.stringify(data);
    serialJoinSetter(jsonString);
    console.log(`📤 ${name}: Serial mic data sent:`, jsonString);
  };

  // ✅ Mute toggle handler - Updates context AND sends serial JSON
  const handleMuteToggle = () => {
    const newMuteValue = isMuted ? 1 : 0; // Toggle: 0→1 or 1→0

    // Update context state (triggers auto-sync for master mic)
    contextMutedSetter(newMuteValue);

    // Send to backend via serial join
    sendMicData({ muted: newMuteValue });

    console.log(`🎤 ${name}: ${newMuteValue === 1 ? 'UNMUTED' : 'MUTED'}`);
  };

  // Volume handlers
  const handleVolumeChange = (newPercent) => {
    setVolumePercent(newPercent);
  };

  const handleVolumeChangeComplete = (finalPercent) => {
    setVolumePercent(finalPercent);
    sendMicData({ value: finalPercent });
  };

  // Throttled volume send during drag (every 100ms)
  const handleThrottledChange = (throttledPercent) => {
    sendMicData({ value: throttledPercent });
  };

  const handleIncrement = () => {
    const newVolume = Math.min(100, volumePercent + step);
    setVolumePercent(newVolume);
    sendMicData({ value: newVolume });
    console.log(`📤 ${name}: Volume Up to ${newVolume}%`);
  };

  const handleDecrement = () => {
    const newVolume = Math.max(0, volumePercent - step);
    setVolumePercent(newVolume);
    sendMicData({ value: newVolume });
    console.log(`📤 ${name}: Volume Down to ${newVolume}%`);
  };

  return (
    <div className="rounded-lg p-4 touchPanel:p-6 flex flex-col items-center space-y-3 touchPanel:space-y-4 h-full">
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
      <div className="flex-1 flex items-center justify-center w-full">
        <VolumeSlider
          value={volumePercent}
          onChange={handleVolumeChange}
          onChangeComplete={handleVolumeChangeComplete}
          onThrottledChange={handleThrottledChange}
          min={0}
          max={100}
          step={1}
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
        {isMuted ? <MutedIcon size={20} /> : <ActiveIcon size={20} />}
      </Button>
    </div>
  );
};

export default MicChannel;
