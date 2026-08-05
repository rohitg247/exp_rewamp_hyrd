// src/hooks/useJoin.js
//
// React hooks for Crestron CH5 joins. All subscriptions/publishes are routed
// through ProcessorConnectionContext, which owns the single CrComLib reference
// and handles the boot race with main.jsx (CrComLib may not exist yet when the
// provider mounts; it polls and sets isReady=true when located).
//
// Stale-closure fix: each hook keeps a useRef of the latest setter/transform/
// callback, updated on every render. The subscription's wrapper reads from the
// ref instead of capturing values directly. This is the canonical React-18
// pattern (pre-useEffectEvent) for "subscriptions that need the latest state
// without re-subscribing."
//
// Type prefixes per Crestron CH5 docs:
//   'b' digital (boolean) — buttons, toggles, feedback flags
//   'n' analog  (numeric) — sliders, levels, 0–65535
//   's' serial  (string)  — JSON, text, identifiers
//   'o' object            — press-and-hold {repeatdigital} + Ramp Control Block {rcb:{time,value}}
//
// SAME PREFIX FOR SUBSCRIBE AND PUBLISH on any given join — otherwise feedback
// is silently dropped.

import { useState, useEffect, useRef, useCallback } from 'react';
import { isActive, WebXPanel } from '../main.jsx';
import { useProcessorConnection } from '../context/ProcessorConnectionContext';

// ============================================
// Digital Join Hook — boolean
// ============================================
// Returns [state, toggle, setDigital].
//   state      — latest boolean received from backend (or last set locally)
//   toggle()   — flip current state + publish
//   setDigital(v) — set explicit boolean + publish (use for momentary pulses:
//                   setDigital(true); setTimeout(()=>setDigital(false), 100))
export function useDigitalJoin(joinNumber) {
  const { subscribe, unsubscribe, publish, isReady } = useProcessorConnection();
  const [state, setState] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (!joinNumber || !isReady) return;
    console.log(`📡 Subscribing to digital join ${joinNumber}`);
    const subId = subscribe('b', joinNumber, (value) => {
      console.log(`📥 Digital join ${joinNumber} received:`, value);
      setState(Boolean(value));
    });
    return () => {
      unsubscribe('b', joinNumber, subId);
      console.log(`🔌 Unsubscribed from digital join ${joinNumber}`);
    };
  }, [joinNumber, isReady, subscribe, unsubscribe]);

  const toggle = useCallback(() => {
    if (!joinNumber) {
      console.warn(`⚠️ Cannot toggle digital join — joinNumber missing`);
      return;
    }
    const next = !stateRef.current;
    console.log(`📤 Toggling digital join ${joinNumber} to:`, next);
    setState(next);                  // optimistic UI
    publish('b', joinNumber, next);  // backend
  }, [joinNumber, publish]);

  const setDigital = useCallback((value) => {
    if (!joinNumber) {
      console.warn(`⚠️ Cannot set digital join — joinNumber missing`);
      return;
    }
    const boolValue = Boolean(value);
    console.log(`📤 Setting digital join ${joinNumber} to:`, boolValue);
    setState(boolValue);                   // optimistic UI
    publish('b', joinNumber, boolValue);   // backend
  }, [joinNumber, publish]);

  return [state, toggle, setDigital];
}

// ============================================
// Analog Join Hook — numeric (0–65535 on the wire)
// ============================================
// Returns [value, setAnalog].
//   value          — latest UI value (0–100 by convention; transformed if recvXform given)
//   setAnalog(v)   — clamp to [0, 100], optimistic UI update, publish backend value
//                    (applies sendTransform if provided)
//
// Optional transforms let the UI work in 0–100% while the backend works in
// 0–65535 (or any other range). Common pairing:
//   useAnalogJoin(join, init,
//     v => Math.round(v * 655.35),    // sendTransform: UI 0-100 → backend 0-65535
//     v => Math.round(v / 655.35)     // receiveTransform: backend 0-65535 → UI 0-100
//   )
export function useAnalogJoin(
  joinNumber,
  initialValue = 0,
  sendTransform = null,
  receiveTransform = null
) {
  const { subscribe, unsubscribe, publish, isReady } = useProcessorConnection();
  const [value, setValue] = useState(initialValue);

  // Refs so the subscription callback always sees the latest transforms
  // (consumers often pass inline arrow functions that change identity each render).
  const sendXformRef = useRef(sendTransform);
  sendXformRef.current = sendTransform;
  const recvXformRef = useRef(receiveTransform);
  recvXformRef.current = receiveTransform;

  useEffect(() => {
    if (!joinNumber || !isReady) return;
    console.log(`📡 Subscribing to analog join ${joinNumber}`);
    const subId = subscribe('n', joinNumber, (raw) => {
      const num = Number(raw);
      const uiVal = recvXformRef.current ? recvXformRef.current(num) : num;
      console.log(`📥 Analog join ${joinNumber} received:`, num, recvXformRef.current ? `→ UI: ${uiVal}` : '');
      setValue(uiVal);
    });
    return () => {
      unsubscribe('n', joinNumber, subId);
      console.log(`🔌 Unsubscribed from analog join ${joinNumber}`);
    };
  }, [joinNumber, isReady, subscribe, unsubscribe]);

  const setAnalog = useCallback((newValue) => {
    if (!joinNumber) {
      console.warn(`⚠️ Cannot set analog join — joinNumber missing`);
      return;
    }
    const uiVal = Math.max(0, Math.min(100, Number(newValue)));
    setValue(uiVal);                                                    // optimistic UI
    const backendVal = sendXformRef.current ? sendXformRef.current(uiVal) : uiVal;
    console.log(`📤 Analog join ${joinNumber} → UI: ${uiVal}%, backend: ${backendVal}`);
    publish('n', joinNumber, backendVal);                               // backend
  }, [joinNumber, publish]);

  return [value, setAnalog];
}

