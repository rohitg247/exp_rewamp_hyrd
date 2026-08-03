import { useState, useRef, useEffect } from "react";
import { CloudSnow, Fan } from "lucide-react";
import { useAnalogJoin } from "../../hooks/useJoin";
import { ANALOG_JOINS } from "../../crestron/joins";
import { safeSessionStorage } from '../../utils/safeStorage';


// ── 5-stop temperature color interpolation ──────────────────────────────────
const TEMP_STOPS = [
  { temp: 16, r: 56,  g: 189, b: 248 }, // #38bdf8 cyan-blue
  { temp: 20, r: 52,  g: 211, b: 153 }, // #34d399 green
  { temp: 24, r: 251, g: 191, b: 36  }, // #fbbf24 yellow
  { temp: 27, r: 249, g: 115, b: 22  }, // #f97316 orange
  { temp: 30, r: 239, g: 68,  b: 68  }, // #ef4444 red
];

const getTempColor = (temp, alpha = 1) => {
  const t = Math.max(16, Math.min(30, temp));
  let lo = TEMP_STOPS[0], hi = TEMP_STOPS[TEMP_STOPS.length - 1];
  for (let i = 0; i < TEMP_STOPS.length - 1; i++) {
    if (t >= TEMP_STOPS[i].temp && t <= TEMP_STOPS[i + 1].temp) {
      lo = TEMP_STOPS[i]; hi = TEMP_STOPS[i + 1]; break;
    }
  }
  const ratio = lo.temp === hi.temp ? 0 : (t - lo.temp) / (hi.temp - lo.temp);
  const r = Math.round(lo.r + (hi.r - lo.r) * ratio);
  const g = Math.round(lo.g + (hi.g - lo.g) * ratio);
  const b = Math.round(lo.b + (hi.b - lo.b) * ratio);
  return alpha < 1 ? `rgba(${r},${g},${b},${alpha})` : `rgb(${r},${g},${b})`;
};


// const AirconControl = () => {
//   const [acPower, setAcPowerUI] = useState(() => {
//     const stored = safeSessionStorage.getItem('acPower');
//     return stored !== null ? stored === 'true' : true;
//   });

