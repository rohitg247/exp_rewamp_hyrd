import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useAudioContext } from '../../context/AudioContext';
import { useSerialJoin } from '../../hooks/useJoin';
import { SERIAL_JOINS } from '../../crestron/joins';
import { safeSessionStorage } from '../../utils/safeStorage';
import Button from '../ui/Button';

const MicrophoneControl = ({ variant = 'mics' }) => {
  const {
    ceiling1Muted,
    setCeiling1Muted,
    ceiling2Muted,
    setCeiling2Muted,
    headworn1Muted,
    setHeadworn1Muted,
    headworn2Muted,
    setHeadworn2Muted,
  } = useAudioContext();

  // ✅ Single serial join for all mic channel data
  const [, sendMicSerial] = useSerialJoin(SERIAL_JOINS.MIC_CHANNEL_DATA);

  const micRow = [
    {
      id: 1,
      name: 'Ceiling BR',
      muted: ceiling1Muted,
      setMuted: setCeiling1Muted,
    },
    {
      id: 2,
      name: 'Ceiling TR',
      muted: ceiling2Muted,
      setMuted: setCeiling2Muted,
    },
  ];

  // speaker controls
  const speakerRow = [
    {
      id: 3,
      name: 'Program Audio',
      muted: headworn1Muted,
      setMuted: setHeadworn1Muted,
      icon: Volume2,
      mutedIcon: VolumeX,
    },
    {
      id: 4,
      name: 'VC Audio',
      muted: headworn2Muted,
      setMuted: setHeadworn2Muted,
      icon: Volume2,
      mutedIcon: VolumeX,
    },
  ];

  const handleToggle = (mic) => {
    const newState = mic.muted === 0 ? 1 : 0; // Toggle: 0→1 or 1→0
    mic.setMuted(newState);

    // Read persisted volume from MicChannel's sessionStorage (consistent format)
    const savedVolume = safeSessionStorage.getItem(`micVolume_${mic.id}`);
    const value = savedVolume ? parseInt(savedVolume, 10) : 50;

    // Send via serial join with standard {id, value, muted} format — inverted: 1=muted, 0=unmuted
    const invertedMuted = newState === 0 ? 1 : 0;
    const data = JSON.stringify({ id: mic.id, value, muted: invertedMuted });
    sendMicSerial(data);
    console.log(`🎤 ${mic.name} ${newState === 0 ? 'MUTED' : 'UNMUTED'} → ${data}`);
  };

  const renderChannel = (mic) => {
    const ActiveIcon = mic.icon ?? Mic;
    const MutedIcon = mic.mutedIcon ?? MicOff;

    return (
      <Button
        key={mic.id}
        variant={mic.muted === 0 ? 'danger' : 'success'}
        size="md"
        onClick={() => handleToggle(mic)}
        className="flex flex-col items-center justify-center space-y-2 h-full min-h-[80px] touchPanel:min-h-[100px]"
      >
        {mic.muted === 0 ? (
          <MutedIcon className="w-6 h-6 touchPanel:w-8 touchPanel:h-8" />
        ) : (
          <ActiveIcon className="w-6 h-6 touchPanel:w-8 touchPanel:h-8" />
        )}
        <span className="text-xs touchPanel:text-sm font-semibold">
          {mic.name}
        </span>
        <span className="text-[10px] touchPanel:text-xs opacity-80">
          {mic.muted === 0 ? 'Muted' : 'Active'}
        </span>
      </Button>
    );
  };

  const channels = variant === 'speakers' ? speakerRow : micRow;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="grid grid-cols-2 gap-3 touchPanel:gap-6 flex-1">
        {channels.map(renderChannel)}
      </div>
    </div>
  );
};

export default MicrophoneControl;
