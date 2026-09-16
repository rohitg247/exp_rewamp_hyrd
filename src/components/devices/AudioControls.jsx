// src/components/devices/AudioControls.jsx
//
// Consolidated audio control — replaces the two separate MicrophoneControl
// mounts on MainPage. Renders Mics and Speakers as two sections inside a
// single card, with a divider between them.
//
// TSW-1070 safe: only var(--color-*), no color-mix(), no backdrop-filter.

import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useAudioContext } from '../../context/AudioContext';
import { useSerialJoin } from '../../hooks/useJoin';
import { SERIAL_JOINS } from '../../crestron/joins';
import { safeSessionStorage } from '../../utils/safeStorage';
import Button from '../ui/Button';

const AudioControls = () => {
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

  const [, sendMicSerial] = useSerialJoin(SERIAL_JOINS.MIC_CHANNEL_DATA);

  const micChannels = [
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

  const speakerChannels = [
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
      name: 'VC IN',
      muted: headworn2Muted,
      setMuted: setHeadworn2Muted,
      icon: Volume2,
      mutedIcon: VolumeX,
    },
    {
      id: 5,
      name: 'VC OUT',
      muted: headworn2Muted,
      setMuted: setHeadworn2Muted,
      icon: Volume2,
      mutedIcon: VolumeX,
    },
  ];

  const handleToggle = (channel) => {
    const newState = channel.muted === 0 ? 1 : 0;
    channel.setMuted(newState);

    const savedVolume = safeSessionStorage.getItem(`micVolume_${channel.id}`);
    const value = savedVolume ? parseInt(savedVolume, 10) : 50;

    const invertedMuted = newState === 0 ? 1 : 0;
    const data = JSON.stringify({
      id: channel.id,
      value,
      muted: invertedMuted,
    });

    sendMicSerial(data);
    console.log(
      `🎧 ${channel.name} ${newState === 0 ? 'MUTED' : 'UNMUTED'} → ${data}`
    );
  };

  const renderChannel = (channel) => {
    const ActiveIcon = channel.icon ?? Mic;
    const MutedIcon = channel.mutedIcon ?? MicOff;
    const isMuted = channel.muted === 0;

    return (
      <Button
        key={channel.id}
        variant={isMuted ? 'danger' : 'success'}
        size="md"
        onClick={() => handleToggle(channel)}
        className="flex flex-col items-center justify-center gap-1.5 touchPanel:gap-2 h-full min-h-[92px] touchPanel:min-h-[120px] py-3 touchPanel:py-4"
      >
        {isMuted ? (
          <MutedIcon className="w-6 h-6 touchPanel:w-8 touchPanel:h-8" />
        ) : (
          <ActiveIcon className="w-6 h-6 touchPanel:w-8 touchPanel:h-8" />
        )}
        <span className="text-xs touchPanel:text-sm font-semibold text-center leading-tight">
          {channel.name}
        </span>
        <span className="text-[10px] touchPanel:text-xs opacity-80">
          {isMuted ? 'Muted' : 'Active'}
        </span>
      </Button>
    );
  };

  // Small subsection title — theme-aware, low-noise.
  const SectionTitle = ({ icon: Icon, label }) => (
    <div className="flex items-center gap-2 mb-2 touchPanel:mb-3 flex-shrink-0">
      <Icon
        className="w-4 h-4 touchPanel:w-5 touchPanel:h-5 flex-shrink-0"
        style={{ color: 'var(--color-primary)' }}
      />
      <span
        className="text-xs touchPanel:text-sm font-semibold uppercase tracking-wide"
        style={{ color: 'var(--color-text-light)' }}
      >
        {label}
      </span>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col gap-4 touchPanel:gap-5">
      {/* ── Mics ─────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex flex-col">
        <SectionTitle icon={Mic} label="Microphones" />
        <div className="grid grid-cols-2 gap-3 touchPanel:gap-4 flex-1 min-h-0">
          {micChannels.map(renderChannel)}
        </div>
      </div>

      {/* ── Divider ──────────────────────────────────────────── */}
      <div
        className="w-full flex-shrink-0"
        style={{
          height: '1px',
          backgroundColor: 'var(--color-border)',
        }}
      />

      {/* ── Speakers ─────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex flex-col">
        <SectionTitle icon={Volume2} label="Speakers" />
        <div className="grid grid-cols-2 gap-3 touchPanel:gap-4 flex-1 min-h-0">
          {speakerChannels.map(renderChannel)}
        </div>
      </div>
    </div>
  );
};

export default AudioControls;