// src/components/devices/AirconControl.jsx
//
// 2026-08-07 revamp — full-column AC control.
//
// Changes:
//   - Power toggle ONLY on the thermostat circle (not whole widget)
//   - Larger + / − buttons with proper elevation
//   - Theme-aware press feedback using existing CSS variables
//   - TSW-1070 safe: no color-mix(), no backdrop-filter reliance
//   - Added subtle inner-circle depth shadow

import { useState, useRef, useEffect } from "react";
import { CloudSnow, Fan } from "lucide-react";
import { useAnalogJoin } from "../../hooks/useJoin";
import { ANALOG_JOINS } from "../../crestron/joins";
import { safeSessionStorage } from "../../utils/safeStorage";


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
  let lo = TEMP_STOPS[0],
    hi = TEMP_STOPS[TEMP_STOPS.length - 1];
  for (let i = 0; i < TEMP_STOPS.length - 1; i++) {
    if (t >= TEMP_STOPS[i].temp && t <= TEMP_STOPS[i + 1].temp) {
      lo = TEMP_STOPS[i];
      hi = TEMP_STOPS[i + 1];
      break;
    }
  }
  const ratio =
    lo.temp === hi.temp ? 0 : (t - lo.temp) / (hi.temp - lo.temp);
  const r = Math.round(lo.r + (hi.r - lo.r) * ratio);
  const g = Math.round(lo.g + (hi.g - lo.g) * ratio);
  const b = Math.round(lo.b + (hi.b - lo.b) * ratio);
  return alpha < 1
    ? `rgba(${r},${g},${b},${alpha})`
    : `rgb(${r},${g},${b})`;
};


