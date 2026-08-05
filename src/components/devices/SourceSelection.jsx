import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Laptop, Cast, Video } from "lucide-react";
import { useSerialJoin, useDigitalJoin } from "../../hooks/useJoin";
import { SERIAL_JOINS, DIGITAL_JOINS } from "../../crestron/joins";
import { safeSessionStorage } from "../../utils/safeStorage";
import Button from "../ui/Button";

// Real inputs for this room, matching AVMatrixPage.jsx's INPUT_SOURCES order
// (Laptop, Air Media, Codec 1, Codec 2). Both pages drive the same physical
// matrix, so the 0-based index here MUST match AVMatrixPage's array index,
// and the 1-based backend routing ID is that index + 1.
const SOURCES = [
  { key: "laptop", name: "Laptop", icon: Laptop, index: 0, backendId: 1, navigateToAVMatrix: false },
  { key: "airMedia", name: "Air Media", icon: Cast, index: 1, backendId: 2, navigateToAVMatrix: false },
  { key: "codec1", name: "Codec 1", icon: Video, index: 2, backendId: 3, navigateToAVMatrix: true },
  { key: "codec2", name: "Codec 2", icon: Video, index: 3, backendId: 4, navigateToAVMatrix: true },
];

const sendPulse = (setFn) => {
  setFn(true);
  setTimeout(() => setFn(false), 100);
};

const SourceSelection = () => {
  const navigate = useNavigate();

  // Tracks whether this mount should default to Air Media + route the backend.
  // True on a fresh startup (no stored routing) or when the room just switched to Combined.
  const didInitAirMediaDefault = useRef(false);

  // Local active state for UI toggle — seeded so a fresh startup / Combined switch defaults to Air Media
  const [activeKey, setActiveKey] = useState(() => {
    const saved = safeSessionStorage.getItem('avmatrix_routing_map');
    const forceAirMedia = safeSessionStorage.getItem('combinedForceAirMediaSource') === 'true';

    // Fresh startup (nothing stored) or a Boardroom→Combined switch → default to Air Media
    if (forceAirMedia || saved === null) {
      didInitAirMediaDefault.current = true;
      return 'airMedia';
    }
    return null;
  });

  // Serial join hook for routing commands (same as AV Matrix)
  const [, sendRoutingCommand] = useSerialJoin(SERIAL_JOINS.AVMATRIX_ROUTING);
  // Digital pulse so the backend has an explicit "source deselected / blank" signal,
  // distinct from the serial "0:output" routing string sent alongside it.
  const [, , sendBlankPulse] = useDigitalJoin(DIGITAL_JOINS.SOURCE_SELECTION_BLANK);

  // Sync active state with AV Matrix sessionStorage on mount.
  // Skipped when the Air Media default is taking over this mount (handled by the effect below).
  useEffect(() => {
    if (didInitAirMediaDefault.current) return;
    try {
      const saved = safeSessionStorage.getItem('avmatrix_routing_map');
      if (!saved) return;

      const routingMap = JSON.parse(saved);

      // Check which source is routed to first 3 outputs
      const routedInputs = Object.values(routingMap).slice(0, 3);
      const firstInput = routedInputs[0];

      // If all 3 outputs have same input, set it as active
      if (routedInputs.every(input => input === firstInput)) {
        const matched = SOURCES.find((s) => s.index === firstInput);
        setActiveKey(matched ? matched.key : null);
      }
    } catch (error) {
      console.error('❌ Failed to sync with AV Matrix routing:', error);
    }
  }, []);

  // Build routing string in "input:output" format e.g. "1:2"
  const buildRoutingString = (input, output) => `${input}:${output}`;

  // Send routing command for single input → output pair
  const sendSingleRouting = (input, output) => {
    const routingCommand = buildRoutingString(input, output);
    console.log(`📤 Sending to serial join ${SERIAL_JOINS.AVMATRIX_ROUTING}: ${routingCommand}`);
    sendRoutingCommand(routingCommand);
  };

  // Send multiple routing commands with delay
  const sendMultipleRoutings = (routings) => {
    routings.forEach((routing, index) => {
      setTimeout(() => {
        sendSingleRouting(routing.input, routing.output);
      }, index * 150); // 150ms delay between each send
    });
  };

  // Update AV Matrix sessionStorage
  const updateAVMatrixStorage = (inputIdx, outputIndices) => {
    try {
      const routingMap = {};
      outputIndices.forEach(outputIdx => {
        routingMap[outputIdx] = inputIdx;
      });

      safeSessionStorage.setItem('avmatrix_routing_map', JSON.stringify(routingMap));
      console.log('💾 Source Selection: Updated AV Matrix routing map', routingMap);
    } catch (error) {
      console.error('❌ Failed to update AV Matrix storage:', error);
    }
  };

  // Clear AV Matrix sessionStorage
  const clearAVMatrixStorage = () => {
    try {
      safeSessionStorage.setItem('avmatrix_routing_map', JSON.stringify({}));
      console.log('🗑️ Source Selection: Cleared AV Matrix routing map');
    } catch (error) {
      console.error('❌ Failed to clear AV Matrix storage:', error);
    }
  };

  // Route a source to outputs 1/2/3 (Boardroom, Training, Repeater displays)
  const routeSource = (source) => {
    setActiveKey(source.key);

    sendMultipleRoutings([
      { input: source.backendId, output: 1 },
      { input: source.backendId, output: 2 },
      { input: source.backendId, output: 3 },
    ]);
    updateAVMatrixStorage(source.index, [0, 1, 2]);

    console.log(`✅ ${source.name} selected - Routed to Boardroom, Training, Repeater`);

    if (source.navigateToAVMatrix) {
      setTimeout(() => navigate('/av-matrix'), 500); // Wait for routing commands to send
    }
  };

  // Deselect the active source: blank outputs 1/2/3 + explicit digital pulse
  const deselectActive = () => {
    setActiveKey(null);

    sendMultipleRoutings([
      { input: 0, output: 1 },
      { input: 0, output: 2 },
      { input: 0, output: 3 },
    ]);
    clearAVMatrixStorage();
    sendPulse(sendBlankPulse);

    console.log('⬜ Source deselected - outputs blanked');
  };

  const handleSourceTap = (source) => {
    if (activeKey === source.key) {
      deselectActive();
    } else {
      routeSource(source);
    }
  };

  // On startup / Combined switch: Air Media is the default source —
  // consume the one-shot flag and route it to outputs 1/2/3 (state already seeded in the initializer)
  useEffect(() => {
    if (!didInitAirMediaDefault.current) return;
    safeSessionStorage.removeItem('combinedForceAirMediaSource');
    routeSource(SOURCES[1]); // Air Media
    console.log('🟢 Combined: Air Media default — routed to Boardroom, Training, Repeater');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3 md:space-y-4 touchPanel:space-y-5 w-full touchPanel:overflow-hidden">
      {/* Source Buttons */}
      <div className="grid grid-cols-2 gap-2 md:gap-3 touchPanel:gap-4">
        {SOURCES.map((source) => {
          const IconComponent = source.icon;
          return (
            <Button
              key={source.key}
              variant={activeKey === source.key ? "primary" : "secondary"}
              size="sm"
              onClick={() => handleSourceTap(source)}
              className="flex flex-col items-center space-y-1 md:space-y-2 touchPanel:space-y-2 h-auto py-3 md:py-4 touchPanel:py-5"
            >
              <IconComponent className="w-4 h-4 md:w-5 md:h-5 touchPanel:w-6 touchPanel:h-6" />
              <span className="text-xs md:text-sm touchPanel:text-base font-medium">{source.name}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default SourceSelection;
