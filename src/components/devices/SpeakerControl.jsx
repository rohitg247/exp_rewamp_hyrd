import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { useAnalogJoin } from '../../hooks/useJoin';
import { ANALOG_JOINS } from '../../crestron/joins';
import { useAudioContext } from '../../context/AudioContext';
import { safeSessionStorage } from '../../utils/safeStorage';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import VolumeSlider from '../ui/VolumeSlider';

const SpeakerControl = () => {
  // Get master mic state and individual mic setters from context
  const {
    masterMicOn,
    setMasterMicOn,
    setCeiling1Muted,
    setCeiling2Muted,
    setHeadworn1Muted,
    setHeadworn2Muted,
    setHandheldMuted,
    setLapelMuted,
    setProgramAudioMuted,
    setVcAudioMuted,
    setVcOutMuted,
    masterSpeakerOn,
    setMasterSpeakerOn,
  } = useAudioContext();

  // Speaker state lives in AudioContext (persisted there), derived from the
  // Program Audio / VC Audio channels — that derivation is what makes this
  // button and the Main page Speakers card two-way synced, exactly like mics.

  const [volumePercent, setVolumePercent] = useState(() => {
    try {
      const saved = safeSessionStorage.getItem('speakerVolume');
      if (!saved) return 50;

      const parsed = parseInt(saved, 10);
      if (isNaN(parsed) || parsed < 0 || parsed > 100) {
        console.warn('⚠️ Invalid volume value in storage, using default');
        safeSessionStorage.removeItem('speakerVolume');
        return 50;
      }
      return parsed;
    } catch (error) {
      console.error('❌ Failed to restore volume:', error);
      safeSessionStorage.removeItem('speakerVolume');
      return 50;
    }
  });

  // Analog join for volume
  const [, setVolumeLevel] = useAnalogJoin(ANALOG_JOINS.SPEAKER_VOLUME, volumePercent);

  // Analog join for master mic (only this join is sent to backend) — 1=on, 0=off
  const [, setMasterMicJoin] = useAnalogJoin(ANALOG_JOINS.MIC_MASTER, masterMicOn ? 1 : 0);

  // Analog join for speaker ON/OFF (persistent state) — 1=on, 0=off
  const [, setSpeakerAnalog] = useAnalogJoin(ANALOG_JOINS.SPEAKER_ON_OFF_ANALOG, masterSpeakerOn ? 1 : 0);

  // Analog join for master mic MANUAL button press (separate from auto-sync A1) — 1=on, 0=off
  const [, setMasterMicManual] = useAnalogJoin(ANALOG_JOINS.MIC_MASTER_MANUAL, masterMicOn ? 1 : 0);

  
  // Send master mic analog join ONLY on auto-sync (not manual click)
  useEffect(() => {
    const isManual = safeSessionStorage.getItem('masterMicManualClick') === 'true';
    if (isManual) {
      console.log(`⏭️ Master Mic auto-sync skipped (manual click in progress)`);
      return;
    }
    setMasterMicJoin(masterMicOn ? 1 : 0);
    console.log(`📤 Master Mic Analog synced: ${masterMicOn ? 'ON (1)' : 'OFF (0)'} (Join: ${ANALOG_JOINS.MIC_MASTER})`);
  }, [masterMicOn]);

  // Send speaker analog join ONLY on auto-sync (not manual click) — mirrors the
  // master-mic effect above. This is what fires when the user changes Program
  // Audio / VC Audio from the Main page card: the context re-derives
  // masterSpeakerOn, this button re-renders, and the join goes out.
  useEffect(() => {
    const isManual = safeSessionStorage.getItem('masterSpeakerManualClick') === 'true';
    if (isManual) {
      console.log(`⏭️ Master Speaker auto-sync skipped (manual click in progress)`);
      return;
    }
    setSpeakerAnalog(masterSpeakerOn ? 1 : 0);
    console.log(`📤 Speaker Analog synced: ${masterSpeakerOn ? 'ON (1)' : 'OFF (0)'} (Join: ${ANALOG_JOINS.SPEAKER_ON_OFF_ANALOG})`);
  }, [masterSpeakerOn]);

  useEffect(() => {
    safeSessionStorage.setItem('speakerVolume', volumePercent);
  }, [volumePercent]);

  // Speaker toggle handler — mirrors handleMasterMicToggle below: this button
  // is the "master speaker" control, so it also drives Program Audio/VC Audio
  // on the Main page's Speakers card (kept fully independent of mic state —
  // see AudioContext.jsx).
  const handleSpeakerToggle = () => {
    const newState = !masterSpeakerOn;

    safeSessionStorage.setItem('masterSpeakerManualClick', 'true');

    setMasterSpeakerOn(newState);
    setSpeakerAnalog(newState ? 1 : 0);
    console.log(`📤 Speaker Analog: ${newState ? 'ON (1)' : 'OFF (0)'} (Join: ${ANALOG_JOINS.SPEAKER_ON_OFF_ANALOG})`);

    const speakerChannelState = newState ? 1 : 0;
    setProgramAudioMuted(speakerChannelState);
    setVcAudioMuted(speakerChannelState);
    setVcOutMuted(speakerChannelState);
    console.log(`🔊 Speaker channels UI updated to: ${newState ? 'UNMUTED (1)' : 'MUTED (0)'}`);

    safeSessionStorage.removeItem('masterSpeakerManualClick');
  };

  // // ✅ Master mic toggle - Send ONLY analog join, update UI state for all 6 mics
  // const handleMasterMicToggle = () => {
  //   const newState = !masterMicOn;

  //   // ✅ Set flag to prevent auto-sync from triggering during manual operation
  //   safeSessionStorage.setItem('masterMicManualClick', 'true');

  //   // Update master mic state in context (useEffect will send Join automatically)
  //   setMasterMicOn(newState);

  //   // Send analog join on manual click (A24 — separate from auto-sync A1)
  //   setMasterMicManual(newState ? 1 : 0);
  //   console.log(`📤 Master Mic Manual Toggle ${newState ? 'ON (1)' : 'OFF (0)'} (Join: ${ANALOG_JOINS.MIC_MASTER_MANUAL})`);

  //   // ✅ Update UI state ONLY for all 6 individual mics (NO analog sends)
  //   const micState = newState ? 1 : 0; // Master ON = 1 (unmuted), Master OFF = 0 (muted)

  //   setCeiling1Muted(micState);
  //   setCeiling2Muted(micState);
  //   setHeadworn1Muted(micState);
  //   setHeadworn2Muted(micState);
  //   setHandheldMuted(micState);
  //   setLapelMuted(micState);

  //   console.log(`🎤 All 6 mics UI updated to: ${newState ? 'UNMUTED (1)' : 'MUTED (0)'} (UI only - NO analog sends)`);

  //   // Trigger storage event for cross-component sync
  //   window.dispatchEvent(new Event('storage'));

  //   // ✅ Clear flag after state updates complete
  //   setTimeout(() => {
  //     safeSessionStorage.removeItem('masterMicManualClick');
  //     console.log('✅ Manual click flag cleared');
  //   }, 100);
  // };

  // ✅ Master mic toggle - Send ONLY analog join, update UI state for all 6 mics
  const handleMasterMicToggle = () => {
    const newState = !masterMicOn;

    // ✅ Set flag to prevent auto-sync interference
    safeSessionStorage.setItem('masterMicManualClick', 'true');

    // Update master mic state in context
    setMasterMicOn(newState);

    // Send analog join on manual click (A224)
    setMasterMicManual(newState ? 1 : 0);
    console.log(`📤 Master Mic Manual Toggle ${newState ? 'ON (1)' : 'OFF (0)'} (Join: ${ANALOG_JOINS.MIC_MASTER_MANUAL})`);

    // ✅ Update UI state for all 6 individual mics
    const micState = newState ? 1 : 0;
    setCeiling1Muted(micState);
    setCeiling2Muted(micState);
    setHeadworn1Muted(micState);
    setHeadworn2Muted(micState);
    setHandheldMuted(micState);
    setLapelMuted(micState);

    console.log(`🎤 All 6 mics UI updated to: ${newState ? 'UNMUTED (1)' : 'MUTED (0)'}`);

    // ✅ Clear flag synchronously — before React batches state updates
    safeSessionStorage.removeItem('masterMicManualClick');
    console.log('✅ Manual click flag cleared');

    // Trigger storage event for cross-component sync
    window.dispatchEvent(new Event('storage'));
  };


  // Volume change handlers
  const handleVolumeChange = (newPercent) => {
    setVolumePercent(newPercent);
  };

  const handleVolumeChangeComplete = (finalPercent) => {
    setVolumePercent(finalPercent);
    setVolumeLevel(finalPercent);
    console.log(`📤 Volume RELEASED at: ${finalPercent}% (Analog Join: ${ANALOG_JOINS.SPEAKER_VOLUME})`);
  };

  return (
    // 2026-08-06 UI revamp: dropped the legacy `device-card` class. It predates
    // the Card component and was layering a 1px border + its own radius on top
    // of the glass surface, so the sidebar card was the only card on screen with
    // a hard outline instead of the --surface-edge ring. tone="audio" matches
    // the Mics/Speakers cards on MainPage.
    <Card variant="gradient" tone="audio" className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-center space-x-2 text-center">
          <span className="touchPanel:text-2xl -mt-2 touchPanel:font-semibold">Speaker</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 flex-1 flex flex-col items-center justify-between">
        <VolumeSlider
          value={volumePercent}
          onChange={handleVolumeChange}
          onChangeComplete={handleVolumeChangeComplete}
          onThrottledChange={(val) => setVolumeLevel(val)}
          min={0}
          max={100}
          step={1}
          showValue={true}
          label=""
          className="flex-1 flex flex-col items-center justify-center mt-2"
        />

        <div className="border-b border-gray-300 w-full" />


        <Button
          variant={masterSpeakerOn ? 'success' : 'danger'}
          size="sm"
          onClick={handleSpeakerToggle}
          className="min-w-[40px] flex items-center justify-center space-x-2 py-3 px-6 h-auto font-semibold flex-shrink-0 touchPanel:py-4 touchPanel:px-10"
        >
          {masterSpeakerOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </Button>

        <Button
          variant={masterMicOn ? 'success' : 'danger'}
          size="sm"
          onClick={handleMasterMicToggle}
          className="min-w-[40px] flex items-center justify-center space-x-2 py-3 px-6 h-auto font-semibold flex-shrink-0 touchPanel:py-4 touchPanel:px-10"
        >
          {masterMicOn ? <Mic size={20} /> : <MicOff size={20} />}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SpeakerControl;
