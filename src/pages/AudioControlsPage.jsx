import { Volume2, VolumeX } from 'lucide-react';
import { ANALOG_JOINS } from '../crestron/joins';
import { useAudioContext } from '../context/AudioContext';
import { useAnalogJoin } from '../hooks/useJoin';
import MicChannel from '../components/devices/MicChannel';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';


const AudioControlsPage = ({ sidebarEnabled = false }) => {
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


  // ✅ Two analog joins per channel: volume (0-100%) + on/off (1=on, 0=muted)
  const [, setMic1Volume] = useAnalogJoin(ANALOG_JOINS.MIC1_VOLUME);
  const [, setMic1OnOff] = useAnalogJoin(ANALOG_JOINS.MIC1_ON_OFF_ANALOG);
  const [, setMic2Volume] = useAnalogJoin(ANALOG_JOINS.MIC2_VOLUME);
  const [, setMic2OnOff] = useAnalogJoin(ANALOG_JOINS.MIC2_ON_OFF_ANALOG);
  const [, setProgramAudioVolume] = useAnalogJoin(ANALOG_JOINS.PROGRAM_AUDIO_VOLUME);
  const [, setProgramAudioOnOff] = useAnalogJoin(ANALOG_JOINS.PROGRAM_AUDIO_ON_OFF_ANALOG);
  const [, setVcAudioVolume] = useAnalogJoin(ANALOG_JOINS.VC_AUDIO_VOLUME);
  const [, setVcAudioOnOff] = useAnalogJoin(ANALOG_JOINS.VC_AUDIO_ON_OFF_ANALOG);


  // 4 channels: 2 mics + 2 speaker zones
  const micChannels = [
    {
      id: 1,
      name: 'Ceiling Mic 1',
      contextMutedState: ceiling1Muted,
      contextMutedSetter: setCeiling1Muted,
      volumeSetter: setMic1Volume,
      onOffSetter: setMic1OnOff,
    },
    {
      id: 2,
      name: 'Ceiling Mic 2',
      contextMutedState: ceiling2Muted,
      contextMutedSetter: setCeiling2Muted,
      volumeSetter: setMic2Volume,
      onOffSetter: setMic2OnOff,
    },

    // speaker controls
    {
      id: 3,
      name: 'Program Audio',
      contextMutedState: programAudioMuted,
      contextMutedSetter: setProgramAudioMuted,
      volumeSetter: setProgramAudioVolume,
      onOffSetter: setProgramAudioOnOff,
      icon: Volume2,
      mutedIcon: VolumeX,
    },
    {
      id: 4,
      name: 'VC Audio',
      contextMutedState: vcAudioMuted,
      contextMutedSetter: setVcAudioMuted,
      volumeSetter: setVcAudioVolume,
      onOffSetter: setVcAudioOnOff,
      icon: Volume2,
      mutedIcon: VolumeX,
    },
  ];


  return (
    <div className="page-mesh h-[calc(100vh-72px)] touchPanel:h-[calc(100vh-110px)] w-full bg-theme-bg flex">
      <div className={`flex-1 p-6 touchPanel:p-8 flex h-full items-stretch gap-6 touchPanel:gap-8 ${
        sidebarEnabled ? 'mr-36 touchPanel:mr-44' : 'mr-0'
      }`}>
        <div className="flex-1 grid grid-cols-4 gap-6 touchPanel:gap-8">
          {micChannels.map((channel) => (
            <Card
              key={channel.id}
              variant="gradient"
              tone="audio"
              className="flex flex-col"
            >
              {/* Channel Header */}
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="flex items-center justify-center gap-2 text-md text-heading">
                  {channel.name}
                </CardTitle>
              </CardHeader>


              {/* Mic Channel Component */}
              <CardContent className="flex-1 min-h-0 flex items-center justify-center">
                <MicChannel
                  name={channel.name}
                  channelId={channel.id}
                  contextMutedState={channel.contextMutedState}
                  contextMutedSetter={channel.contextMutedSetter}
                  volumeSetter={channel.volumeSetter}
                  onOffSetter={channel.onOffSetter}
                  icon={channel.icon}
                  mutedIcon={channel.mutedIcon}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};


export default AudioControlsPage;