// ============================================
// Write-Only Analog Join Hook — full 0–65535 range
// ============================================
// No subscription, no clamping to 100. For lighting, shade, and other
// controls that need the full Crestron analog range.
export function useAnalogJoinSendOnly(joinNumber) {
  const { publish } = useProcessorConnection();

  const setAnalog = useCallback((newValue) => {
    if (!joinNumber) {
      console.warn(`⚠️ Cannot set analog join — joinNumber missing`);
      return;
    }
    const clampedValue = Math.max(0, Math.min(65535, Number(newValue)));
    console.log(`📤 Setting analog join ${joinNumber} to: ${clampedValue} (0-65535 range)`);
    publish('n', joinNumber, clampedValue);
  }, [joinNumber, publish]);

  return setAnalog;
}

// ============================================
// Read-Only Analog Join Hook
// ============================================
// Subscribe only — no setter exposed. Use for feedback-only analog joins.
export function useAnalogJoinReadOnly(joinNumber, initialValue = 0) {
  const { subscribe, unsubscribe, isReady } = useProcessorConnection();
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (!joinNumber || !isReady) return;
    console.log(`📡 Subscribing to analog join ${joinNumber} (read-only)`);
    const subId = subscribe('n', joinNumber, (val) => {
      console.log(`📥 Analog join ${joinNumber} received:`, val);
      setValue(Number(val));
    });
    return () => {
      unsubscribe('n', joinNumber, subId);
      console.log(`🔌 Unsubscribed from analog join ${joinNumber}`);
    };
  }, [joinNumber, isReady, subscribe, unsubscribe]);

  return value;
}

// ============================================
// Serial Join Hook — string
// ============================================
// Returns [text, sendText].
export function useSerialJoin(joinNumber, initialValue = '') {
  const { subscribe, unsubscribe, publish, isReady } = useProcessorConnection();
  const [text, setText] = useState(initialValue);

  useEffect(() => {
    if (!joinNumber || !isReady) return;
    console.log(`📡 Subscribing to serial join ${joinNumber}`);
    const subId = subscribe('s', joinNumber, (val) => {
      console.log(`📥 Serial join ${joinNumber} received:`, val);
      setText(String(val));
    });
    return () => {
      unsubscribe('s', joinNumber, subId);
      console.log(`🔌 Unsubscribed from serial join ${joinNumber}`);
    };
  }, [joinNumber, isReady, subscribe, unsubscribe]);

  const sendText = useCallback((newText) => {
    if (!joinNumber) {
      console.warn(`⚠️ Cannot send serial join — joinNumber missing`);
      return;
    }
    const textValue = String(newText);
    console.log(`📤 Sending to serial join ${joinNumber}:`, textValue);
    setText(textValue);                       // optimistic UI
    publish('s', joinNumber, textValue);      // backend
  }, [joinNumber, publish]);

  return [text, sendText];
}

