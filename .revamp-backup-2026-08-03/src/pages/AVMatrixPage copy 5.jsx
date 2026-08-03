import { useState, useEffect, useMemo, useCallback } from "react";
import {
  DndContext,
  useDroppable,
  useDraggable,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  pointerWithin,
} from "@dnd-kit/core";
import { restrictToWindowEdges, snapCenterToCursor } from "@dnd-kit/modifiers";
import { LayoutGrid, Monitor, Cast, Laptop, Video, ArrowRight, X, Check } from 'lucide-react';
import { useDigitalJoin, useSerialJoin } from '../hooks/useJoin';
import { DIGITAL_JOINS, SERIAL_JOINS } from '../crestron/joins';
import { safeSessionStorage } from '../utils/safeStorage';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';


const sendPulse = (setFn) => {
  if (typeof setFn !== 'function') return;
  setFn(true);
  setTimeout(() => setFn(false), 100);
};


// --- Configuration Data - 4 Inputs x 5 Displays ---
const INPUT_SOURCES = [
  { label: "Laptop", icon: Laptop },
  { label: "Air Media", icon: Cast },
  { label: "Codec 1", icon: Video },
  { label: "Codec 2", icon: Video },
];


const DISPLAY_TARGETS = [
  '55" Side Display 1',
  '55" Side Display 2',
  '55" Side Display 3',
  '55" Side Display 4',
  '75" Back Display',
];


/* ⚠️ ADD THIS JOIN TO src/crestron/joins.js:
      PRES_LAYOUT_QUAD: <your digital join number>,
   Until then the fallback below keeps useDigitalJoin() from receiving undefined. */
const QUAD_JOIN = DIGITAL_JOINS.PRES_LAYOUT_QUAD ?? DIGITAL_JOINS.PRES_LAYOUT_3_LEFT;


/* ============================================================================
   SERIAL PROTOCOL — only two serial joins are used on this page.

   1) SERIAL_JOINS.AVMATRIX_ROUTING          →  "input:display"
        route  :  "2:4"    = Input 2  ->  Display 4
        clear  :  "0:4"    = clear Display 4

   2) SERIAL_JOINS.AVMATRIX_LAYOUT_ROUTING   →  "input:layout:zone"
        route  :  "2:3:1"  = Input 2  ->  Layout 3 (Quad), Zone 1
        clear  :  "0:3:1"  = clear Layout 3, Zone 1

   All indexes are 1-based. Layout numbers are the `num` field below.
   ============================================================================ */


// --- Combine Layouts (video wall zone presets) ---
const LAYOUTS = [
  {
    key: 'full',
    num: 1,
    label: 'Full Window',
    subtitle: 'Single source',
    digitalJoin: DIGITAL_JOINS.PRES_LAYOUT_FULL,
    zones: [{ id: 'full-main', label: 'Full Window', className: 'absolute inset-0' }],
    preview: 'full',
  },
  {
    key: 'dual',
    num: 2,
    label: 'Dual Window',
    subtitle: 'Side by side',
    digitalJoin: DIGITAL_JOINS.PRES_LAYOUT_DUAL,
    zones: [
      { id: 'dual-left', label: 'Left Window', className: 'absolute left-0 top-0 bottom-0 w-1/2 pr-1' },
      { id: 'dual-right', label: 'Right Window', className: 'absolute right-0 top-0 bottom-0 w-1/2 pl-1' },
    ],
    preview: 'dual',
  },
  {
    key: 'quad',
    num: 3,
    label: 'Quad Window',
    subtitle: '2 x 2 grid',
    digitalJoin: QUAD_JOIN,
    zones: [
      { id: 'quad-top-left', label: 'Top Left', className: 'absolute left-0 top-0 w-1/2 h-1/2 pr-1 pb-1' },
      { id: 'quad-top-right', label: 'Top Right', className: 'absolute right-0 top-0 w-1/2 h-1/2 pl-1 pb-1' },
      { id: 'quad-bottom-left', label: 'Bottom Left', className: 'absolute left-0 bottom-0 w-1/2 h-1/2 pr-1 pt-1' },
      { id: 'quad-bottom-right', label: 'Bottom Right', className: 'absolute right-0 bottom-0 w-1/2 h-1/2 pl-1 pt-1' },
    ],
    preview: 'quad',
  },
  {
    key: 'three-right',
    num: 4,
    label: '3 Window',
    subtitle: 'Main + side stack',
    digitalJoin: DIGITAL_JOINS.PRES_LAYOUT_3_RIGHT,
    zones: [
      { id: 'three-right-main', label: 'Main Left', className: 'absolute left-0 top-0 bottom-0 w-[72%] pr-1' },
      { id: 'three-right-top', label: 'Top Right', narrow: true, className: 'absolute right-0 top-0 h-1/2 w-[28%] pb-1' },
      { id: 'three-right-bottom', label: 'Bottom Right', narrow: true, className: 'absolute right-0 bottom-0 h-1/2 w-[28%] pt-1' },
    ],
    preview: 'three-right',
  },
];

