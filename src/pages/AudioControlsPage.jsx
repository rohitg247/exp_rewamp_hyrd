import { Volume2, VolumeX } from 'lucide-react';
import { SERIAL_JOINS } from '../crestron/joins';
import { useAudioContext } from '../context/AudioContext';
import { useSerialJoin } from '../hooks/useJoin';
import MicChannel from '../components/devices/MicChannel';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';


const AudioControlsPage = ({ sidebarEnabled = false }) => {
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


  // 4 channels: 2 mics + 2 speaker zones
  const micChannels = [
    {
      id: 1,
      name: 'Ceiling Mic 1',
      contextMutedState: ceiling1Muted,
      contextMutedSetter: setCeiling1Muted,
      serialJoinSetter: sendMicSerial,
    },
    {
      id: 2,
      name: 'Ceiling Mic 2',
      contextMutedState: ceiling2Muted,
      contextMutedSetter: setCeiling2Muted,
      serialJoinSetter: sendMicSerial,
    },

    // speaker controls
    {
      id: 3,
      name: 'Program Audio',
      contextMutedState: headworn1Muted,
      contextMutedSetter: setHeadworn1Muted,
      serialJoinSetter: sendMicSerial,
      icon: Volume2,
      mutedIcon: VolumeX,
    },
    {
      id: 4,
      name: 'VC Audio',
      contextMutedState: headworn2Muted,
      contextMutedSetter: setHeadworn2Muted,
      serialJoinSetter: sendMicSerial,
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
              variant="glass"
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
                  serialJoinSetter={channel.serialJoinSetter}
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
