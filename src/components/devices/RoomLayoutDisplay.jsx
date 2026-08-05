import { useState, useEffect, useCallback } from 'react';
import { LayoutGrid, Users, GraduationCap, Layers } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import { safeSessionStorage } from '../../utils/safeStorage';
import { useDigitalJoin } from '../../hooks/useJoin';
import { DIGITAL_JOINS } from '../../crestron/joins';
import Button from '../ui/Button';
import LayoutApplyBar from '../ui/LayoutApplyBar';

import townhallLayoutImage from '../../assets/images/Townhall_Layout.webp';
import trainingLayoutImage from '../../assets/images/training_combined.webp';
// import trainingLayoutImage from '../../assets/images/Townhall.webp';
import combinedLayoutImage from '../../assets/images/layout_combined.webp';

const APPLY_DURATION = 5000;

const RoomLayoutDisplay = () => {
  const [activeLayout, setActiveLayout] = useState(() =>
    safeSessionStorage.getItem('roomLayoutMode') || 'COMBINED'
  );
  // null = idle | 'entering' = buttons fading out | 'applying' = bar visible | 'exiting' = bar fading out
  const [phase, setPhase] = useState('idle');
  const [pendingLayout, setPendingLayout] = useState(null);

  const [, , sendTownhallPulse] = useDigitalJoin(DIGITAL_JOINS.ROOM_LAYOUT_TOWNHALL);
  const [, , sendTrainingPulse] = useDigitalJoin(DIGITAL_JOINS.ROOM_LAYOUT_TRAINING);
  const [, , sendCombinedPulse] = useDigitalJoin(DIGITAL_JOINS.ROOM_LAYOUT_COMBINED);

  useEffect(() => {
    safeSessionStorage.setItem('roomLayoutMode', activeLayout);
  }, [activeLayout]);

  const LAYOUTS = {
    TOWNHALL: {
      key: 'TOWNHALL',
      name: 'Townhall',
      icon: Users,
      image: townhallLayoutImage,
      ringColor: 'ring-blue-500/30',
      sendPulse: sendTownhallPulse,
      joinNumber: DIGITAL_JOINS.ROOM_LAYOUT_TOWNHALL,
    },
    TRAINING: {
      key: 'TRAINING',
      name: 'Combined TR',
      icon: GraduationCap,
      image: trainingLayoutImage,
      ringColor: 'ring-yellow-500/30',
      sendPulse: sendTrainingPulse,
      joinNumber: DIGITAL_JOINS.ROOM_LAYOUT_TRAINING,
    },
    COMBINED: {
      key: 'COMBINED',
      name: 'BR+TR',
      icon: Layers,
      image: combinedLayoutImage,
      ringColor: 'ring-green-500/30',
      sendPulse: sendCombinedPulse,
      joinNumber: DIGITAL_JOINS.ROOM_LAYOUT_COMBINED,
    },
  };

  const currentLayout = LAYOUTS[activeLayout];

  const sendPulse = (setFunc) => {
    setFunc(true);
    setTimeout(() => setFunc(false), 100);
  };

  const handleLayoutSelect = (layoutKey) => {
    if (phase !== 'idle' || layoutKey === activeLayout) return;

    const selected = LAYOUTS[layoutKey];
    setPendingLayout(layoutKey);
    setActiveLayout(layoutKey);

    // Send backend pulse immediately
    sendPulse(selected.sendPulse);

    // Phase: buttons fade out → bar appears
    setPhase('entering');
    setTimeout(() => setPhase('applying'), 250); // wait for fade-out transition
  };

  // Called by LayoutApplyBar when fill completes
  const handleApplyComplete = useCallback(() => {
    setPhase('exiting');
    setTimeout(() => {
      setPhase('idle');
      setPendingLayout(null);
    }, 300); // wait for bar fade-out
  }, []);

  const showBar = phase === 'applying' || phase === 'exiting';
  const buttonsVisible = phase === 'idle';
  const barVisible = phase === 'applying';

  return (
    <Card variant="glass" className="flex flex-col h-full overflow-hidden">
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className="flex items-center justify-center space-x-2 text-heading">
          <LayoutGrid className="w-5 h-5 md:w-5 md:h-6 touchPanel:w-7 touchPanel:h-7" />
          <span className="text-base md:text-lg touchPanel:text-xl">Room Layout</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-3 touchPanel:gap-4 px-2 py-2 touchPanel:px-3 touchPanel:py-6 overflow-hidden min-h-0">
        
        {/* Image Display */}
        <div className={`flex-[65] relative w-full rounded-lg overflow-hidden shadow-lg ring-2 ${currentLayout.ringColor} transition-all duration-300`}>
          <img
            src={currentLayout.image}
            alt={`${currentLayout.name} Layout`}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Button / Bar container — fixed height, crossfade between the two */}
        <div className="flex-[35] relative">

          {/* Buttons layer */}
          <div
            className={[
              'absolute inset-0 grid grid-cols-3 gap-2 touchPanel:gap-3',
              'transition-all duration-250 ease-in-out',
              buttonsVisible
                ? 'opacity-100 scale-100 pointer-events-auto'
                : 'opacity-0 scale-95 pointer-events-none',
            ].join(' ')}
          >
            {Object.values(LAYOUTS).map((layout) => {
              const IconComponent = layout.icon;
              const isActive = activeLayout === layout.key;

              return (
                <Button
                  key={layout.key}
                  variant={isActive ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleLayoutSelect(layout.key)}
                  className="flex flex-col items-center justify-center space-y-1 h-full py-2 touchPanel:py-3"
                >
                  <IconComponent className="w-4 h-4 touchPanel:w-5 touchPanel:h-5" />
                  <span className="text-xs touchPanel:text-sm font-medium leading-tight text-center">
                    {layout.name}
                  </span>
                </Button>
              );
            })}
          </div>

          {/* Apply Bar layer */}
          <div
            className={[
              'absolute inset-0',
              'transition-all duration-300 ease-in-out',
              barVisible
                ? 'opacity-100 scale-100 pointer-events-none'
                : 'opacity-0 scale-95 pointer-events-none',
            ].join(' ')}
          >
            {(showBar || phase === 'entering') && pendingLayout && (
              <LayoutApplyBar
                icon={LAYOUTS[pendingLayout].icon}
                label={LAYOUTS[pendingLayout].name}
                duration={APPLY_DURATION}
                onComplete={handleApplyComplete}
              />
            )}
          </div>

        </div>
      </CardContent>
    </Card>
  );
};

export default RoomLayoutDisplay;