const LAYOUT_KEYS = LAYOUTS.map((layout) => layout.key);
const DEFAULT_LAYOUT_KEY = 'full';


// --- Mini layout preview swatch (used inside the Layouts panel buttons) ---
const LayoutMiniPreview = ({ layout, active }) => {
  const tone = active ? 'var(--color-primary)' : 'var(--color-border)';
  const fill = active
    ? 'color-mix(in srgb, var(--color-primary) 32%, var(--color-bg-secondary))'
    : 'var(--color-bg)';
  const cellStyle = { backgroundColor: fill, border: `1.5px solid ${tone}`, borderRadius: 4 };

  const Frame = ({ children }) => (
    <div
      className="h-full max-h-full w-auto max-w-full aspect-video rounded-xl p-1.5 mx-auto transition-all duration-200"
      style={{
        backgroundColor: active
          ? 'color-mix(in srgb, var(--color-primary) 14%, var(--color-bg-secondary))'
          : 'var(--color-bg-secondary)',
        border: `2px solid ${tone}`,
      }}
    >
      <div className="w-full h-full relative">{children}</div>
    </div>
  );

  if (layout.preview === 'full') {
    return <Frame><div className="absolute inset-0" style={cellStyle} /></Frame>;
  }
  if (layout.preview === 'dual') {
    return (
      <Frame>
        <div className="absolute left-0 top-0 bottom-0 w-1/2 pr-0.5"><div className="w-full h-full" style={cellStyle} /></div>
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pl-0.5"><div className="w-full h-full" style={cellStyle} /></div>
      </Frame>
    );
  }
  if (layout.preview === 'quad') {
    return (
      <Frame>
        <div className="absolute left-0 top-0 w-1/2 h-1/2 pr-0.5 pb-0.5"><div className="w-full h-full" style={cellStyle} /></div>
        <div className="absolute right-0 top-0 w-1/2 h-1/2 pl-0.5 pb-0.5"><div className="w-full h-full" style={cellStyle} /></div>
        <div className="absolute left-0 bottom-0 w-1/2 h-1/2 pr-0.5 pt-0.5"><div className="w-full h-full" style={cellStyle} /></div>
        <div className="absolute right-0 bottom-0 w-1/2 h-1/2 pl-0.5 pt-0.5"><div className="w-full h-full" style={cellStyle} /></div>
      </Frame>
    );
  }
  if (layout.preview === 'three-right') {
    return (
      <Frame>
        <div className="absolute left-0 top-0 bottom-0 w-[72%] pr-0.5"><div className="w-full h-full" style={cellStyle} /></div>
        <div className="absolute right-0 top-0 h-1/2 w-[28%] pb-0.5"><div className="w-full h-full" style={cellStyle} /></div>
        <div className="absolute right-0 bottom-0 h-1/2 w-[28%] pt-0.5"><div className="w-full h-full" style={cellStyle} /></div>
      </Frame>
    );
  }
  return <Frame><div className="w-full h-full" style={cellStyle} /></Frame>;
};


