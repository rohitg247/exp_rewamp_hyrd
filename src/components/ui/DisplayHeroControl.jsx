import { Play, Power } from 'lucide-react';
import Button from './Button';

const HERO_CONFIG = {
  on: {
    iconColor: 'var(--color-success)',
    glowBg: 'color-mix(in srgb, var(--color-success) 14%, transparent)',
    glowShadow: '0 0 32px color-mix(in srgb, var(--color-success) 22%, transparent)',
  },
  off: {
    iconColor: 'var(--color-danger-500)',
    glowBg: 'color-mix(in srgb, var(--color-danger-500) 14%, transparent)',
    glowShadow: '0 0 32px color-mix(in srgb, var(--color-danger-500) 18%, transparent)',
  },
  idle: {
    iconColor: 'var(--color-text-light)',
    glowBg: 'color-mix(in srgb, var(--color-text-light) 10%, transparent)',
    glowShadow: 'none',
  },
};

const DisplayHeroControl = ({
  powerState,
  onPowerOn,
  onPowerOff,
  IconOn,
  IconOff,
  labelOn = 'Display On',
  labelOff = 'Display Off',
}) => {
  const cfg = HERO_CONFIG[powerState ?? 'idle'];
  const HeroIcon = powerState === 'off' ? IconOff : IconOn;

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* State-driven hero icon with breathing glow */}
      <div className="flex justify-center py-1">
        <div
          key={powerState}
          className="p-7 rounded-full transition-all duration-500 content-hero-breath"
          style={{ backgroundColor: cfg.glowBg, boxShadow: cfg.glowShadow }}
        >
          <HeroIcon className="w-20 h-20 transition-all duration-500" style={{ color: cfg.iconColor }} />
        </div>
      </div>

      {/* ON button */}
      <Button
        variant={powerState === 'on' ? 'success' : 'secondary'}
        size="md"
        onClick={onPowerOn}
        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold"
      >
        <Play className="w-5 h-5" />
        <span>On</span>
      </Button>

      {/* OFF button */}
      <Button
        variant={powerState === 'off' ? 'danger' : 'secondary'}
        size="md"
        onClick={onPowerOff}
        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold"
      >
        <Power className="w-5 h-5" />
        <span>Off</span>
      </Button>

      {/* Status indicator */}
      <div className="w-full">
        <div className="text-xs text-center mb-1.5" style={{ color: 'var(--color-text-light)' }}>
          {powerState === 'on' ? labelOn : powerState === 'off' ? labelOff : 'No Status'}
        </div>
        <div className="flex justify-center w-full">
          <div className="w-1/2 rounded-full h-1.5" style={{ backgroundColor: 'var(--color-border)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: powerState ? '100%' : '0%',
                backgroundColor:
                  powerState === 'on'
                    ? 'var(--color-success)'
                    : powerState === 'off'
                      ? 'var(--color-danger-500)'
                      : 'var(--color-text-light)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplayHeroControl;