// ============================================
// Object Join Hook — press-and-hold + Ramp Control Block
// ============================================
// Returns [value, sendObject].
//   value          — last received object (null if none)
//   sendObject(o)  — publish an arbitrary object
//
// Two canonical Crestron use cases:
//   1. Press-and-hold (publish): sendObject({repeatdigital: true}) on press,
//      sendObject({repeatdigital: false}) on release — makes a digital button
//      auto-repeat while held. Useful for vol-up / vol-down hold.
//   2. Ramp Control Block (subscribe): processor emits {rcb: {time, value, ...}}
//      while ramping a level (lights, shades, audio). Use value.rcb.time to
//      drive a CSS transition matching the actual processor ramp duration.
export function useObjectJoin(joinNumber) {
  const { subscribe, unsubscribe, publish, isReady } = useProcessorConnection();
  const [value, setValue] = useState(null);

  useEffect(() => {
    if (!joinNumber || !isReady) return;
    console.log(`📡 Subscribing to object join ${joinNumber}`);
    const subId = subscribe('o', joinNumber, (val) => {
      console.log(`📥 Object join ${joinNumber} received:`, val);
      setValue(val);
    });
    return () => {
      unsubscribe('o', joinNumber, subId);
      console.log(`🔌 Unsubscribed from object join ${joinNumber}`);
    };
  }, [joinNumber, isReady, subscribe, unsubscribe]);

  const sendObject = useCallback((obj) => {
    if (!joinNumber) {
      console.warn(`⚠️ Cannot send object join — joinNumber missing`);
      return;
    }
    console.log(`📤 Sending to object join ${joinNumber}:`, obj);
    publish('o', joinNumber, obj);
  }, [joinNumber, publish]);

  return [value, sendObject];
}

// ============================================
// Serial Join Callback Hook — read-only, custom handler
// ============================================
// Subscribes to a serial join and invokes the given callback on every value.
// useRef captures the latest callback so consumers can pass inline closures
// without triggering resubscription each render.
export function useSerialJoinCallback(joinNumber, callback) {
  const { subscribe, unsubscribe, isReady } = useProcessorConnection();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!joinNumber || !isReady) return;
    console.log(`📡 Subscribing to serial join callback ${joinNumber}`);
    const subId = subscribe('s', joinNumber, (val) => {
      console.log(`📥 Serial join callback ${joinNumber} received:`, val);
      callbackRef.current?.(String(val));
    });
    return () => {
      unsubscribe('s', joinNumber, subId);
      console.log(`🔌 Unsubscribed from serial join callback ${joinNumber}`);
    };
  }, [joinNumber, isReady, subscribe, unsubscribe]);
}

// ============================================
// System Status Hook — WebXPanel isActive flag
// ============================================
export function useSystemStatus() {
  const [isOnline, setIsOnline] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Initializing');

  useEffect(() => {
    if (isActive) {
      setIsOnline(true);
      setConnectionStatus('Connected');
    } else {
      setConnectionStatus('Not Active');
    }
  }, []);

  return { isOnline, connectionStatus };
}

// ============================================
// Crestron Connection Hook — WebXPanel CIP diagnostics
// ============================================
// Listens to the OFFICIAL WebXPanel events (names verified against the
// installed @crestron/ch5-webxpanel typings — dist/types/events/enums/
// EventTypes.d.ts; the enum values are the literal strings used below).
//
// IMPORTANT distinction this hook makes visible:
//   - The page being served over HTTPS does NOT mean signals can flow.
//   - Signals flow over a separate secure websocket (port 49200) carrying the
//     CIP protocol at the configured IP-ID. CONNECT_CIP is the event that
//     means "joins will actually reach the processor."
//
// Returns { isConnected, wsConnected, connectionStatus, lastError }:
//   isConnected  — CIP layer up (signals flow)
//   wsConnected  — websocket layer up (transport reached the processor)
//   connectionStatus — 'connected' | 'disconnected' | 'error' | 'not_available' | 'initializing'
//   lastError    — human-readable cause of the most recent failure (null when ok)
//
// 'not_available' = container app (iPad/touchscreen native bridge) or dev —
// WebXPanel is not used there; this is NORMAL, not an error.
//
// SINGLETON DESIGN: WebXPanel 2.8.0 exposes only addEventListener publicly
// (removeEventListener is private — calling it throws). Listeners are therefore
// registered ONCE per app lifetime at module level and fan out to subscribed
// hooks. Bonus: link status persists across page navigation.
const xpanelLink = {
  initialized: false,
  state: { isConnected: false, wsConnected: false, connectionStatus: 'initializing', lastError: null },
  subscribers: new Set(),
  update(patch) {
    this.state = { ...this.state, ...patch };
    this.subscribers.forEach((fn) => fn(this.state));
  },
};

