import { createContext, useContext, useState, useEffect } from 'react';
import { safeSessionStorage } from '../utils/safeStorage';

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  // Master mic state (derived from 6 individual mics)
  const [masterMicOn, setMasterMicOn] = useState(() => {
    const saved = safeSessionStorage.getItem('masterMicOnGlobal');
    return saved !== null ? saved === 'true' : false;
  });

  // Individual mic mute states (0=muted, 1=unmuted in UI) — inverted before sending to backend (1=muted, 0=unmuted)
  const [ceiling1Muted, setCeiling1Muted] = useState(() => {
    const saved = safeSessionStorage.getItem('mic_ceiling1_muted');
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  const [ceiling2Muted, setCeiling2Muted] = useState(() => {
    const saved = safeSessionStorage.getItem('mic_ceiling2_muted');
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  const [headworn1Muted, setHeadworn1Muted] = useState(() => {
    const saved = safeSessionStorage.getItem('mic_headworn1_muted');
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  const [headworn2Muted, setHeadworn2Muted] = useState(() => {
    const saved = safeSessionStorage.getItem('mic_headworn2_muted');
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  const [handheldMuted, setHandheldMuted] = useState(() => {
    const saved = safeSessionStorage.getItem('mic_handheld_muted');
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  const [lapelMuted, setLapelMuted] = useState(() => {
    const saved = safeSessionStorage.getItem('mic_lapel_muted');
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  // Master speaker state (derived from the 2 speaker channels below) — kept
  // fully independent from the 6-mic master-mic aggregation above, so the
  // Sidebar's Mic button never touches these.
  // Defaults to ON — speakers were previously ON by default in the sidebar
  // (the old local `speakerOnLocal` state), so the channels default unmuted
  // to keep that startup behaviour now that the two are one system.
  const [masterSpeakerOn, setMasterSpeakerOn] = useState(() => {
    const saved = safeSessionStorage.getItem('masterSpeakerOnGlobal');
    return saved !== null ? saved === 'true' : true;
  });

  // Speaker channel mute states (0=muted, 1=unmuted in UI), same convention as mics
  const [programAudioMuted, setProgramAudioMuted] = useState(() => {
    const saved = safeSessionStorage.getItem('speaker_program_muted');
    return saved !== null ? parseInt(saved, 10) : 1;
  });

  const [vcAudioMuted, setVcAudioMuted] = useState(() => {
    const saved = safeSessionStorage.getItem('speaker_vc_muted');
    return saved !== null ? parseInt(saved, 10) : 1;
  });

  const [vcOutMuted, setVcOutMuted] = useState(() => {
    const saved = safeSessionStorage.getItem('speaker_vc_out_muted');
    return saved !== null ? parseInt(saved, 10) : 1;
  });

  // Persist master mic state
  useEffect(() => {
    safeSessionStorage.setItem('masterMicOnGlobal', masterMicOn);
  }, [masterMicOn]);

  // Persist individual mic states
  useEffect(() => {
    safeSessionStorage.setItem('mic_ceiling1_muted', ceiling1Muted);
  }, [ceiling1Muted]);

  useEffect(() => {
    safeSessionStorage.setItem('mic_ceiling2_muted', ceiling2Muted);
  }, [ceiling2Muted]);

  useEffect(() => {
    safeSessionStorage.setItem('mic_headworn1_muted', headworn1Muted);
  }, [headworn1Muted]);

  useEffect(() => {
    safeSessionStorage.setItem('mic_headworn2_muted', headworn2Muted);
  }, [headworn2Muted]);

  useEffect(() => {
    safeSessionStorage.setItem('mic_handheld_muted', handheldMuted);
  }, [handheldMuted]);

  useEffect(() => {
    safeSessionStorage.setItem('mic_lapel_muted', lapelMuted);
  }, [lapelMuted]);

  // Persist master speaker + speaker channel states
  useEffect(() => {
    safeSessionStorage.setItem('masterSpeakerOnGlobal', masterSpeakerOn);
  }, [masterSpeakerOn]);

  useEffect(() => {
    safeSessionStorage.setItem('speaker_program_muted', programAudioMuted);
  }, [programAudioMuted]);

  useEffect(() => {
    safeSessionStorage.setItem('speaker_vc_muted', vcAudioMuted);
  }, [vcAudioMuted]);

  useEffect(() => {
    safeSessionStorage.setItem('speaker_vc_out_muted', vcOutMuted);
  }, [vcOutMuted]);

  // ✅ Auto-sync master speaker based on the 3 speaker channels (mirrors master mic below)
  useEffect(() => {
    const isManualClick = safeSessionStorage.getItem('masterSpeakerManualClick') === 'true';
    if (isManualClick) return;

    const allMuted = programAudioMuted === 0 && vcAudioMuted === 0 && vcOutMuted === 0;
    const anyUnmuted = programAudioMuted === 1 || vcAudioMuted === 1 || vcOutMuted === 1;

    if (allMuted && masterSpeakerOn) {
      setMasterSpeakerOn(false);
      console.log('🔊 Master Speaker AUTO-MUTED (all speaker channels muted)');
    } else if (anyUnmuted && !masterSpeakerOn) {
      setMasterSpeakerOn(true);
      console.log('🔊 Master Speaker AUTO-UNMUTED (speaker activity detected)');
    }
  }, [programAudioMuted, vcAudioMuted, vcOutMuted, masterSpeakerOn]);

  // ✅ Auto-sync master mic based on individual mics (ONLY if not manual click)
  useEffect(() => {
    const isManualClick = safeSessionStorage.getItem('masterMicManualClick') === 'true';

    // Skip auto-sync during manual master mic toggle
    if (isManualClick) {
      return;
    }

    const allMuted = 
      ceiling1Muted === 0 && 
      ceiling2Muted === 0 && 
      headworn1Muted === 0 && 
      headworn2Muted === 0 && 
      handheldMuted === 0 && 
      lapelMuted === 0;

    const anyUnmuted = 
      ceiling1Muted === 1 || 
      ceiling2Muted === 1 || 
      headworn1Muted === 1 || 
      headworn2Muted === 1 || 
      handheldMuted === 1 || 
      lapelMuted === 1;

    if (allMuted && masterMicOn) {
      setMasterMicOn(false);
      console.log('🎤 Master Mic AUTO-MUTED (all mics muted)');
    } else if (anyUnmuted && !masterMicOn) {
      setMasterMicOn(true);
      console.log('🎤 Master Mic AUTO-UNMUTED (mic activity detected)');
    }
  }, [ceiling1Muted, ceiling2Muted, headworn1Muted, headworn2Muted, handheldMuted, lapelMuted, masterMicOn]);

  const value = {
    masterMicOn,
    setMasterMicOn,

    ceiling1Muted,
    setCeiling1Muted,
    ceiling2Muted,
    setCeiling2Muted,
    headworn1Muted,
    setHeadworn1Muted,
    headworn2Muted,
    setHeadworn2Muted,
    handheldMuted,
    setHandheldMuted,
    lapelMuted,
    setLapelMuted,

    masterSpeakerOn,
    setMasterSpeakerOn,
    programAudioMuted,
    setProgramAudioMuted,
    vcAudioMuted,
    setVcAudioMuted,
    vcOutMuted,
    setVcOutMuted,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudioContext() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioContext must be used within AudioProvider');
  }
  return context;
}