const AirconControl = () => {
  const [acPower, setAcPowerUI] = useState(() => {
    if (!safeSessionStorage.getItem('acPower')) {
      safeSessionStorage.setItem('acPower', 'true');
    }
    return true; // Default ON
  });
  
  // Analog join for AC power (persistent state: 1=on, 0=off)
  const [, setACPowerAnalog] = useAnalogJoin(ANALOG_JOINS.AC_ON_OFF_ANALOG, acPower ? 1 : 0);

  // Sync AC power state from storage (backend writes via AcStatusListener on join 340)
  useEffect(() => {
    const interval = setInterval(() => {
      const stored = safeSessionStorage.getItem('acPower');
      if (stored !== null) {
        setAcPowerUI(stored === 'true');
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const handleACToggle = () => {
    const newState = !acPower;
    setAcPowerUI(newState);
    safeSessionStorage.setItem('acPower', String(newState));
    setACPowerAnalog(newState ? 1 : 0);
    console.log(`📤 AC Power Analog: ${newState ? 'ON (1)' : 'OFF (0)'} (Join: ${ANALOG_JOINS.AC_ON_OFF_ANALOG})`);
  };


  const storedTemp = safeSessionStorage.getItem('acTemperature');
  const [temperature, setTemperature] = useAnalogJoin(ANALOG_JOINS.AIRCON_TEMP, storedTemp !== null ? parseInt(storedTemp, 10) : 21);


  const handleTempChange = (newTemp) => {
    const clampedTemp = Math.max(16, Math.min(30, newTemp));
    console.log(`🌡️ Combined Room AC: Setting temperature to ${clampedTemp}°C`);
    setTemperature(clampedTemp);
    safeSessionStorage.setItem('acTemperature', String(clampedTemp));
  };


  const increaseTemp = (e) => { e?.stopPropagation(); handleTempChange(temperature + 1); };
  const decreaseTemp = (e) => { e?.stopPropagation(); handleTempChange(temperature - 1); };


  // ── ResizeObserver for height-aware circle sizing ─────────────
  const containerRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState(0);


  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let rafId;
    const ro = new ResizeObserver((entries) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        for (const entry of entries) setContainerHeight(entry.contentRect.height);
      });
    });
    ro.observe(el);
    return () => { ro.disconnect(); cancelAnimationFrame(rafId); };
  }, []);


  // ── Circle sizing ─────────────────────────────────────────────
  const circleSize = Math.max(100, Math.min(260, containerHeight * 0.88));
  const innerSize = circleSize * 0.75;


  // ── Arc ring helpers ──────────────────────────────────────────
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const tempRatio = (temperature - 16) / (30 - 16);
  const arcLength = acPower ? tempRatio * circumference : 0;

  const arcColor = getTempColor(temperature);
  const glowColor = getTempColor(temperature, 0.55);


  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col items-center cursor-pointer relative py-4 touchPanel:py-6 overflow-visible"
      // className="w-full h-full flex flex-col items-center cursor-pointer relative py-4 touchPanel:py-6"
      onClick={handleACToggle}
    >
      {/* ── Thermostat Circle with SVG Arc Ring ── */}
      <div className="flex-1 min-h-0 flex items-center justify-center" style={{ overflow: 'visible' }}>
        <div
          className={`relative flex items-center justify-center ${acPower ? 'ac-glow-pulse' : ''}`}
          style={{
            width: `${circleSize}px`,
            height: `${circleSize}px`,
            overflow: 'visible',
            transform: acPower ? 'scale(1)' : 'scale(0.92)',
            borderRadius: '50%',
            '--ac-glow-color': glowColor,
            animation: 'ac-circle-enter 0.6s ease forwards',
            transition: 'transform 0.5s ease, width 0.3s ease, height 0.3s ease',
          }}
        >
          {/* SVG Arc Ring */}
          <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60" cy="60" r={radius}
              stroke="var(--color-border)"
              strokeWidth="7"
              fill="none"
            />
            <circle
              cx="60" cy="60" r={radius}
              stroke={arcColor}
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${arcLength} ${circumference}`}
              style={{ transition: 'stroke-dasharray 0.45s ease, stroke 0.45s ease' }}
            />
          </svg>


          {/* Inner Circle */}
          <div
            className="flex flex-col items-center justify-center rounded-full z-10"
            style={{
              width: `${innerSize}px`,
              height: `${innerSize}px`,
              transition: 'width 0.3s ease, height 0.3s ease',
              backgroundColor: 'var(--color-bg-secondary)',
            }}
          >
            <span
              className="font-light text-xs touchPanel:text-base pb-1"
              style={{ color: acPower ? arcColor : 'var(--color-text-light)', transition: 'color 0.4s ease' }}
            >
              {acPower ? 'Cooling' : 'Off'}
            </span>
            <span
              className="font-bold leading-none text-5xl"
              style={{ color: 'var(--color-text)' }}
            >
              {temperature}
            </span>
            <span
              className="text-xs touchPanel:text-base pt-1"
              style={{ color: 'var(--color-text-light)' }}
            >
              °C
            </span>
          </div>
        </div>
      </div>


      {/* ── Temperature Controls — hidden when off, no layout shift ── */}
      <div
        className="flex items-center justify-center space-x-8 touchPanel:space-x-24 mt-4"
        style={{
          opacity: acPower ? 1 : 0,
          pointerEvents: acPower ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
          transform: 'translateY(24px)',
          // marginTop: '24px'
        }}
      >
        <button
          onClick={decreaseTemp}
          disabled={temperature <= 16}
          className="min-w-[52px] min-h-[52px] touchPanel:w-14 touchPanel:h-14 flex items-center justify-center rounded-full font-semibold text-xl touchPanel:text-2xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed backdrop-blur-sm"
          style={{
            backgroundColor: 'var(--color-bg-glass-light)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border-glass)',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-glass-hover)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-glass-light)'}
        >
          −
        </button>
        {/* <span
          className="text-base touchPanel:text-xl font-medium min-w-[64px] text-center"
          style={{ color: 'var(--color-text)' }}
        >
          {temperature}°C
        </span> */}
        <button
          onClick={increaseTemp}
          disabled={temperature >= 30}
          className="min-w-[52px] min-h-[52px] touchPanel:w-14 touchPanel:h-14 flex items-center justify-center rounded-full font-semibold text-xl touchPanel:text-2xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed backdrop-blur-sm"
          style={{
            backgroundColor: 'var(--color-bg-glass-light)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border-glass)',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-glass-hover)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-glass-light)'}
        >
          +
        </button>
      </div>


      {/* ── Bottom Icon Row ── */}
      <div className="flex justify-between items-center w-full px-6 touchPanel:px-10 flex-shrink-0 mt-auto"
        style={{
          transform: 'translateY(24px)', // ✅ shift icons down, increase px as needed
        }}
      >
        <div className="relative">
          <CloudSnow
            size={24}
            className={`touchPanel:w-7 touchPanel:h-7 ${acPower ? 'ac-icon-glow' : ''}`}
            style={{
              color: acPower ? arcColor : 'var(--color-text-light)',
              transition: 'color 0.4s ease',
              '--ac-icon-color': acPower ? arcColor : 'transparent',
            }}
          />
          {acPower && (
            <>
              <span className="ac-snowflake ac-snowflake-1" style={{ backgroundColor: arcColor }} />
              <span className="ac-snowflake ac-snowflake-2" style={{ backgroundColor: arcColor }} />
            </>
          )}
        </div>
        <Fan
          size={24}
          className={`touchPanel:w-7 touchPanel:h-7 ${acPower ? 'animate-spin-slow' : ''}`}
          style={{ color: acPower ? arcColor : 'var(--color-text-light)' }}
        />
      </div>
    </div>
  );
};


export default AirconControl;