const AirconControl = () => {
  const [acPower, setAcPowerUI] = useState(() => {
    if (!safeSessionStorage.getItem("acPower")) {
      safeSessionStorage.setItem("acPower", "true");
    }
    return true;
  });

  const [, setACPowerAnalog] = useAnalogJoin(
    ANALOG_JOINS.AC_ON_OFF_ANALOG,
    acPower ? 1 : 0
  );

  // Sync AC power state from storage
  useEffect(() => {
    const interval = setInterval(() => {
      const stored = safeSessionStorage.getItem("acPower");
      if (stored !== null) {
        setAcPowerUI(stored === "true");
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const handleACToggle = () => {
    const newState = !acPower;
    setAcPowerUI(newState);
    safeSessionStorage.setItem("acPower", String(newState));
    setACPowerAnalog(newState ? 1 : 0);
    console.log(
      `📤 AC Power Analog: ${newState ? "ON (1)" : "OFF (0)"} (Join: ${ANALOG_JOINS.AC_ON_OFF_ANALOG})`
    );
  };

  // 🔴 2026-08-10 — the thermostat used to render 0°C instead of 21.
  //
  // The 21 below is only the useState seed inside useAnalogJoin. On mount the
  // hook subscribes to the join and CrComLib fires that callback immediately
  // with the join's CURRENT value — 0 when the processor has not published a
  // setpoint yet — which overwrote the 21 before it was ever seen.
  //
  // Contract now: the panel is the source of truth at startup, a genuine
  // backend value overrides it, and whichever wins is persisted. Only the
  // unset reading is filtered out, identifiable because it falls outside the
  // valid 16-30 setpoint band.
  const storedTemp = safeSessionStorage.getItem("acTemperature");
  const lastValidTempRef = useRef(
    storedTemp !== null ? parseInt(storedTemp, 10) : 21
  );

  const [temperature, setTemperature] = useAnalogJoin(
    ANALOG_JOINS.AIRCON_TEMP,
    lastValidTempRef.current,
    null, // sendTransform — unchanged
    (v) => {
      if (v >= 16 && v <= 30) {
        lastValidTempRef.current = v; // genuine backend setpoint — it wins
        return v;
      }
      return lastValidTempRef.current; // unset/invalid join reading — ignore it
    }
  );

  // Single write path: persists whichever source won — the +/− buttons below
  // OR a push from the processor. Backend-driven changes were never persisted
  // before, so they were lost on navigation.
  useEffect(() => {
    if (temperature >= 16 && temperature <= 30) {
      safeSessionStorage.setItem("acTemperature", String(temperature));
    }
  }, [temperature]);

  // Publish the default once, so the processor agrees with the panel rather
  // than the panel silently adopting an unset join. Mirrors how acPower is
  // primed above.
  const primedRef = useRef(false);
  useEffect(() => {
    if (primedRef.current) return;
    if (safeSessionStorage.getItem("acTemperature") === null) {
      primedRef.current = true;
      setTemperature(21); // publishes to the join + sets state; effect above persists it
    }
  }, [setTemperature]);

  const handleTempChange = (newTemp) => {
    const clampedTemp = Math.max(16, Math.min(30, newTemp));
    console.log(
      `🌡️ Combined Room AC: Setting temperature to ${clampedTemp}°C`
    );
    setTemperature(clampedTemp);
    // Persisted by the effect above — deliberately not written here too.
  };

  const increaseTemp = (e) => {
    e?.stopPropagation();
    handleTempChange(temperature + 1);
  };
  const decreaseTemp = (e) => {
    e?.stopPropagation();
    handleTempChange(temperature - 1);
  };

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
        for (const entry of entries)
          setContainerHeight(entry.contentRect.height);
      });
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, []);

  // ── Circle sizing — proportional to full column height ────────
  const circleSize = Math.max(120, Math.min(340, containerHeight * 0.55));
  const innerSize = circleSize * 0.75;

  // ── Arc ring helpers ──────────────────────────────────────────
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const tempRatio = (temperature - 16) / (30 - 16);
  const arcLength = acPower ? tempRatio * circumference : 0;

  const arcColor = getTempColor(temperature);
  const glowColor = getTempColor(temperature, 0.55);

  // ── Button style definitions (theme-aware, TSW-1070 safe) ─────
  const tempBtnDefaultStyle = {
    backgroundColor: "var(--color-bg-secondary)",
    color: "var(--color-text)",
    border: "2px solid var(--color-border)",
    boxShadow:
      "0 4px 12px rgba(0, 0, 0, 0.10), 0 1px 3px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.7)",
    transition:
      "background-color 150ms ease, box-shadow 150ms ease, border-color 150ms ease",
  };

  const tempBtnHoverStyle = {
    // See --control-active-bg in global.css: was --color-bg, the saturated page
    // backdrop, which a touch tap left the button sitting in. Dark mode value
    // is unchanged.
    backgroundColor: "var(--control-active-bg)",
    borderColor: "var(--color-primary)",
    boxShadow:
      "0 6px 16px rgba(0, 0, 0, 0.14), 0 2px 4px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
  };

  // Pressed state — blends with theme via primary tint + border
  const tempBtnPressedStyle = {
    backgroundColor: "var(--color-primary-50)",
    borderColor: "var(--color-primary)",
    boxShadow:
      "inset 0 2px 6px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.06)",
  };

  const handleBtnEnter = (e) => {
    Object.assign(e.currentTarget.style, tempBtnHoverStyle);
  };
  const handleBtnLeave = (e) => {
    Object.assign(e.currentTarget.style, tempBtnDefaultStyle);
  };
  const handleBtnDown = (e) => {
    Object.assign(e.currentTarget.style, tempBtnPressedStyle);
  };
  const handleBtnUp = (e) => {
    Object.assign(e.currentTarget.style, tempBtnHoverStyle);
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col items-center relative overflow-visible"
    >
      {/* ── Thermostat Circle with SVG Arc Ring ──
           Clicking ONLY this circle toggles power */}
      <div
        className="flex-1 min-h-0 flex items-center justify-center w-full"
        style={{ overflow: "visible" }}
      >
        <div
          onClick={handleACToggle}
          className={`relative flex items-center justify-center ${acPower ? "ac-glow-pulse" : ""}`}
          style={{
            width: `${circleSize}px`,
            height: `${circleSize}px`,
            overflow: "visible",
            transform: acPower ? "scale(1)" : "scale(0.92)",
            borderRadius: "50%",
            "--ac-glow-color": glowColor,
            animation: "ac-circle-enter 0.6s ease forwards",
            transition: "transform 0.5s ease, width 0.3s ease, height 0.3s ease",
            cursor: "pointer",
            touchAction: "manipulation",
          }}
        >
          {/* SVG Arc Ring */}
          <svg
            className="absolute w-full h-full -rotate-90"
            viewBox="0 0 120 120"
          >
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="var(--color-border)"
              strokeWidth="7"
              fill="none"
            />
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke={arcColor}
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${arcLength} ${circumference}`}
              style={{
                transition: "stroke-dasharray 0.45s ease, stroke 0.45s ease",
              }}
            />
          </svg>

          {/* Inner Circle — now with depth shadow */}
          <div
            className="flex flex-col items-center justify-center rounded-full z-10"
            style={{
              width: `${innerSize}px`,
              height: `${innerSize}px`,
              transition: "width 0.3s ease, height 0.3s ease",
              backgroundColor: "var(--color-bg-secondary)",
              boxShadow:
                "0 8px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
            }}
          >
            <span
              className="font-light text-sm touchPanel:text-base pb-1"
              style={{
                color: acPower ? arcColor : "var(--color-text-light)",
                transition: "color 0.4s ease",
              }}
            >
              {acPower ? "Cooling" : "Off"}
            </span>
            <span
              className="font-bold leading-none text-6xl touchPanel:text-7xl"
              style={{ color: "var(--color-text)" }}
            >
              {acPower ? temperature : "--"}
            </span>
            <span
              className="text-sm touchPanel:text-base pt-1"
              style={{ color: "var(--color-text-light)" }}
            >
              °C
            </span>
          </div>
        </div>
      </div>

      {/* ── Temperature Controls ── */}
      <div
        className="flex items-center justify-center gap-12 touchPanel:gap-20 flex-shrink-0"
        style={{
          opacity: acPower ? 1 : 0,
          pointerEvents: acPower ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      >
        <button
          onClick={decreaseTemp}
          disabled={temperature <= 16}
          className="press-fx w-16 h-16 touchPanel:w-20 touchPanel:h-20 flex items-center justify-center rounded-full font-bold text-3xl touchPanel:text-4xl disabled:opacity-40 disabled:cursor-not-allowed select-none"
          style={tempBtnDefaultStyle}
          onMouseEnter={handleBtnEnter}
          onMouseLeave={handleBtnLeave}
          onMouseDown={handleBtnDown}
          onMouseUp={handleBtnUp}
        >
          −
        </button>

        <button
          onClick={increaseTemp}
          disabled={temperature >= 30}
          className="press-fx w-16 h-16 touchPanel:w-20 touchPanel:h-20 flex items-center justify-center rounded-full font-bold text-3xl touchPanel:text-4xl disabled:opacity-40 disabled:cursor-not-allowed select-none"
          style={tempBtnDefaultStyle}
          onMouseEnter={handleBtnEnter}
          onMouseLeave={handleBtnLeave}
          onMouseDown={handleBtnDown}
          onMouseUp={handleBtnUp}
        >
          +
        </button>
      </div>

      {/* ── Bottom Icon Row ── */}
      <div className="flex justify-between items-center w-full px-8 touchPanel:px-12 flex-shrink-0 mt-6 touchPanel:mt-8 pb-2 touchPanel:pb-4">
        <div className="relative">
          <CloudSnow
            size={28}
            className={`touchPanel:w-8 touchPanel:h-8 ${acPower ? "ac-icon-glow" : ""}`}
            style={{
              color: acPower ? arcColor : "var(--color-text-light)",
              transition: "color 0.4s ease",
              "--ac-icon-color": acPower ? arcColor : "transparent",
            }}
          />
          {acPower && (
            <>
              <span
                className="ac-snowflake ac-snowflake-1"
                style={{ backgroundColor: arcColor }}
              />
              <span
                className="ac-snowflake ac-snowflake-2"
                style={{ backgroundColor: arcColor }}
              />
            </>
          )}
        </div>
        <Fan
          size={28}
          className={`touchPanel:w-8 touchPanel:h-8 ${acPower ? "animate-spin-slow" : ""}`}
          style={{ color: acPower ? arcColor : "var(--color-text-light)" }}
        />
      </div>
    </div>
  );
};

export default AirconControl;