function initXpanelLink() {
  if (xpanelLink.initialized) return;
  xpanelLink.initialized = true;

  if (!WebXPanel || typeof WebXPanel.addEventListener !== 'function') {
    xpanelLink.update({ connectionStatus: 'not_available' });
    console.log('ℹ️ XPanel Link: WebXPanel not active (container app / dev) — native bridge in use, this is normal');
    return;
  }

  // ✅ dev mode — WebXPanel exists but was never initialized (skipped in main.jsx)
  const isDev = (
    window.location.hostname === '127.0.0.1' ||
    window.location.protocol === 'file:' ||
    (window.location.hostname === 'localhost' && parseInt(window.location.port) >= 3000 && parseInt(window.location.port) <= 3010)
  );
  if (isDev) {
    xpanelLink.update({ connectionStatus: 'not_available' });
    console.log('ℹ️ XPanel Link: dev mode — WebXPanel skipped, showing N/A');
    return;
  }

  // ── Official event names + exact-cause console messages ──────────────────
  const handlers = {
    CONNECT_WS: ({ detail }) => {
      xpanelLink.update({ wsConnected: true });
      console.log('🟡 XPanel: WebSocket connected (transport up, waiting for CIP)…', detail);
    },
    DISCONNECT_WS: ({ detail }) => {
      xpanelLink.update({
        wsConnected: false,
        isConnected: false,
        connectionStatus: 'disconnected',
        lastError: 'WebSocket dropped — check the self-signed cert was accepted at https://<processor>:49200',
      });
      console.warn('🔴 XPanel: WebSocket DISCONNECTED — if this happens immediately, accept the cert at https://<processor>:49200 in this browser', detail);
    },
    ERROR_WS: ({ detail }) => {
      xpanelLink.update({ connectionStatus: 'error', lastError: `WebSocket error: ${JSON.stringify(detail)}` });
      console.error('❌ XPanel: WebSocket ERROR — transport could not reach the processor:', detail);
    },
    CONNECT_CIP: ({ detail }) => {
      xpanelLink.update({ isConnected: true, connectionStatus: 'connected', lastError: null });
      console.log('🟢 XPanel: CIP CONNECTED — joins will flow to/from the processor ✅', detail);
    },
    DISCONNECT_CIP: ({ detail }) => {
      xpanelLink.update({
        isConnected: false,
        connectionStatus: 'disconnected',
        lastError: 'CIP disconnected — check the XPanel definition / IP-ID in the program',
      });
      console.warn('🔴 XPanel: CIP DISCONNECTED — signals will NOT flow. Check IP-ID matches the XPanel definition in the program:', detail);
    },
    FETCH_TOKEN_FAILED: ({ detail }) => {
      xpanelLink.update({ connectionStatus: 'error', lastError: 'Token fetch failed — processor authentication blocked the connection' });
      console.error('🔐 XPanel: FETCH_TOKEN_FAILED — could not obtain auth token from the processor:', detail);
    },
    INVALID_CREDENTIALS: ({ detail }) => {
      xpanelLink.update({ connectionStatus: 'error', lastError: 'Invalid credentials — wrong/missing ?authtoken= in the XPanel URL' });
      console.error('🔐 XPanel: INVALID_CREDENTIALS — open the XPanel URL with ?authtoken=<token> from the processor:', detail);
    },
    AUTHENTICATION_FAILED: ({ detail }) => {
      xpanelLink.update({ connectionStatus: 'error', lastError: 'Authentication failed — token rejected by the processor' });
      console.error('🔐 XPanel: AUTHENTICATION_FAILED — the supplied auth token was rejected:', detail);
    },
    AUTHENTICATION_REQUIRED: ({ detail }) => {
      xpanelLink.update({ connectionStatus: 'error', lastError: 'Processor requires authentication — open the XPanel URL with ?authtoken=<token>' });
      console.error('🔐 XPanel: AUTHENTICATION_REQUIRED — processor has authentication ON. Open with index.html?authtoken=<token>:', detail);
    },
    NOT_AUTHORIZED: ({ detail }) => {
      xpanelLink.update({ connectionStatus: 'error', lastError: 'Not authorized — this session is not permitted by the processor' });
      console.error('🔐 XPanel: NOT_AUTHORIZED — processor refused this session:', detail);
    },
    INVALID_MAC_ADDRESS: ({ detail }) => {
      xpanelLink.update({ connectionStatus: 'error', lastError: 'Invalid MAC address registration with the processor' });
      console.error('❌ XPanel: INVALID_MAC_ADDRESS:', detail);
    },
    WEB_WORKER_FAILED: ({ detail }) => {
      xpanelLink.update({ connectionStatus: 'error', lastError: 'WebXPanel web worker failed to start in this browser' });
      console.error('❌ XPanel: WEB_WORKER_FAILED — browser blocked the WebXPanel worker:', detail);
    },
  };

  try {
    Object.entries(handlers).forEach(([event, handler]) =>
      WebXPanel.addEventListener(event, handler)
    );
    console.log('📡 XPanel Link: diagnostics listening on', Object.keys(handlers).join(', '));
  } catch (err) {
    console.error('❌ XPanel Link: error setting up connection listeners:', err);
    xpanelLink.update({ connectionStatus: 'error', lastError: err.message });
  }
}

export function useCrestronConnection() {
  const [state, setState] = useState(xpanelLink.state);

  useEffect(() => {
    initXpanelLink();
    setState(xpanelLink.state); // sync in case events fired before this mount
    const sub = (s) => setState(s);
    xpanelLink.subscribers.add(sub);
    return () => { xpanelLink.subscribers.delete(sub); };
  }, []);

  return state; // { isConnected, wsConnected, connectionStatus, lastError }
}
