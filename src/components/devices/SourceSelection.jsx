import { useState, useEffect } from "react";
import { Laptop, Video } from "lucide-react";
import { useSerialJoin, useDigitalJoin } from "../../hooks/useJoin";
import { SERIAL_JOINS, DIGITAL_JOINS } from "../../crestron/joins";
import { safeSessionStorage } from "../../utils/safeStorage";
import Button from "../ui/Button";

const sendPulse = (setFn) => {
  if (typeof setFn !== "function") return;
  setFn(true);
  setTimeout(() => setFn(false), 100);
};

// Matrix numbering follows AVMatrixPage (all 1-based on the wire):
//   inputs  : 1 Laptop, 2 Air Media, 3 Codec Primary, 4 Codec Secondary
//   displays: 1-4 = Side Display 1-4 (1,2 = left row, 3,4 = right row)
//   layouts : 1 Full, 2 Dual — zones 1 = left/full, 2 = right
const LAPTOP = 1;
const CODEC_PRI = 3;
const CODEC_SEC = 4;

const MODES = [
  {
    key: "presentation",
    name: "Presentation",
    icon: Laptop,
    // Laptop on every side display, full-window laptop on video wall + 75"
    displays: [LAPTOP, LAPTOP, LAPTOP, LAPTOP],
    layoutKey: "full",
    layoutNum: 1,
    zones: { "full-main": LAPTOP },
  },
  {
    key: "vc",
    name: "VC Call",
    icon: Video,
    // Displays 1 & 3 primary, 2 & 4 secondary; dual window left = primary, right = secondary
    displays: [CODEC_PRI, CODEC_SEC, CODEC_PRI, CODEC_SEC],
    layoutKey: "dual",
    layoutNum: 2,
    zones: { "dual-left": CODEC_PRI, "dual-right": CODEC_SEC },
  },
];

const PRESENTATION_MODE = MODES[0];

// Mirror a mode into the AV Matrix sessionStorage (0-based input indexes there)
// so the Live Layout page shows what the mode routed.
const writeAVMatrixStorage = (mode) => {
  const routingMap = {};
  mode.displays.forEach((input, idx) => { routingMap[idx] = input - 1; });
  const zoneMap = {};
  Object.entries(mode.zones).forEach(([zone, input]) => { zoneMap[zone] = input - 1; });

  safeSessionStorage.setItem("avmatrix_routing_map", JSON.stringify(routingMap));
  safeSessionStorage.setItem("avmatrix_layout", mode.layoutKey);
  safeSessionStorage.setItem("avmatrix_layout_routing", JSON.stringify(zoneMap));
  safeSessionStorage.setItem("avmatrix_back_layout", mode.layoutKey);
  safeSessionStorage.setItem("avmatrix_back_layout_routing", JSON.stringify(zoneMap));
};

// Which mode (if any) the current AV Matrix routing matches
const detectMode = () => {
  try {
    const saved = safeSessionStorage.getItem("avmatrix_routing_map");
    if (saved === null) return null;
    const routingMap = JSON.parse(saved);
    const match = MODES.find((mode) =>
      mode.displays.every((input, idx) => routingMap[idx] === input - 1)
    );
    return match ? match.key : "custom";
  } catch (error) {
    console.error("❌ Failed to sync with AV Matrix routing:", error);
    return "custom";
  }
};

const SourceSelection = () => {
  const [activeKey, setActiveKey] = useState(() => detectMode());

  const [, sendRoutingCommand] = useSerialJoin(SERIAL_JOINS.AVMATRIX_ROUTING);
  const [, sendLayoutRoutingCommand] = useSerialJoin(SERIAL_JOINS.AVMATRIX_LAYOUT_ROUTING);
  const [, sendBackLayoutRoutingCommand] = useSerialJoin(SERIAL_JOINS.AVMATRIX_BACK_LAYOUT_ROUTING);

  const [, , sendPresentationPulse] = useDigitalJoin(DIGITAL_JOINS.SOURCE_MODE_PRESENTATION);
  const [, , sendVcPulse] = useDigitalJoin(DIGITAL_JOINS.SOURCE_MODE_VC);
  const [, , sendWallFull] = useDigitalJoin(DIGITAL_JOINS.PRES_LAYOUT_FULL);
  const [, , sendWallDual] = useDigitalJoin(DIGITAL_JOINS.PRES_LAYOUT_DUAL);
  const [, , sendBackFull] = useDigitalJoin(DIGITAL_JOINS.BACK_LAYOUT_FULL);
  const [, , sendBackDual] = useDigitalJoin(DIGITAL_JOINS.BACK_LAYOUT_DUAL);

  const modePulses = {
    presentation: [sendPresentationPulse, sendWallFull, sendBackFull],
    vc: [sendVcPulse, sendWallDual, sendBackDual],
  };

  // Startup: no routing yet → show Presentation (UI only; backend sets the room up)
  useEffect(() => {
    if (activeKey !== null) return;
    writeAVMatrixStorage(PRESENTATION_MODE);
    setActiveKey(PRESENTATION_MODE.key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const routeMode = (mode) => {
    setActiveKey(mode.key);
    modePulses[mode.key].forEach(sendPulse);

    // Serial routes, staggered 150ms apart
    const commands = [
      ...mode.displays.map((input, idx) => [sendRoutingCommand, `${input}:${idx + 1}`]),
      ...Object.values(mode.zones).flatMap((input, zoneIdx) => [
        [sendLayoutRoutingCommand, `${input}:${mode.layoutNum}:${zoneIdx + 1}`],
        [sendBackLayoutRoutingCommand, `${input}:${mode.layoutNum}:${zoneIdx + 1}`],
      ]),
    ];
    commands.forEach(([send, command], index) => {
      setTimeout(() => {
        console.log(`📤 ${mode.name} route: ${command}`);
        send(command);
      }, index * 150);
    });

    writeAVMatrixStorage(mode);
  };

  return (
    <div className="w-full h-full">
      <div className="grid grid-rows-2 gap-3 md:gap-4 touchPanel:gap-5 h-full">
        {MODES.map((mode) => {
          const IconComponent = mode.icon;
          const isActive = activeKey === mode.key;

          return (
            <Button
              key={mode.key}
              variant={isActive ? "primary" : "secondary"}
              size="md"
              onClick={() => routeMode(mode)}
              className="flex items-center justify-center gap-3 touchPanel:gap-4 h-full min-h-[64px] touchPanel:min-h-[80px]"
            >
              <IconComponent className="w-5 h-5 md:w-6 md:h-6 touchPanel:w-7 touchPanel:h-7" />
              <span className="text-sm md:text-base touchPanel:text-lg font-semibold">
                {mode.name}
              </span>
            </Button>
          );
        })}
      </div>

      {activeKey === "custom" && (
        <p
          className="mt-2 text-center text-xs md:text-sm touchPanel:text-base font-semibold"
          style={{ color: "var(--color-text-light)" }}
        >
          Custom routing active (set on AV Matrix)
        </p>
      )}
    </div>
  );
};

export default SourceSelection;
