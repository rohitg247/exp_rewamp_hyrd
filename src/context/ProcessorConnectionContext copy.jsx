// src/context/ProcessorConnectionContext.jsx
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { DIGITAL_JOINS } from '../crestron/joins';


const ProcessorConnectionContext = createContext();


export const ProcessorConnectionProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastHeartbeatTime, setLastHeartbeatTime] = useState(null);
  const [heartbeatLogs, setHeartbeatLogs] = useState([]); // ✅ ADDED


  // Refs for tracking
  const heartbeatIntervalRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const responseTimeoutRef = useRef(null);
  const subIdReceive = useRef(null);
  const crRef = useRef(null);
  const missCountRef = useRef(0);
  const isConnectedRef = useRef(false);


  // Keep isConnectedRef in sync
  const setIsConnectedSynced = (val) => {
    isConnectedRef.current = val;
    setIsConnected(val);
  };


  // Helper to get CrComLib
  const getCrComLib = () => {
    if (window.CrComLib) {
      return window.CrComLib.CrComLib || window.CrComLib;
    }
    return null;
  };


  // ✅ ADDED — Heartbeat log helpers
  const addHeartbeatLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setHeartbeatLogs(prev => [...prev.slice(-50), { time: timestamp, message, type }]);
  };

  const clearHeartbeatLogs = () => setHeartbeatLogs([]);


  // ─── Send a single pulse on Join 450 ───
  const sendPulse = () => {
    const cr = getCrComLib();
    if (!cr) {
      // console.warn('⚠️ CrComLib not available for heartbeat send');
      return;
    }
    try {
      cr.publishEvent('b', String(DIGITAL_JOINS.SYSTEM_HEARTBEAT_SEND), true);
      setTimeout(() => {
        cr.publishEvent('b', String(DIGITAL_JOINS.SYSTEM_HEARTBEAT_SEND), false);
      }, 100);
    } catch (error) {
      // console.error('❌ Error sending heartbeat pulse:', error);
    }
  };


  // ─── Full heartbeat cycle ───
  // Step 1: Send pulse
  // Step 2: Wait 5s for response
  // Step 3: If no response → send retry pulse
  // Step 4: Wait 5s for response
  // Step 5: If no response again → isConnected = false
  const runHeartbeatCycle = () => {
    // console.log('📤 Processor Heartbeat: Sending pulse (Join 450)');
    addHeartbeatLog(`📤 Pulse sent (Join ${DIGITAL_JOINS.SYSTEM_HEARTBEAT_SEND})`, 'info'); // ✅ ADDED
    sendPulse();


    // Wait 5s for first response
    responseTimeoutRef.current = setTimeout(() => {
      missCountRef.current += 1;
      // console.warn(`⚠️ Processor Heartbeat: No response — miss ${missCountRef.current}/2, sending retry...`);
      addHeartbeatLog(`⚠️ No response — miss ${missCountRef.current}/2, retrying...`, 'warning'); // ✅ ADDED


      // Send retry pulse
      sendPulse();
      // console.log('📤 Processor Heartbeat: Retry pulse sent (Join 450)');
      addHeartbeatLog(`📤 Retry pulse sent (Join ${DIGITAL_JOINS.SYSTEM_HEARTBEAT_SEND})`, 'info'); // ✅ ADDED


      // Wait another 5s for retry response
      retryTimeoutRef.current = setTimeout(() => {
        missCountRef.current += 1;
        // console.warn(`⚠️ Processor Heartbeat: No response to retry — miss ${missCountRef.current}/2`);
        addHeartbeatLog(`⚠️ No response to retry — miss ${missCountRef.current}/2`, 'warning'); // ✅ ADDED


        if (missCountRef.current >= 2) {
          // console.warn('❌ Processor Heartbeat: 2 consecutive failures — marking DISCONNECTED');
          addHeartbeatLog('❌ 2 consecutive failures — DISCONNECTED', 'error'); // ✅ ADDED
          setIsConnectedSynced(false);
        }
      }, 5000);


    }, 5000);
  };


  // ============================================
  // 🔌 BACKEND HEARTBEAT LISTENER (Join 451)
  // ============================================
  useEffect(() => {
    const timer = setTimeout(() => {
      const cr = getCrComLib();


      if (!cr) {
        // console.warn('⚠️ ProcessorConnectionContext: CrComLib not available');
        addHeartbeatLog('⚠️ CrComLib not available', 'warning'); // ✅ ADDED
        return;
      }
      crRef.current = cr;


      // console.log('📡 ProcessorConnectionContext: Subscribing to heartbeat response (Join 451)...');
      addHeartbeatLog(`📡 Subscribed to heartbeat response (Join ${DIGITAL_JOINS.SYSTEM_HEARTBEAT_RECEIVE})`, 'info'); // ✅ ADDED


      const handleBackendPulse = (value) => {
        // console.log('📥 SYSTEM_HEARTBEAT_RECEIVE (Join 451) received:', value);


        if (value === true) {
          // console.log('✅ Processor Heartbeat: Backend responded!');
          addHeartbeatLog(`✅ Response received (Join ${DIGITAL_JOINS.SYSTEM_HEARTBEAT_RECEIVE}) — CONNECTED`, 'success'); // ✅ ADDED


          // Clear both pending timeouts — response received
          if (responseTimeoutRef.current) {
            clearTimeout(responseTimeoutRef.current);
            responseTimeoutRef.current = null;
          }
          if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
          }


          // Reset miss counter and mark connected
          missCountRef.current = 0;
          setIsConnectedSynced(true);
          setLastHeartbeatTime(new Date());
        }
      };


      subIdReceive.current = cr.subscribeState('b', String(DIGITAL_JOINS.SYSTEM_HEARTBEAT_RECEIVE), handleBackendPulse);
      // console.log(`✅ ProcessorConnectionContext subscribed to Join ${DIGITAL_JOINS.SYSTEM_HEARTBEAT_RECEIVE} (Heartbeat Response)`);
    }, 2000);


    return () => {
      clearTimeout(timer);
      if (crRef.current && subIdReceive.current) {
        crRef.current.unsubscribeState('b', String(DIGITAL_JOINS.SYSTEM_HEARTBEAT_RECEIVE), subIdReceive.current);
        // console.log(`🔌 ProcessorConnectionContext unsubscribed from Join ${DIGITAL_JOINS.SYSTEM_HEARTBEAT_RECEIVE}`);
      }
    };
  }, []);


  // ============================================
  // ⏱️ HEARTBEAT INTERVAL — every 10 seconds
  // ============================================
  useEffect(() => {
    // console.log('🚀 Processor Heartbeat: Starting...');
    addHeartbeatLog('🚀 Heartbeat started — 10s interval', 'info'); // ✅ ADDED


    // Run initial cycle immediately
    runHeartbeatCycle();


    // Then repeat every 10 seconds
    heartbeatIntervalRef.current = setInterval(() => {
      runHeartbeatCycle();
    }, 10000);


    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        // console.log('⏹️ Processor Heartbeat: Interval stopped');
      }
      if (responseTimeoutRef.current) clearTimeout(responseTimeoutRef.current);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, []);


  const value = {
    isConnected,
    lastHeartbeatTime,
    heartbeatLogs,         // ✅ ADDED
    clearHeartbeatLogs,    // ✅ ADDED
  };


  return (
    <ProcessorConnectionContext.Provider value={value}>
      {children}
    </ProcessorConnectionContext.Provider>
  );
};


export const useProcessorConnection = () => {
  const context = useContext(ProcessorConnectionContext);
  if (!context) {
    throw new Error('useProcessorConnection must be used within ProcessorConnectionProvider');
  }
  return context;
};
