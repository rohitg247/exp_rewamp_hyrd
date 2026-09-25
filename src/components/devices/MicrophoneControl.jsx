import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useAudioContext } from '../../context/AudioContext';
import { useAnalogJoin } from '../../hooks/useJoin';
import { ANALOG_JOINS } from '../../crestron/joins';
import Button from '../ui/Button';

const MicrophoneControl = ({ variant = 'mics' }) => {
  const {
    ceiling1Muted,
    setCeiling1Muted,
    ceiling2Muted,
    setCeiling2Muted,
    programAudioMuted,
    setProgramAudioMuted,
    vcAudioMuted,
    setVcAudioMuted,
  } = useAudioContext();

  // Analog on/off join per channel (1 = on, 0 = muted)
  const [, setCeiling1OnOff] = useAnalogJoin(ANALOG_JOINS.CEILING_BR_ON_OFF_ANALOG);
  const [, setCeiling2OnOff] = useAnalogJoin(ANALOG_JOINS.CEILING_TR_ON_OFF_ANALOG);
  const [, setProgramOnOff] = useAnalogJoin(ANALOG_JOINS.PROGRAM_AUDIO_ON_OFF_ANALOG);
  const [, setVcInOnOff] = useAnalogJoin(ANALOG_JOINS.VC_IN_ON_OFF_ANALOG);

  const micRow = [
    {
      id: 1,
      name: 'Ceiling BR',
      muted: ceiling1Muted,
      setMuted: setCeiling1Muted,
      sendOnOff: setCeiling1OnOff,
    },
    {
      id: 2,
      name: 'Ceiling TR',
      muted: ceiling2Muted,
      setMuted: setCeiling2Muted,
      sendOnOff: setCeiling2OnOff,
    },
  ];

  // speaker controls
  const speakerRow = [
    {
      id: 3,
      name: 'Program Audio',
      muted: programAudioMuted,
      setMuted: setProgramAudioMuted,
      sendOnOff: setProgramOnOff,
      icon: Volume2,
      mutedIcon: VolumeX,
    },
    {
      id: 4,
      name: 'VC Audio',
      muted: vcAudioMuted,
      setMuted: setVcAudioMuted,
      sendOnOff: setVcInOnOff,
      icon: Volume2,
      mutedIcon: VolumeX,
    },
  ];

  const handleToggle = (mic) => {
    const newState = mic.muted === 0 ? 1 : 0; // Toggle: 0→1 or 1→0
    mic.setMuted(newState);
    mic.sendOnOff(newState);
    console.log(`🎤 ${mic.name} ${newState === 0 ? 'MUTED' : 'UNMUTED'} → analog ${newState}`);
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
