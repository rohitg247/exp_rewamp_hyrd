// src/components/devices/AirconControl.jsx
//
// 2026-08-07 revamp — full-column height, elevated buttons, circle-only toggle.
//
// TSW-1070 RULES:
//   - Zero color-mix()
//   - Zero backdrop-filter reliance
//   - All colours are hex / rgba / var()
//   - press-fx for tactile button feedback
//   - ResizeObserver for adaptive circle sizing

import { useState, useRef, useEffect } from "react";
import { CloudSnow, Fan } from "lucide-react";
import { useAnalogJoin } from "../../hooks/useJoin";
import { ANALOG_JOINS } from "../../crestron/joins";
import { safeSessionStorage } from "../../utils/safeStorage";


// ── 5-stop temperature color interpolation ──────────────────────────────────
const TEMP_STOPS = [
  { temp: 16, r: 56, g: 189, b: 248 },  // #38bdf8 cyan-blue
  { temp: 20, r: 52, g: 211, b: 153 },  // #34d399 green
  { temp: 24, r: 251, g: 191, b: 36 },  // #fbbf24 yellow
  { temp: 27, r: 249, g: 115, b: 22 },  // #f97316 orange
  { temp: 30, r: 239, g: 68, b: 68 },   // #ef4444 red
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

  const storedTemp = safeSessionStorage.getItem("acTemperature");
  const [temperature, setTemperature] = useAnalogJoin(
    ANALOG_JOINS.AIRCON_TEMP,
    storedTemp !== null ? parseInt(storedTemp, 10) : 21
  );

  const handleTempChange = (newTemp) => {
    const clampedTemp = Math.max(16, Math.min(30, newTemp));
    console.log(
      `🌡️ Combined Room AC: Setting temperature to ${clampedTemp}°C`
    );
    setTemperature(clampedTemp);
    safeSessionStorage.setItem("acTemperature", String(clampedTemp));
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

  // ── Circle sizing — generous with full column height ──────────
  const circleSize = Math.max(120, Math.min(320, containerHeight * 0.50));
  const innerSize = circleSize * 0.75;

  // ── Arc ring helpers ──────────────────────────────────────────
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const tempRatio = (temperature - 16) / (30 - 16);
  const arcLength = acPower ? tempRatio * circumference : 0;

  const arcColor = getTempColor(temperature);
  const glowColor = getTempColor(temperature, 0.55);

  // ── TSW-1070 safe, theme-aware button styles ──────────────────
  const tempBtnBaseStyle = {
    backgroundColor: "var(--color-bg-secondary)",
    color: "var(--color-heading)",
    border: "2.5px solid var(--color-border)",
    boxShadow:
      "0 4px 14px rgba(0, 0, 0, 0.10), 0 2px 4px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.7)",
    transition:
      "background-color 150ms ease, box-shadow 150ms ease, border-color 150ms ease",
  };

  const handleBtnEnter = (e) => {
    e.currentTarget.style.backgroundColor = "var(--color-primary-light)";
    e.currentTarget.style.borderColor = "var(--color-primary)";
    e.currentTarget.style.boxShadow =
      "0 6px 18px rgba(0, 0, 0, 0.14), 0 2px 6px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)";
  };

  const handleBtnLeave = (e) => {
    e.currentTarget.style.backgroundColor = "var(--color-bg-secondary)";
    e.currentTarget.style.borderColor = "var(--color-border)";
    e.currentTarget.style.boxShadow = tempBtnBaseStyle.boxShadow;
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col items-center relative overflow-visible"
    >
      {/* ── Thermostat Circle — ONLY click target for power toggle ── */}
      <div
        className="flex-1 min-h-0 flex items-center justify-center"
        style={{ overflow: "visible" }}
      >
        <div
          onClick={handleACToggle}
          className={`relative flex items-center justify-center cursor-pointer select-none ${
            acPower ? "ac-glow-pulse" : ""
          }`}
          style={{
            width: `${circleSize}px`,
            height: `${circleSize}px`,
            overflow: "visible",
            transform: acPower ? "scale(1)" : "scale(0.92)",
            borderRadius: "50%",
            "--ac-glow-color": glowColor,
            animation: "ac-circle-enter 0.6s ease forwards",
            transition:
              "transform 0.5s ease, width 0.3s ease, height 0.3s ease",
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
                transition:
                  "stroke-dasharray 0.45s ease, stroke 0.45s ease",
              }}
            />
          </svg>

          {/* Inner Circle */}
          <div
            className="flex flex-col items-center justify-center rounded-full z-10"
            style={{
              width: `${innerSize}px`,
              height: `${innerSize}px`,
              backgroundColor: "var(--color-bg-secondary)",
              border: `2px solid ${
                acPower
                  ? getTempColor(temperature, 0.25)
                  : "var(--color-border)"
              }`,
              boxShadow: "inset 0 2px 6px rgba(0, 0, 0, 0.04)",
              transition:
                "width 0.3s ease, height 0.3s ease, border-color 0.4s ease",
            }}
          >
            {/* Status dot + label */}
            <div className="flex items-center gap-1.5 pb-1">
              <span
                className="w-2 h-2 touchPanel:w-2.5 touchPanel:h-2.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: acPower
                    ? arcColor
                    : "var(--color-text-light)",
                  boxShadow: acPower
                    ? `0 0 8px ${getTempColor(temperature, 0.4)}`
                    : "none",
                  transition:
                    "background-color 0.4s ease, box-shadow 0.4s ease",
                }}
              />
              <span
                className="font-medium text-sm touchPanel:text-base"
                style={{
                  color: acPower ? arcColor : "var(--color-text-light)",
                  transition: "color 0.4s ease",
                }}
              >
                {acPower ? "Cooling" : "Off"}
              </span>
            </div>

            {/* Temperature value — takes arc color when ON */}
            <span
              className="font-bold leading-none text-5xl touchPanel:text-6xl"
              style={{
                color: acPower ? arcColor : "var(--color-text)",
                transition: "color 0.4s ease",
              }}
            >
              {temperature}
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

      {/* ── Temperature Controls — prominent elevated buttons ── */}
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
          className="press-fx w-16 h-16 touchPanel:w-[4.5rem] touchPanel:h-[4.5rem] flex items-center justify-center rounded-full font-bold text-3xl touchPanel:text-4xl disabled:opacity-40 disabled:cursor-not-allowed select-none"
          style={tempBtnBaseStyle}
          onMouseEnter={handleBtnEnter}
          onMouseLeave={handleBtnLeave}
        >
          −
        </button>

        <button
          onClick={increaseTemp}
          disabled={temperature >= 30}
          className="press-fx w-16 h-16 touchPanel:w-[4.5rem] touchPanel:h-[4.5rem] flex items-center justify-center rounded-full font-bold text-3xl touchPanel:text-4xl disabled:opacity-40 disabled:cursor-not-allowed select-none"
          style={tempBtnBaseStyle}
          onMouseEnter={handleBtnEnter}
          onMouseLeave={handleBtnLeave}
        >
          +
        </button>
      </div>

      {/* ── Bottom Icon Row — room to breathe in full-height column ── */}
      <div className="flex justify-between items-center w-full px-8 touchPanel:px-12 flex-shrink-0 mt-6 touchPanel:mt-8 pb-2 touchPanel:pb-4">
        <div className="relative">
          <CloudSnow
            size={28}
            className={`touchPanel:w-8 touchPanel:h-8 ${
              acPower ? "ac-icon-glow" : ""
            }`}
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
          className={`touchPanel:w-8 touchPanel:h-8 ${
            acPower ? "animate-spin-slow" : ""
          }`}
          style={{
            color: acPower ? arcColor : "var(--color-text-light)",
          }}
        />
      </div>
    </div>
  );
};

export default AirconControl;