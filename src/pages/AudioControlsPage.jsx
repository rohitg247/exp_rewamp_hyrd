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
    vcOutMuted,
    setVcOutMuted,
  } = useAudioContext();


  // ✅ Two analog joins per channel: volume (0-100%) + on/off (1=on, 0=muted)
  const [, setCeilingBrVolume] = useAnalogJoin(ANALOG_JOINS.CEILING_BR_VOLUME);
  const [, setCeilingBrOnOff] = useAnalogJoin(ANALOG_JOINS.CEILING_BR_ON_OFF_ANALOG);
  const [, setCeilingTrVolume] = useAnalogJoin(ANALOG_JOINS.CEILING_TR_VOLUME);
  const [, setCeilingTrOnOff] = useAnalogJoin(ANALOG_JOINS.CEILING_TR_ON_OFF_ANALOG);
  const [, setProgramAudioVolume] = useAnalogJoin(ANALOG_JOINS.PROGRAM_AUDIO_VOLUME);
  const [, setProgramAudioOnOff] = useAnalogJoin(ANALOG_JOINS.PROGRAM_AUDIO_ON_OFF_ANALOG);
  const [, setVcInVolume] = useAnalogJoin(ANALOG_JOINS.VC_IN_VOLUME);
  const [, setVcInOnOff] = useAnalogJoin(ANALOG_JOINS.VC_IN_ON_OFF_ANALOG);
  const [, setVcOutVolume] = useAnalogJoin(ANALOG_JOINS.VC_OUT_VOLUME);
  const [, setVcOutOnOff] = useAnalogJoin(ANALOG_JOINS.VC_OUT_ON_OFF_ANALOG);


  // 5 channels: 2 mics + 3 speaker zones
  const micChannels = [
    {
      id: 1,
      name: 'Ceiling BR',
      contextMutedState: ceiling1Muted,
      contextMutedSetter: setCeiling1Muted,
      volumeSetter: setCeilingBrVolume,
      onOffSetter: setCeilingBrOnOff,
    },
    {
      id: 2,
      name: 'Ceiling TR',
      contextMutedState: ceiling2Muted,
      contextMutedSetter: setCeiling2Muted,
      volumeSetter: setCeilingTrVolume,
      onOffSetter: setCeilingTrOnOff,
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
      name: 'VC In',
      contextMutedState: vcAudioMuted,
      contextMutedSetter: setVcAudioMuted,
      volumeSetter: setVcInVolume,
      onOffSetter: setVcInOnOff,
      icon: Volume2,
      mutedIcon: VolumeX,
    },
    {
      id: 5,
      name: 'VC Out',
      contextMutedState: vcOutMuted,
      contextMutedSetter: setVcOutMuted,
      volumeSetter: setVcOutVolume,
      onOffSetter: setVcOutOnOff,
      icon: Volume2,
      mutedIcon: VolumeX,
    },
  ];


  return (
    <div className="page-mesh h-[calc(100vh-72px)] touchPanel:h-[calc(100vh-110px)] w-full bg-theme-bg flex">
      <div className={`flex-1 p-6 touchPanel:p-8 flex h-full items-stretch gap-6 touchPanel:gap-8 ${
        sidebarEnabled ? 'mr-36 touchPanel:mr-44' : 'mr-0'
      }`}>
        <div className="flex-1 grid grid-cols-5 gap-6 touchPanel:gap-8">
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