// --- Draggable Item Component (Input Source) — horizontal / compact ---
function DraggableInputCard({ id, label, icon: Icon, isPinned, isDragging, onPinClick }) {
  const { attributes, listeners, setNodeRef, isDragging: isActiveDrag } = useDraggable({ id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => !isActiveDrag && onPinClick(id)}
      className="h-full min-h-0 flex flex-col items-center justify-center gap-1 touchPanel:gap-1.5 rounded-2xl border-2 px-2 py-2 touchPanel:px-3 touchPanel:py-3 select-none transition-all duration-200"
      style={{
        background: isPinned
          ? 'linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))'
          : 'linear-gradient(180deg, var(--color-bg-secondary), color-mix(in srgb, var(--color-bg) 55%, white))',
        borderColor: isPinned ? 'transparent' : 'var(--color-border)',
        color: isPinned ? '#ffffff' : 'var(--color-heading)',
        opacity: isDragging ? 0.3 : 1,
        boxShadow: isPinned
          ? '0 8px 22px color-mix(in srgb, var(--color-primary) 28%, transparent)'
          : '0 6px 18px color-mix(in srgb, var(--color-shadow) 10%, transparent)',
        cursor: isActiveDrag ? 'grabbing' : 'grab',
        touchAction: 'none',
      }}
      title="Click to select (Pin) for multicast routing, or drag onto a display / zone"
    >
      <div
        className="rounded-xl p-1.5 touchPanel:p-2 flex-shrink-0"
        style={{
          backgroundColor: isPinned
            ? 'rgba(255,255,255,0.14)'
            : 'color-mix(in srgb, var(--color-primary) 8%, var(--color-bg))',
          border: `1px solid ${isPinned ? 'rgba(255,255,255,0.18)' : 'color-mix(in srgb, var(--color-primary) 10%, var(--color-border))'}`,
        }}
      >
        <Icon className="w-4 h-4 touchPanel:w-5 touchPanel:h-5 flex-shrink-0" />
      </div>

      <span className="text-xs touchPanel:text-base font-semibold leading-tight truncate max-w-full text-center">
        {label}
      </span>

      {/* <div
        className="text-[9px] touchPanel:text-[11px] px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap"
        style={{
          backgroundColor: isPinned
            ? 'rgba(255,255,255,0.16)'
            : 'color-mix(in srgb, var(--color-primary) 7%, var(--color-bg))',
          color: isPinned ? '#ffffff' : 'var(--color-text-light)',
          border: `1px solid ${isPinned ? 'rgba(255,255,255,0.18)' : 'transparent'}`,
        }}
      >
        {isPinned ? 'Selected' : 'Tap or drag'}
      </div> */}
    </div>
  );
}


// --- Droppable Display Assignment Card (direct crosspoint routing) ---
function DisplayAssignmentCard({ id, label, routedInputIdx, isPinActive, onClickRoute, onClearRoute }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const routedInput = routedInputIdx !== undefined ? INPUT_SOURCES[routedInputIdx] : null;

  return (
    <div
      ref={setNodeRef}
      onClick={onClickRoute}
      className="rounded-2xl border-2 p-3 touchPanel:p-4 flex flex-col gap-2.5 touchPanel:gap-3 transition-all duration-200 select-none h-full min-h-[104px] touchPanel:min-h-[132px]"
      style={{
        background: isOver
          ? 'linear-gradient(180deg, color-mix(in srgb, var(--color-primary) 10%, var(--color-bg-secondary)), var(--color-bg-secondary))'
          : 'linear-gradient(180deg, var(--color-bg-secondary), color-mix(in srgb, var(--color-bg) 55%, white))',
        borderColor: isOver ? 'var(--color-primary)' : 'var(--color-border)',
        cursor: isPinActive ? 'pointer' : 'default',
        boxShadow: isOver
          ? '0 0 0 2px color-mix(in srgb, var(--color-primary) 22%, transparent), 0 10px 24px color-mix(in srgb, var(--color-primary) 10%, transparent)'
          : '0 6px 18px color-mix(in srgb, var(--color-shadow) 8%, transparent)',
      }}
      title={isPinActive ? 'Click to toggle route for pinned source.' : 'Drag a source here.'}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-sm touchPanel:text-lg leading-tight" style={{ color: 'var(--color-heading)' }}>
          {label}
        </span>
        <span
          className="text-[10px] touchPanel:text-xs px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0"
          style={{
            backgroundColor: isOver ? 'color-mix(in srgb, var(--color-primary) 14%, white)' : 'var(--color-bg)',
            color: isOver ? 'var(--color-primary)' : 'var(--color-text-light)',
            border: `1px solid ${isOver ? 'color-mix(in srgb, var(--color-primary) 18%, transparent)' : 'var(--color-border)'}`,
          }}
        >
          {isOver ? 'Drop here' : isPinActive ? 'Tap to route' : 'Ready'}
        </span>
      </div>

      {routedInput ? (
        <div
          className="flex items-center gap-2 px-3 py-2.5 touchPanel:py-3 rounded-xl"
          style={{ background: 'linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))', color: '#ffffff' }}
        >
          <ArrowRight className="w-4 h-4 touchPanel:w-5 touchPanel:h-5 flex-shrink-0 opacity-90" />
          <span className="text-xs touchPanel:text-base font-semibold flex-1 truncate">{routedInput.label}</span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClearRoute(); }}
            className="flex-shrink-0 rounded-full p-0.5 touchPanel:p-1 hover:bg-white/20 transition-colors"
            aria-label={`Clear route for ${label}`}
          >
            <X className="w-4 h-4 touchPanel:w-5 touchPanel:h-5" />
          </button>
        </div>
      ) : (
        <div
          className="text-xs touchPanel:text-sm px-3 py-2 touchPanel:py-2.5 rounded-xl"
          style={{ color: 'var(--color-text-light)', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
        >
          No source assigned
        </div>
      )}
    </div>
  );
}


