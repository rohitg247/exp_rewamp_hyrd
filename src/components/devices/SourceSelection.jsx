import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Wifi, Lectern, Video, Minus } from "lucide-react";
import { useSerialJoin } from "../../hooks/useJoin";
import { SERIAL_JOINS } from "../../crestron/joins";
import { safeSessionStorage } from "../../utils/safeStorage";
import Button from "../ui/Button";

const SourceSelection = () => {
  const navigate = useNavigate();

  // Tracks whether this mount should default to Air Media + route the backend.
  // True on a fresh startup (no stored routing) or when the room just switched to Combined.
  const didInitAirMediaDefault = useRef(false);

  // Local active state for UI toggle — seeded so a fresh startup / Combined switch defaults to Air Media
  const [activeSources, setActiveSources] = useState(() => {
    const saved = safeSessionStorage.getItem('avmatrix_routing_map');
    const forceAirMedia = safeSessionStorage.getItem('combinedForceAirMediaSource') === 'true';

    // Fresh startup (nothing stored) or a Boardroom→Combined switch → default to Air Media
    if (forceAirMedia || saved === null) {
      didInitAirMediaDefault.current = true;
      return { airMedia: true, lectern: false, codec: false, blank: false };
    }
    return { airMedia: false, lectern: false, codec: false, blank: false };
  });

  // Serial join hook for routing commands (same as AV Matrix)
  const [, sendRoutingCommand] = useSerialJoin(SERIAL_JOINS.AVMATRIX_ROUTING);

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
        setActiveSources({
          airMedia: firstInput === 0,
          lectern: firstInput === 1,
          codec: firstInput === 2,
          blank: false,
        });
      }
    } catch (error) {
      console.error('❌ Failed to sync with AV Matrix routing:', error);
    }
  }, []);

  // Build routing string in "input:output" format e.g. "1:2"
  const buildRoutingString = (input, output) => {
    return `${input}:${output}`;
  };

  // On startup / Combined switch: Air Media is the default source —
  // consume the one-shot flag and route it to outputs 1/2/3 (state already seeded in the initializer)
  useEffect(() => {
    if (!didInitAirMediaDefault.current) return;
    safeSessionStorage.removeItem('combinedForceAirMediaSource');

    const inputBackend = 1; // Air Media backend ID
    const routings = [
      { input: inputBackend, output: 1 }, // Boardroom Display
      { input: inputBackend, output: 2 }, // Training Display
      { input: inputBackend, output: 3 }, // Repeater
    ];
    sendMultipleRoutings(routings);
    updateAVMatrixStorage(0, [0, 1, 2]); // Frontend uses 0-based for storage

    console.log('🟢 Combined: Air Media default — routed to Boardroom, Training, Repeater');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Handle Air Media selection (Input 1 → Outputs 1, 2, 3)
  const handleAirMedia = () => {
    // Don't toggle off if already active
    if (activeSources.airMedia) {
      console.log('ℹ️ Air Media already active - no change');
      return;
    }

    // Select Air Media and route to first 3 outputs
    setActiveSources({ airMedia: true, lectern: false, codec: false, blank: false });

    const inputBackend = 1; // Air Media backend ID
    const routings = [
      { input: inputBackend, output: 1 }, // Boardroom Display
      { input: inputBackend, output: 2 }, // Training Display
      { input: inputBackend, output: 3 }, // Repeater
    ];

    sendMultipleRoutings(routings);
    updateAVMatrixStorage(0, [0, 1, 2]); // Frontend uses 0-based for storage

    console.log('✅ Air Media selected - Routed to Boardroom, Training, Repeater');
  };

  // Handle Lectern selection (Input 2 → Outputs 1, 2, 3)
  const handleLectern = () => {
    // Don't toggle off if already active
    if (activeSources.lectern) {
      console.log('ℹ️ Lectern already active - no change');
      return;
    }

    // Select Lectern and route to first 3 outputs
    setActiveSources({ airMedia: false, lectern: true, codec: false, blank: false });

    const inputBackend = 2; // Lectern backend ID
    const routings = [
      { input: inputBackend, output: 1 }, // Boardroom Display
      { input: inputBackend, output: 2 }, // Training Display
      { input: inputBackend, output: 3 }, // Repeater
    ];

    sendMultipleRoutings(routings);
    updateAVMatrixStorage(1, [0, 1, 2]); // Frontend uses 0-based for storage

    console.log('✅ Lectern selected - Routed to Boardroom, Training, Repeater');
  };

  // Handle Codec selection (Input 3 → Outputs 1, 2, 3 + Navigate to AV Matrix)
  const handleCodec = () => {
    // Don't toggle off if already active
    if (activeSources.codec) {
      console.log('ℹ️ Codec already active - navigating to AV Matrix');
      navigate('/av-matrix');
      return;
    }

    // Select Codec and route to first 3 outputs
    setActiveSources({ airMedia: false, lectern: false, codec: true, blank: false });

    const inputBackend = 3; // Codec backend ID
    const routings = [
      { input: inputBackend, output: 1 }, // Boardroom Display
      { input: inputBackend, output: 2 }, // Training Display
      { input: inputBackend, output: 3 }, // Repeater
    ];

    sendMultipleRoutings(routings);
    updateAVMatrixStorage(2, [0, 1, 2]); // Frontend uses 0-based for storage

    console.log('✅ Codec selected - Routed to Boardroom, Training, Repeater');
    console.log('🚀 Navigating to AV Matrix page...');

    // Navigate to AV Matrix page after routing
    setTimeout(() => {
      navigate('/av-matrix');
    }, 500); // Wait for all routing commands to send
  };

  // Handle Blank selection (Clear all outputs: 0 → 1, 2, 3, 4)
  const handleBlank = () => {
    setActiveSources({ airMedia: false, lectern: false, codec: false, blank: true });

    const inputBackend = 0; // Blank/Clear backend ID
    const routings = [
      { input: inputBackend, output: 1 }, // Clear Boardroom
      { input: inputBackend, output: 2 }, // Clear Training
      { input: inputBackend, output: 3 }, // Clear Repeater
      { input: inputBackend, output: 4 }, // Clear Codec output
    ];

    sendMultipleRoutings(routings);
    clearAVMatrixStorage();

    console.log('⬜ Blank selected - All outputs cleared');

    // Auto-deselect blank after 500ms
    setTimeout(() => {
      setActiveSources({ airMedia: false, lectern: false, codec: false, blank: false });
    }, 800);
  };

  const allSources = [
    {
      name: "Air Media",
      key: "airMedia",
      icon: Wifi,
      active: activeSources.airMedia,
      handler: handleAirMedia,
      description: "Wireless presentation to all displays",
    },
    {
      name: "Lectern",
      key: "lectern",
      icon: Lectern,
      active: activeSources.lectern,
      handler: handleLectern,
      description: "HDMI to all displays",
    },
    {
      name: "Codec",
      key: "codec",
      icon: Video,
      active: activeSources.codec,
      handler: handleCodec,
      description: "Video conference to all displays",
    },
    {
      name: "Blank",
      key: "blank",
      icon: Minus,
      active: activeSources.blank,
      handler: handleBlank,
      description: "Clear all display outputs",
    },
  ];


  return (
    <div className="space-y-3 md:space-y-4 touchPanel:space-y-5 w-full touchPanel:overflow-hidden">
    {/* <div className="space-y-3 md:space-y-4 touchPanel:space-y-5 w-full"> */}
      {/* Source Buttons */}
      <div className="grid grid-cols-2 gap-2 md:gap-3 touchPanel:gap-4">
        {allSources.map((source) => {
          const IconComponent = source.icon;
          return (
            <Button
              key={source.name}
              variant={source.active ? "primary" : "secondary"}
              size="sm"
              onClick={source.handler}
              className="flex flex-col items-center space-y-1 md:space-y-2 touchPanel:space-y-2 h-auto py-3 md:py-4 touchPanel:py-5"
            >
              <IconComponent className="w-4 h-4 md:w-5 md:h-5 touchPanel:w-6 touchPanel:h-6" />
              <span className="text-xs md:text-sm touchPanel:text-base font-medium">{source.name}</span>
            </Button>
          );
        })}
      </div>

      {/* Active Source Display */}
      {/* {activeSource && activeSource.key !== 'blank' ? (
        // <div className="bg-primary-50 border border-primary-200 rounded-lg p-2 md:p-3 touchPanel:p-4">
        //   <div className="flex items-center space-x-2 mb-1">
        //     <div className="status-indicator online"></div>
        //     <span className="font-semibold text-primary text-xs md:text-sm touchPanel:text-base">Active Source</span>
        //   </div>
        //   <div className="flex items-center space-x-2">
        //     <activeSource.icon className="w-4 h-4 md:w-5 md:h-5 touchPanel:w-6 touchPanel:h-6 text-primary" />
        //     <div>
        //       <div className="font-medium text-primary text-xs md:text-sm touchPanel:text-base">
        //         {activeSource.name}
        //       </div>
        //       <div className="text-xs md:text-xs touchPanel:text-sm text-primary-700">
        //         {activeSource.description}
        //       </div>
        //     </div>
        //   </div>
        // </div>
        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg p-2 md:p-3 touchPanel:p-4">
          <div className="flex items-center space-x-2 mb-1">
            <div className="status-indicator online"></div>
            <span className="font-semibold text-heading text-xs md:text-sm touchPanel:text-base">Active Source</span>
          </div>
          <div className="flex items-center space-x-2">
            <activeSource.icon className="w-4 h-4 md:w-5 md:h-5 touchPanel:w-6 touchPanel:h-6 text-heading" />
            <div>
              <div className="font-medium text-heading text-xs md:text-sm touchPanel:text-base">
                {activeSource.name}
              </div>
              <div className="text-xs md:text-xs touchPanel:text-sm text-[var(--color-text-light)]">
                {activeSource.description}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 md:p-3 touchPanel:p-4 text-center">
          <div className="status-indicator offline mx-auto mb-2"></div>
          <div className="text-xs md:text-sm touchPanel:text-base text-gray-500">No source selected</div>
        </div>
      )} */}
    </div>
  );
};

export default SourceSelection;
