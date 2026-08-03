import { useState, useEffect } from 'react';
import { Lightbulb, Sun, Users, Video, Coffee, Power } from 'lucide-react';
import { useDigitalJoin, useAnalogJoin } from '../../hooks/useJoin';
import { DIGITAL_JOINS, ANALOG_JOINS, PRESET_BRIGHTNESS } from '../../crestron/joins';
import { safeSessionStorage } from '../../utils/safeStorage';
import Button from '../ui/Button';


const LightingPresetsCompact = () => {
  // Local state for UI (mutually exclusive presets)
  const [activePreset, setActivePreset] = useState(() => 
    safeSessionStorage.getItem('lightingActivePreset') || null
  );

  // Digital join setters (for pulse)
  const [, , welcomeSetDigital] = useDigitalJoin(DIGITAL_JOINS.LIGHTS_WELCOME);
  const [, , presentationSetDigital] = useDigitalJoin(DIGITAL_JOINS.LIGHTS_PRESENTATION);
  const [, , videoConfSetDigital] = useDigitalJoin(DIGITAL_JOINS.LIGHTS_VIDEO_CONF);
  const [, , meetingSetDigital] = useDigitalJoin(DIGITAL_JOINS.LIGHTS_MEETING);
  const [, , allOffSetDigital] = useDigitalJoin(DIGITAL_JOINS.LIGHTS_ALL_OFF);

  // Brightness analog join (send-only)
  const [, setBrightness] = useAnalogJoin(ANALOG_JOINS.LIGHTS_BRIGHTNESS, 50);

  // Persist state to safeStorage
  useEffect(() => {
    if (activePreset) {
      safeSessionStorage.setItem('lightingActivePreset', activePreset);
    } else {
      safeSessionStorage.removeItem('lightingActivePreset');
    }
  }, [activePreset]);

  // Send digital pulse helper (matches SourceSelection pattern)
  const sendPulse = (setFunc, presetName) => {
    console.log(`📤 Preset selected: ${presetName}`);
    setFunc(true);
    setTimeout(() => {
      setFunc(false);
      console.log(`✅ Preset pulse completed: ${presetName}`);
    }, 100);
  };

  // Handle preset selection (4 presets + All Off)
  const handlePresetSelect = (presetKey, setDigital, presetName) => {
    // Update UI state immediately (mutually exclusive)
    setActivePreset(presetKey);

    // Send digital pulse
    sendPulse(setDigital, presetName);

    // Get brightness value for this preset
    const brightnessValue = PRESET_BRIGHTNESS[presetKey];

    // Send brightness value to backend
    setBrightness(brightnessValue);

    // ✅ SAVE to storage for Room Controls sync
    safeSessionStorage.setItem('lightingBrightness', String(brightnessValue));

    console.log(`💡 Brightness set: ${brightnessValue}%`);
  };

  // Preset definitions (4 presets)
  const presets = [
    { 
      name: 'Welcome', 
      key: 'welcome', 
      icon: Coffee,
      setDigital: welcomeSetDigital,
    },
    { 
      name: 'Presentation', 
      key: 'presentation', 
      icon: Sun,
      setDigital: presentationSetDigital,
    },
    { 
      name: 'Video Conf', 
      key: 'videoConf', 
      icon: Video,
      setDigital: videoConfSetDigital,
    },
    { 
      name: 'Meeting', 
      key: 'meeting', 
      icon: Users,
      setDigital: meetingSetDigital,
    },
  ];

  return (
    <div className="flex flex-col gap-2 touchPanel:gap-3 w-full h-full">
      {/* Preset Grid - fills available height proportionally */}
      <div className="grid grid-cols-2 gap-2 touchPanel:gap-3 w-full flex-1 min-h-0">
        {presets.map((preset) => {
          const IconComponent = preset.icon;
          const isActive = activePreset === preset.key;

          return (
            <Button
              key={preset.name}
              variant={isActive ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handlePresetSelect(preset.key, preset.setDigital, preset.name)}
              className="flex flex-col items-center justify-center gap-1 touchPanel:gap-2 h-full w-full py-0"
            >
              <IconComponent className="w-4 h-4 touchPanel:w-5 touchPanel:h-5 flex-shrink-0" />
              <span className="text-xs touchPanel:text-sm font-medium leading-tight">{preset.name}</span>
            </Button>
          );
        })}
      </div>

      {/* All Lights Off - fixed proportional height */}
      <Button
        variant={activePreset === 'allOff' ? 'danger' : 'outline'}
        size="sm"
        onClick={() => handlePresetSelect('allOff', allOffSetDigital, 'All Lights Off')}
        className="w-full flex items-center justify-center gap-2 py-0 h-[22%] flex-shrink-0"
      >
        <Power className="w-4 h-4 touchPanel:w-5 touchPanel:h-5 flex-shrink-0" />
        <span className="text-xs touchPanel:text-sm">All Lights Off</span>
      </Button>
    </div>
  );
};


export default LightingPresetsCompact;