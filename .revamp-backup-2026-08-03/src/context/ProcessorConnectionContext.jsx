// src/context/ProcessorConnectionContext.jsx
//
// Owns ALL CrComLib subscriptions for the app. Two roles:
//
// 1. Heartbeat (digital ping every 10s on SYSTEM_HEARTBEAT_SEND, listens on
//    SYSTEM_HEARTBEAT_RECEIVE — 2 misses = DISCONNECTED).
// 2. Centralized subscribe/unsubscribe/publish API exposed to the join hooks
//    (useDigitalJoin / useAnalogJoin / useSerialJoin / useObjectJoin /
//    useSerialJoinCallback). Hooks pass their setter via a useRef so callbacks
//    always read the latest state without re-subscribing on every render
//    (React 18.3 stale-closure fix — pre-useEffectEvent pattern).
//
// CrComLib race with main.jsx: provider polls window.CrComLib every 200ms for
// up to 10s. When located, sets isReady=true. Hook useEffects depend on
// isReady so subscriptions kick in as soon as the bridge is up.

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { DIGITAL_JOINS } from '../crestron/joins';

const ProcessorConnectionContext = createContext();

const locateCrComLib = () => {
  if (typeof window === 'undefined' || !window.CrComLib) return null;
  return window.CrComLib.CrComLib || window.CrComLib;
};

