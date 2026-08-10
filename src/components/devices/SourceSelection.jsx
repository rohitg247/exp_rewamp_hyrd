import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Laptop, Cast } from "lucide-react";
import { useSerialJoin } from "../../hooks/useJoin";
import { SERIAL_JOINS } from "../../crestron/joins";
import { safeSessionStorage } from "../../utils/safeStorage";
import Button from "../ui/Button";

// Two simplified modes for the main page.
// Keep outputs 1/2/3 for both for now — easy to update later.
const MODES = [
  {
    key: "presentation",
    name: "Presentation",
    icon: Laptop,
    index: 0,
    backendId: 1,
    navigateToAVMatrix: false,
  },
  {
    key: "byod",
    name: "BYOD",
    icon: Cast,
    index: 1,
    backendId: 2,
    navigateToAVMatrix: true,
  },
];

const BYOD_MODE = MODES[1];

const SourceSelection = () => {
  const navigate = useNavigate();

  // True when this mount should default to BYOD without auto-navigating.
  // Fresh startup or Combined switch keeps the old Air Media intent,
  // but the UI now exposes it as BYOD.
  const didInitBYODDefault = useRef(false);

  const [activeKey, setActiveKey] = useState(() => {
    const saved = safeSessionStorage.getItem("avmatrix_routing_map");
    const forceBYOD =
      safeSessionStorage.getItem("combinedForceAirMediaSource") === "true";

    if (forceBYOD || saved === null) {
      didInitBYODDefault.current = true;
      return "byod";
    }

    return null;
  });

  const [, sendRoutingCommand] = useSerialJoin(SERIAL_JOINS.AVMATRIX_ROUTING);

  // Sync active state with AV Matrix sessionStorage on mount.
  // Skipped when startup default-BYOD flow takes over this mount.
  useEffect(() => {
    if (didInitBYODDefault.current) return;

    try {
      const saved = safeSessionStorage.getItem("avmatrix_routing_map");
      if (!saved) return;

      const routingMap = JSON.parse(saved);
      const routedInputs = Object.values(routingMap).slice(0, 3);
      const firstInput = routedInputs[0];

      if (
        routedInputs.length > 0 &&
        routedInputs.every((input) => input === firstInput)
      ) {
        if (firstInput === 0) {
          setActiveKey("presentation");
        } else if (firstInput === 1) {
          setActiveKey("byod");
        } else {
          setActiveKey(null);
        }
      }
    } catch (error) {
      console.error("❌ Failed to sync with AV Matrix routing:", error);
    }
  }, []);

  const buildRoutingString = (input, output) => `${input}:${output}`;

  const sendSingleRouting = (input, output) => {
    const routingCommand = buildRoutingString(input, output);
    console.log(
      `📤 Sending to serial join ${SERIAL_JOINS.AVMATRIX_ROUTING}: ${routingCommand}`
    );
    sendRoutingCommand(routingCommand);
  };

  const sendMultipleRoutings = (routings) => {
    routings.forEach((routing, index) => {
      setTimeout(() => {
        sendSingleRouting(routing.input, routing.output);
      }, index * 150);
    });
  };

  const updateAVMatrixStorage = (inputIdx, outputIndices) => {
    try {
      const routingMap = {};
      outputIndices.forEach((outputIdx) => {
        routingMap[outputIdx] = inputIdx;
      });

      safeSessionStorage.setItem(
        "avmatrix_routing_map",
        JSON.stringify(routingMap)
      );
      console.log("💾 Source Selection: Updated AV Matrix routing map", routingMap);
    } catch (error) {
      console.error("❌ Failed to update AV Matrix storage:", error);
    }
  };

  const routeMode = (mode, { navigateAfterRoute = true } = {}) => {
    setActiveKey(mode.key);

    // Keep outputs 1/2/3 for now
    sendMultipleRoutings([
      { input: mode.backendId, output: 1 },
      { input: mode.backendId, output: 2 },
      { input: mode.backendId, output: 3 },
    ]);

    updateAVMatrixStorage(mode.index, [0, 1, 2]);

    console.log(
      `✅ ${mode.name} selected - Routed to Boardroom, Training, Repeater`
    );

    if (navigateAfterRoute && mode.navigateToAVMatrix) {
      setTimeout(() => navigate("/av-matrix"), 500);
    }
  };

  const handleModeTap = (mode) => {
    routeMode(mode, { navigateAfterRoute: true });
  };

  // On startup / Combined switch:
  // default to BYOD, route it, but DO NOT navigate away automatically.
  useEffect(() => {
    if (!didInitBYODDefault.current) return;

    safeSessionStorage.removeItem("combinedForceAirMediaSource");
    routeMode(BYOD_MODE, { navigateAfterRoute: false });
    console.log("🟢 Combined: BYOD default — routed to Boardroom, Training, Repeater");

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-3 md:gap-4 touchPanel:gap-5">
        {MODES.map((mode) => {
          const IconComponent = mode.icon;
          const isActive = activeKey === mode.key;

          return (
            <Button
              key={mode.key}
              variant={isActive ? "primary" : "secondary"}
              size="md"
              onClick={() => handleModeTap(mode)}
              className="flex flex-col items-center justify-center gap-2 touchPanel:gap-3 h-auto min-h-[108px] touchPanel:min-h-[136px] py-4 md:py-5 touchPanel:py-6"
            >
              <IconComponent className="w-5 h-5 md:w-6 md:h-6 touchPanel:w-7 touchPanel:h-7" />
              <span className="text-sm md:text-base touchPanel:text-lg font-semibold">
                {mode.name}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default SourceSelection;