// --- Droppable Combine-Layout Zone (video wall window) ---
// NOTE: `id` is the dnd-kit droppable id (prefixed "zone-…"), while `zoneKey` is
// the RAW zone id. State lookups and serial commands must use `zoneKey`, never `id`.
function DroppableLayoutZone({ id, zoneKey, label, narrow = false, routedInputIdx, onZoneClickRoute, onClearZone, isPinActive }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const routedInput = routedInputIdx !== undefined ? INPUT_SOURCES[routedInputIdx] : null;

  return (
    <div
      ref={setNodeRef}
      onClick={() => onZoneClickRoute(zoneKey)}
      className={`rounded-2xl border-2 p-3 flex flex-col justify-between transition-all duration-200 select-none h-full ${
        isPinActive ? 'cursor-pointer' : 'cursor-default'
      }`}
      style={{
        background: isOver
          ? 'linear-gradient(180deg, color-mix(in srgb, var(--color-primary) 10%, var(--color-bg-secondary)), var(--color-bg-secondary))'
          : 'linear-gradient(180deg, var(--color-bg-secondary), color-mix(in srgb, var(--color-bg) 55%, white))',
        borderColor: isOver ? 'var(--color-primary)' : 'var(--color-border)',
        boxShadow: isOver
          ? '0 0 0 2px color-mix(in srgb, var(--color-primary) 22%, transparent), 0 10px 24px color-mix(in srgb, var(--color-primary) 10%, transparent)'
          : '0 6px 18px color-mix(in srgb, var(--color-shadow) 8%, transparent)',
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-xs touchPanel:text-sm" style={{ color: 'var(--color-heading)' }}>{label}</span>
        <span
          className="text-[10px] touchPanel:text-[11px] px-2 py-1 rounded-full"
          style={{
            backgroundColor: isOver ? 'color-mix(in srgb, var(--color-primary) 14%, white)' : 'var(--color-bg)',
            color: isOver ? 'var(--color-primary)' : 'var(--color-text-light)',
            border: `1px solid ${isOver ? 'color-mix(in srgb, var(--color-primary) 18%, transparent)' : 'var(--color-border)'}`,
          }}
        >
          {isOver ? 'Drop here' : isPinActive ? 'Tap to route' : 'Ready'}
        </span>
      </div>

      {/* ── Vertical text for narrow zones — DISABLED, kept for reference ──
      {routedInput && narrow ? (
        <div className="relative mt-2 flex-1 min-h-0">
          <div
            className="w-full h-full flex items-center justify-center rounded-xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))',
              color: '#ffffff',
              writingMode: 'vertical-lr',
              transform: 'rotate(180deg)',
            }}
          >
            <span className="text-[10px] font-semibold truncate px-1">{routedInput.label}</span>
          </div>
        </div>
      ) : null}
      ─────────────────────────────────────────────────────────────────── */}

      {routedInput ? (
        <div
          className={`flex items-center gap-1.5 touchPanel:gap-2 rounded-xl mt-2 ${
            narrow ? 'px-2 py-2 touchPanel:py-2.5' : 'px-3 py-2.5 touchPanel:py-3'
          }`}
          style={{ background: 'linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))', color: '#ffffff' }}
        >
          {!narrow && <ArrowRight className="w-4 h-4 touchPanel:w-5 touchPanel:h-5 flex-shrink-0 opacity-90" />}
          <span className="text-sm touchPanel:text-lg font-semibold flex-1 truncate">{routedInput.label}</span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClearZone(zoneKey); }}
            className="flex-shrink-0 rounded-full p-0.5 touchPanel:p-1 hover:bg-white/20 transition-colors"
            aria-label={`Clear source for ${label}`}
          >
            <X className="w-4 h-4 touchPanel:w-5 touchPanel:h-5" />
          </button>
        </div>
      ) : (
        <div
          className="text-xs touchPanel:text-sm px-3 py-2 touchPanel:py-2.5 rounded-xl mt-2"
          style={{ color: 'var(--color-text-light)', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
        >
          No source assigned
        </div>
      )}
    </div>
  );
}


// --- Main AVMatrixPage Component ---
export default function AVMatrixPage({ sidebarEnabled = false }) {
  // Direct display crosspoint routing (Displays tab) — kept backward compatible
  // with SourceSelection.jsx, which reads/writes the same sessionStorage key.
  const [routingMap, setRoutingMap] = useState(() => {
    try {
      const saved = safeSessionStorage.getItem('avmatrix_routing_map');
      if (!saved) return {};

      const parsed = JSON.parse(saved);
      if (typeof parsed !== 'object' || Array.isArray(parsed)) {
        safeSessionStorage.removeItem('avmatrix_routing_map');
        return {};
      }

      const isValid = Object.entries(parsed).every(([key, value]) => {
        const outputIdx = parseInt(key, 10);
        return (
          !isNaN(outputIdx) &&
          outputIdx >= 0 && outputIdx < DISPLAY_TARGETS.length &&
          typeof value === 'number' &&
          value >= 0 && value < INPUT_SOURCES.length
        );
      });

      if (!isValid) {
        safeSessionStorage.removeItem('avmatrix_routing_map');
        return {};
      }
      return parsed;
    } catch (error) {
      console.error('❌ Failed to restore routing map from session storage:', error);
      safeSessionStorage.removeItem('avmatrix_routing_map');
      return {};
    }
  });

  const [selectedInputIdx, setSelectedInputIdx] = useState(() => {
    try {
      const saved = safeSessionStorage.getItem('avmatrix_selected_input');
      if (saved === null) return null;
      const parsed = parseInt(saved, 10);
      if (isNaN(parsed) || parsed < 0 || parsed >= INPUT_SOURCES.length) {
        safeSessionStorage.removeItem('avmatrix_selected_input');
        return null;
      }
      return parsed;
    } catch (error) {
      console.error('❌ Failed to restore selected input from session storage:', error);
      safeSessionStorage.removeItem('avmatrix_selected_input');
      return null;
    }
  });

  const [draggedInputIdx, setDraggedInputIdx] = useState(null);

  // Which output-panel tab is active: direct display assignment, or the combine layout
  const [activeRightTab, setActiveRightTab] = useState(() => (
    safeSessionStorage.getItem('avmatrix_right_tab') || 'displays'
  ));

  // Selected combine layout + its per-zone routing (Layout tab).
  // Guard against stale keys from the previous 6-layout build.
  const [activeLayoutKey, setActiveLayoutKey] = useState(() => {
    const saved = safeSessionStorage.getItem('avmatrix_layout');
    if (saved && LAYOUT_KEYS.includes(saved)) return saved;
    if (saved) safeSessionStorage.removeItem('avmatrix_layout');
    return DEFAULT_LAYOUT_KEY;
  });

  const [layoutRoutingMap, setLayoutRoutingMap] = useState(() => {
    try {
      const saved = safeSessionStorage.getItem('avmatrix_layout_routing');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('❌ Failed to restore layout routing map from session storage:', error);
      safeSessionStorage.removeItem('avmatrix_layout_routing');
      return {};
    }
  });

  const activeLayout = useMemo(
    () => LAYOUTS.find((layout) => layout.key === activeLayoutKey) || LAYOUTS[0],
    [activeLayoutKey]
  );

  // Serial joins: direct display routing, and combine-layout zone routing
  const [, sendRoutingCommand] = useSerialJoin(SERIAL_JOINS.AVMATRIX_ROUTING);
  const [, sendLayoutRoutingCommand] = useSerialJoin(SERIAL_JOINS.AVMATRIX_LAYOUT_ROUTING);

  // Digital pulses: one per combine layout preset
  const [, , sendFullJoin] = useDigitalJoin(DIGITAL_JOINS.PRES_LAYOUT_FULL);
  const [, , sendDualJoin] = useDigitalJoin(DIGITAL_JOINS.PRES_LAYOUT_DUAL);
  const [, , sendQuadJoin] = useDigitalJoin(QUAD_JOIN);
  const [, , send3RightJoin] = useDigitalJoin(DIGITAL_JOINS.PRES_LAYOUT_3_RIGHT);

  const layoutJoinSenders = useMemo(() => ({
    full: sendFullJoin,
    dual: sendDualJoin,
    quad: sendQuadJoin,
    'three-right': send3RightJoin,
  }), [sendFullJoin, sendDualJoin, sendQuadJoin, send3RightJoin]);

  // --- Persist state ---
  useEffect(() => {
    safeSessionStorage.setItem('avmatrix_routing_map', JSON.stringify(routingMap));
  }, [routingMap]);

  useEffect(() => {
    if (selectedInputIdx !== null) {
      safeSessionStorage.setItem('avmatrix_selected_input', selectedInputIdx.toString());
    } else {
      safeSessionStorage.removeItem('avmatrix_selected_input');
    }
  }, [selectedInputIdx]);

  useEffect(() => {
    safeSessionStorage.setItem('avmatrix_right_tab', activeRightTab);
  }, [activeRightTab]);

  useEffect(() => {
    safeSessionStorage.setItem('avmatrix_layout', activeLayoutKey);
  }, [activeLayoutKey]);

  useEffect(() => {
    safeSessionStorage.setItem('avmatrix_layout_routing', JSON.stringify(layoutRoutingMap));
  }, [layoutRoutingMap]);

  // Listen for external sessionStorage changes (e.g. SourceSelection.jsx quick-select)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'avmatrix_routing_map' && e.newValue) {
        setRoutingMap(JSON.parse(e.newValue));
      }
      if (e.key === 'avmatrix_selected_input') {
        setSelectedInputIdx(e.newValue !== null ? parseInt(e.newValue, 10) : null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // --- Direct display routing (Displays tab) — serial: "input:display" ---
  const sendRouting = (inputIdx, outputIdx) => {
    const routingCommand = `${inputIdx + 1}:${outputIdx + 1}`;
    sendRoutingCommand(routingCommand);
  };

  const sendClearRouting = (outputIdx) => {
    sendRoutingCommand(`0:${outputIdx + 1}`);
  };

  const handleDisplayClickRoute = (outputIdx) => {
    if (selectedInputIdx === null) return;
    const isCurrentlyRouted = routingMap[outputIdx] === selectedInputIdx;

    if (isCurrentlyRouted) {
      setRoutingMap((prev) => { const copy = { ...prev }; delete copy[outputIdx]; return copy; });
      sendClearRouting(outputIdx);
    } else {
      setRoutingMap((prev) => ({ ...prev, [outputIdx]: selectedInputIdx }));
      sendRouting(selectedInputIdx, outputIdx);
    }
  };

  const clearRoute = (outputIdx) => {
    setRoutingMap((prev) => { const copy = { ...prev }; delete copy[outputIdx]; return copy; });
    sendClearRouting(outputIdx);
  };

  // --- Combine layout zone routing (Layout tab) — serial: "input:layout:zone" ---
  const handleLayoutSelect = useCallback((layoutKey) => {
    setActiveLayoutKey(layoutKey);
    setLayoutRoutingMap({});
    sendPulse(layoutJoinSenders[layoutKey]);
  }, [layoutJoinSenders]);

  const sendZoneRoute = useCallback((inputIdx, zoneId) => {
    const zoneIndex = activeLayout.zones.findIndex((zone) => zone.id === zoneId);
    if (zoneIndex === -1) return;
    sendLayoutRoutingCommand(`${inputIdx + 1}:${activeLayout.num}:${zoneIndex + 1}`);
  }, [activeLayout, sendLayoutRoutingCommand]);

  const clearZoneRoute = useCallback((zoneId) => {
    setLayoutRoutingMap((prev) => { const next = { ...prev }; delete next[zoneId]; return next; });
    const zoneIndex = activeLayout.zones.findIndex((zone) => zone.id === zoneId);
    if (zoneIndex !== -1) sendLayoutRoutingCommand(`0:${activeLayout.num}:${zoneIndex + 1}`);
  }, [activeLayout, sendLayoutRoutingCommand]);

  const handleZoneClickRoute = (zoneId) => {
    if (selectedInputIdx === null) return;
    const alreadyAssigned = layoutRoutingMap[zoneId] === selectedInputIdx;
    if (alreadyAssigned) {
      clearZoneRoute(zoneId);
    } else {
      setLayoutRoutingMap((prev) => ({ ...prev, [zoneId]: selectedInputIdx }));
      sendZoneRoute(selectedInputIdx, zoneId);
    }
  };

  // --- Drag & drop (shared between Displays and Layout tabs) ---
  const sensors = useSensors(
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 10 } }),
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = (event) => {
    setSelectedInputIdx(null);
    setDraggedInputIdx(parseInt(event.active.id.toString().replace('input-', ''), 10));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setDraggedInputIdx(null);
    if (!over) return;

    const overId = over.id.toString();
    const inputIdx = parseInt(active.id.toString().replace('input-', ''), 10);

    if (overId.startsWith('display-')) {
      const outputIdx = parseInt(overId.replace('display-', ''), 10);
      setRoutingMap((prev) => ({ ...prev, [outputIdx]: inputIdx }));
      sendRouting(inputIdx, outputIdx);
      return;
    }

    if (overId.startsWith('zone-')) {
      const zoneId = overId.replace('zone-', '');
      setLayoutRoutingMap((prev) => ({ ...prev, [zoneId]: inputIdx }));
      sendZoneRoute(inputIdx, zoneId);
    }
  };

  const handleDragCancel = () => setDraggedInputIdx(null);

  const handleInputPin = (inputId) => {
    const inputIdx = parseInt(inputId.toString().replace('input-', ''), 10);
    setSelectedInputIdx((prev) => (prev === inputIdx ? null : inputIdx));
  };

  return (
    <div className="h-[calc(100vh-72px)] touchPanel:h-[calc(100vh-110px)] w-full bg-theme-bg flex">
      <div className={`flex-1 p-6 touchPanel:p-8 flex h-full items-stretch gap-6 touchPanel:gap-8 ${
        sidebarEnabled ? 'mr-36 touchPanel:mr-44' : 'mr-0'
      }`}>
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
          modifiers={[restrictToWindowEdges]}
        >
          {/* ── Column 1: Layouts ─────────────────────────────────── */}
          <div className="flex-shrink-0 flex flex-col min-h-0" style={{ width: '16%', minWidth: '190px' }}>
            <Card variant="glass" className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <CardHeader className="pb-2.5 border-b flex-shrink-0" style={{ borderColor: 'var(--color-border)' }}>
                <CardTitle className="flex items-center gap-2 text-base font-semibold" style={{ color: 'var(--color-heading)' }}>
                  <LayoutGrid className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                  <span>Layouts</span>
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 min-h-0 flex flex-col gap-3 overflow-y-auto pt-3">
                {LAYOUTS.map((layout) => {
                  const active = activeLayoutKey === layout.key;
                  return (
                    <button
                      key={layout.key}
                      type="button"
                      onClick={() => handleLayoutSelect(layout.key)}
                      className="flex-1 min-h-0 flex flex-col justify-center rounded-2xl border-2 p-2 text-left transition-all duration-200 relative whitespace-nowrap"
                      style={{
                        background: active
                          ? 'linear-gradient(160deg, color-mix(in srgb, var(--color-primary) 26%, var(--color-bg-secondary)), color-mix(in srgb, var(--color-primary) 10%, var(--color-bg-secondary)))'
                          : 'var(--color-bg)',
                        borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
                        boxShadow: active
                          ? '0 0 0 2px color-mix(in srgb, var(--color-primary) 34%, transparent), 0 14px 34px color-mix(in srgb, var(--color-primary) 30%, transparent)'
                          : '0 6px 18px color-mix(in srgb, var(--color-shadow) 8%, transparent)',
                        transform: active ? 'translateY(-3px) scale(1.015)' : 'none',
                      }}
                    >
                      {active && (
                        <span
                          className="absolute top-2 right-2 z-20 w-5 h-5 touchPanel:w-6 touchPanel:h-6 rounded-full flex items-center justify-center ring-2 ring-white shadow"
                          style={{ backgroundColor: 'var(--color-primary)' }}
                        >
                          <Check className="w-3 h-3 touchPanel:w-3.5 touchPanel:h-3.5" style={{ color: '#ffffff' }} strokeWidth={3} />
                        </span>
                      )}
                      <div className="flex-1 min-h-0 flex items-center justify-center w-full">
                        <LayoutMiniPreview layout={layout} active={active} />
                      </div>
                      <div className="mt-1.5 flex-shrink-0 text-center">
                        <p
                          className="text-xs touchPanel:text-sm font-semibold leading-tight"
                          style={{ color: active ? 'var(--color-primary)' : 'var(--color-heading)' }}
                        >
                          {layout.label}
                        </p>
                        {/* {layout.subtitle && (
                          <p className="text-[10px] leading-tight mt-0.5" style={{ color: 'var(--color-text-light)' }}>
                            {layout.subtitle}
                          </p>
                        )} */}
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* ── Column 2: Inputs (20%) stacked over Outputs (80%) ──── */}
          <div className="flex-1 min-w-0 flex flex-col gap-6 touchPanel:gap-8 h-full">

            {/* Row 1 — Input Sources (20% height) */}
            {/* padding set inline (0.75rem ≈ p-3) so it beats Card's baked-in p-6 */}
            <Card
              variant="glass"
              className="flex flex-col overflow-hidden relative will-change-transform"
              style={{ flex: '0 0 20%', minHeight: 0, padding: '0.75rem' }}
            >
              {/* <CardHeader className="py-2 px-4 touchPanel:px-6 border-b flex-shrink-0" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center justify-between gap-3 w-full">
                  <CardTitle className="flex items-center gap-2 text-sm touchPanel:text-base font-semibold" style={{ color: 'var(--color-heading)' }}>
                    <Monitor className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                    <span>Input Sources</span>
                  </CardTitle>

                  <span
                    className="text-[10px] touchPanel:text-xs px-2.5 py-1 rounded-full whitespace-nowrap"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, var(--color-bg))',
                      color: 'var(--color-heading)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    Layout · {activeLayout.label}
                  </span>
                </div>
              </CardHeader> */}

              <CardContent className="flex-1 min-h-0 ">
                <div
                  className="grid grid-cols-4 gap-3 touchPanel:gap-4 h-full min-h-0"
                  style={{ touchAction: 'pan-y' }}
                >
                  {INPUT_SOURCES.map((source, idx) => (
                    <DraggableInputCard
                      key={`input-${idx}`}
                      id={`input-${idx}`}
                      label={source.label}
                      icon={source.icon}
                      isDragging={draggedInputIdx === idx}
                      isPinned={selectedInputIdx === idx}
                      onPinClick={handleInputPin}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Row 2 — Displays / Live Layout (80% height) */}
            <Card
              variant="glass"
              className="flex flex-col overflow-hidden relative will-change-transform"
              style={{ flex: '1 1 80%', minHeight: 0 }}
            >
              <CardHeader className="pb-2.5 border-b flex-shrink-0" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center justify-between gap-3 w-full">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold" style={{ color: 'var(--color-heading)' }}>
                    <LayoutGrid className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                    <span>{activeRightTab === 'displays' ? 'Displays' : 'Live Layout'}</span>
                  </CardTitle>

                  <div className="flex gap-2">
                    {[{ key: 'displays', label: 'Displays' }, { key: 'layout', label: 'Layout' }].map((tab) => {
                      const active = activeRightTab === tab.key;
                      return (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => setActiveRightTab(tab.key)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
                          style={{
                            background: active
                              ? 'linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))'
                              : 'var(--color-bg)',
                            color: active ? '#ffffff' : 'var(--color-heading)',
                            border: `2px solid ${active ? 'transparent' : 'var(--color-border)'}`,
                          }}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 min-h-0 overflow-hidden px-4 py-4 touchPanel:px-6 touchPanel:py-6">
                {activeRightTab === 'displays' ? (
                  <div className="h-full overflow-auto pr-1">
                    <div className="grid grid-cols-2 gap-3 md:gap-4 touchPanel:gap-5 auto-rows-fr h-full">
                      {DISPLAY_TARGETS.map((display, idx) => {
                        const isLastOdd =
                          idx === DISPLAY_TARGETS.length - 1 && DISPLAY_TARGETS.length % 2 === 1;
                        return (
                          <div key={`display-${idx}`} className={isLastOdd ? 'col-span-2' : ''}>
                            <DisplayAssignmentCard
                              id={`display-${idx}`}
                              label={display}
                              routedInputIdx={routingMap[idx]}
                              isPinActive={selectedInputIdx !== null}
                              onClickRoute={() => handleDisplayClickRoute(idx)}
                              onClearRoute={() => clearRoute(idx)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Live Layout stage — mirrors the Frame styling of the col-1 swatches.
                     The inner `relative` wrapper is REQUIRED: absolutely positioned zones
                     resolve against the PADDING box, so padding applied to the same element
                     that holds them would simply be painted over. */
                  <div className="w-full h-full flex items-center justify-center">
                    <div
                      className="h-full max-h-full w-auto max-w-full aspect-video rounded-2xl p-2.5 touchPanel:p-4"
                      style={{
                        background: 'linear-gradient(180deg, var(--color-bg), color-mix(in srgb, var(--color-bg-secondary) 60%, white))',
                        border: '2px solid color-mix(in srgb, var(--color-primary) 32%, var(--color-border))',
                        boxShadow: '0 10px 30px color-mix(in srgb, var(--color-shadow) 12%, transparent)',
                      }}
                    >
                      <div className="relative w-full h-full">
                        {activeLayout.zones.map((zone) => (
                          <div key={zone.id} className={zone.className}>
                            <DroppableLayoutZone
                              id={`zone-${zone.id}`}
                              zoneKey={zone.id}
                              label={zone.label}
                              narrow={zone.narrow ?? false}
                              routedInputIdx={layoutRoutingMap[zone.id]}
                              onZoneClickRoute={handleZoneClickRoute}
                              onClearZone={clearZoneRoute}
                              isPinActive={selectedInputIdx !== null}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* DragOverlay */}
          <DragOverlay dropAnimation={null} modifiers={[snapCenterToCursor]}>
            {draggedInputIdx !== null ? (
              <div
                className="flex items-center gap-3 rounded-2xl border-2 px-4 py-3 select-none shadow-xl opacity-95 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))',
                  borderColor: 'var(--color-primary)',
                  color: '#ffffff',
                  touchAction: 'none',
                }}
              >
                {(() => {
                  const Icon = INPUT_SOURCES[draggedInputIdx].icon;
                  return <Icon className="w-5 h-5 flex-shrink-0" />;
                })()}
                <span className="text-sm font-semibold">{INPUT_SOURCES[draggedInputIdx].label}</span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}