export const ProcessorConnectionProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastHeartbeatTime, setLastHeartbeatTime] = useState(null);
  const [heartbeatLogs, setHeartbeatLogs] = useState([]);
  const [isReady, setIsReady] = useState(false);

  const heartbeatIntervalRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const responseTimeoutRef = useRef(null);
  const subIdReceive = useRef(null);
  const crRef = useRef(null);
  const missCountRef = useRef(0);
  const isConnectedRef = useRef(false);

  const setIsConnectedSynced = (val) => {
    isConnectedRef.current = val;
    setIsConnected(val);
  };

  const addHeartbeatLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setHeartbeatLogs(prev => [...prev.slice(-50), { time: timestamp, message, type }]);
  };

  const clearHeartbeatLogs = () => setHeartbeatLogs([]);

  // ============================================
  // Centralized subscribe / unsubscribe / publish
  // ============================================
  // Stable identities via useCallback so hook useEffects don't re-run.
  // All four CrComLib type prefixes supported: 'b' (digital), 'n' (analog),
  // 's' (serial), 'o' (object — press-and-hold + Ramp Control Block).

  const subscribe = useCallback((type, joinNumber, callback) => {
    const cr = crRef.current;
    if (!cr) {
      console.warn(`⚠️ subscribe(${type}, ${joinNumber}) — CrComLib not ready`);
      return null;
    }
    try {
      return cr.subscribeState(type, String(joinNumber), callback);
    } catch (err) {
      console.error(`❌ subscribe error ${type}:${joinNumber}`, err);
      return null;
    }
  }, []);

  const unsubscribe = useCallback((type, joinNumber, subId) => {
    const cr = crRef.current;
    if (!cr) return;
    try {
      cr.unsubscribeState(type, String(joinNumber), subId);
    } catch (err) {
      console.error(`❌ unsubscribe error ${type}:${joinNumber}`, err);
    }
  }, []);

  const publish = useCallback((type, joinNumber, value) => {
    const cr = crRef.current;
    if (!cr) {
      console.warn(`⚠️ publish(${type}, ${joinNumber}) — CrComLib not ready`);
      return;
    }
    try {
      cr.publishEvent(type, String(joinNumber), value);
    } catch (err) {
      console.error(`❌ publish error ${type}:${joinNumber}`, err);
    }
  }, []);

  // ============================================
  // Locate CrComLib on mount (race with main.jsx init)
  // ============================================
  useEffect(() => {
    const cr = locateCrComLib();
    if (cr) {
      crRef.current = cr;
      setIsReady(true);
      addHeartbeatLog('✅ CrComLib located immediately', 'success');
      return;
    }

    addHeartbeatLog('⏳ Waiting for CrComLib...', 'info');
    const intervalId = setInterval(() => {
      const found = locateCrComLib();
      if (found) {
        crRef.current = found;
        setIsReady(true);
        addHeartbeatLog('✅ CrComLib located after retry', 'success');
        clearInterval(intervalId);
      }
    }, 200);

    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      if (!crRef.current) {
        addHeartbeatLog('❌ CrComLib not located within 10s', 'error');
        console.warn('⚠️ CrComLib not located within 10s — joins will not work');
      }
    }, 10000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);

  // ============================================
  // Heartbeat — pulse SYSTEM_HEARTBEAT_SEND, listen on SYSTEM_HEARTBEAT_RECEIVE
  // ============================================
  const sendPulse = () => {
    const cr = crRef.current;
    if (!cr) return;
    try {
      cr.publishEvent('b', String(DIGITAL_JOINS.SYSTEM_HEARTBEAT_SEND), true);
      setTimeout(() => {
        cr.publishEvent('b', String(DIGITAL_JOINS.SYSTEM_HEARTBEAT_SEND), false);
      }, 100);
    } catch { /* swallow — heartbeat is best-effort */ }
  };

  const runHeartbeatCycle = () => {
    addHeartbeatLog(`📤 Pulse sent (Join ${DIGITAL_JOINS.SYSTEM_HEARTBEAT_SEND})`, 'info');
    sendPulse();

    responseTimeoutRef.current = setTimeout(() => {
      missCountRef.current += 1;
      addHeartbeatLog(`⚠️ No response — miss ${missCountRef.current}/2, retrying...`, 'warning');
      sendPulse();
      addHeartbeatLog(`📤 Retry pulse sent (Join ${DIGITAL_JOINS.SYSTEM_HEARTBEAT_SEND})`, 'info');

      retryTimeoutRef.current = setTimeout(() => {
        missCountRef.current += 1;
        addHeartbeatLog(`⚠️ No response to retry — miss ${missCountRef.current}/2`, 'warning');
        if (missCountRef.current >= 2) {
          addHeartbeatLog('❌ 2 consecutive failures — DISCONNECTED', 'error');
          setIsConnectedSynced(false);
        }
      }, 5000);
    }, 5000);
  };

  // Subscribe to heartbeat response (only after CrComLib is ready)
  useEffect(() => {
    if (!isReady) return;
    const cr = crRef.current;
    if (!cr) return;

    addHeartbeatLog(`📡 Subscribed to heartbeat response (Join ${DIGITAL_JOINS.SYSTEM_HEARTBEAT_RECEIVE})`, 'info');

    const handleBackendPulse = (value) => {
      if (value === true) {
        addHeartbeatLog(`✅ Response received (Join ${DIGITAL_JOINS.SYSTEM_HEARTBEAT_RECEIVE}) — CONNECTED`, 'success');
        if (responseTimeoutRef.current) { clearTimeout(responseTimeoutRef.current); responseTimeoutRef.current = null; }
        if (retryTimeoutRef.current)   { clearTimeout(retryTimeoutRef.current);   retryTimeoutRef.current = null; }
        missCountRef.current = 0;
        setIsConnectedSynced(true);
        setLastHeartbeatTime(new Date());
      }
    };

    subIdReceive.current = cr.subscribeState('b', String(DIGITAL_JOINS.SYSTEM_HEARTBEAT_RECEIVE), handleBackendPulse);

    return () => {
      if (cr && subIdReceive.current) {
        cr.unsubscribeState('b', String(DIGITAL_JOINS.SYSTEM_HEARTBEAT_RECEIVE), subIdReceive.current);
      }
    };
  }, [isReady]);

  // Heartbeat interval — every 10 seconds (starts only after CrComLib is ready)
  useEffect(() => {
    if (!isReady) return;
    addHeartbeatLog('🚀 Heartbeat started — 10s interval', 'info');
    runHeartbeatCycle();
    heartbeatIntervalRef.current = setInterval(runHeartbeatCycle, 10000);

    return () => {
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      if (responseTimeoutRef.current) clearTimeout(responseTimeoutRef.current);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ProcessorConnectionContext.Provider value={{
      isConnected,
      lastHeartbeatTime,
      heartbeatLogs,
      clearHeartbeatLogs,
      isReady,
      subscribe,
      unsubscribe,
      publish,
    }}>
      {children}
    </ProcessorConnectionContext.Provider>
  );
};

export const useProcessorConnection = () => {
  const context = useContext(ProcessorConnectionContext);
  if (!context) throw new Error('useProcessorConnection must be used within ProcessorConnectionProvider');
  return context;
};
