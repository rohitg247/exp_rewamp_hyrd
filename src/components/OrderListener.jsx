// src/components/OrderListener.jsx
//
// Listens for cafe order ACK via two dedicated digital joins:
//   Join 132 (digital) → order COMPLETED pulse from processor
//   Join 133 (digital) → order CANCELLED pulse from processor
//
// Digital pulses are always a state change (true → false),
// so CrComLib fires the callback on every single order — no stale
// value problem possible unlike serial joins.

import { useEffect, useRef, useCallback } from 'react';
import { DIGITAL_JOINS } from '../crestron/joins';
import successSound from '../assets/sounds/success.mp3';
import errorSound from '../assets/sounds/error.mp3';

// ─── Global ACK log writer ────────────────────────────────────
const writeAckLog = (message, type = 'info') => {
  window.__ackLogs = window.__ackLogs || [];
  if (window.__ackLogs.length >= 100) window.__ackLogs.shift();
  window.__ackLogs.push({
    time: new Date().toLocaleTimeString(),
    message,
    type,
  });
};

const OrderListener = () => {
  const subCompleteRef = useRef(null);
  const subCancelRef   = useRef(null);
  const mountedRef     = useRef(false);

  // ─── Sound — play once ───────────────────────────────────────
  const playSound = useCallback((soundFile) => {
    const audio = new Audio(soundFile);
    audio.volume = 0.7;
    audio.play().catch(e => console.warn('🔇 Sound failed:', e));
  }, []);

  // ─── Handlers — only act on true (rising edge of pulse) ──────
  const handleComplete = useCallback((value) => {
    if (value !== true) return; // ignore the false (falling edge)
    writeAckLog(`📥 Join ${DIGITAL_JOINS.CAFE_ORDER_COMPLETE} fired (true) → COMPLETED`, 'success');
    playSound(successSound);
    window.showToast?.('✅ Order completed!', 'success', 10000);
  }, [playSound]);

  const handleCancel = useCallback((value) => {
    if (value !== true) return; // ignore the false (falling edge)
    writeAckLog(`📥 Join ${DIGITAL_JOINS.CAFE_ORDER_CANCEL} fired (true) → CANCELLED`, 'error');
    playSound(errorSound);
    window.showToast?.('❌ Order was cancelled.', 'error', 10000);
  }, [playSound]);

  // ─── Mount / Unmount ──────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    window.__ackSubActive = false;

    writeAckLog('🟡 OrderListener mounted — waiting 2s before subscribing...', 'info');

    const timer = setTimeout(() => {
      if (!mountedRef.current) return;

      const cr = window.CrComLib?.CrComLib || window.CrComLib;

      if (!cr) {
        writeAckLog('❌ CrComLib not available — subscription FAILED', 'error');
        return;
      }

      writeAckLog(
        `📡 Subscribing to Join ${DIGITAL_JOINS.CAFE_ORDER_COMPLETE} (complete) and Join ${DIGITAL_JOINS.CAFE_ORDER_CANCEL} (cancel)...`,
        'info'
      );

      try {
        subCompleteRef.current = cr.subscribeState(
          'b',
          String(DIGITAL_JOINS.CAFE_ORDER_COMPLETE),
          handleComplete
        );
        writeAckLog(
          `✅ Subscribed to COMPLETE Join ${DIGITAL_JOINS.CAFE_ORDER_COMPLETE} — subId: ${subCompleteRef.current}`,
          'success'
        );

        subCancelRef.current = cr.subscribeState(
          'b',
          String(DIGITAL_JOINS.CAFE_ORDER_CANCEL),
          handleCancel
        );
        writeAckLog(
          `✅ Subscribed to CANCEL Join ${DIGITAL_JOINS.CAFE_ORDER_CANCEL} — subId: ${subCancelRef.current}`,
          'success'
        );

        window.__ackSubActive = true;

      } catch (err) {
        writeAckLog(`❌ subscribeState threw: ${err?.message || err}`, 'error');
      }
    }, 2000);

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
      window.__ackSubActive = false;

      const cr = window.CrComLib?.CrComLib || window.CrComLib;
      if (cr) {
        if (subCompleteRef.current) {
          try {
            cr.unsubscribeState('b', String(DIGITAL_JOINS.CAFE_ORDER_COMPLETE), subCompleteRef.current);
            writeAckLog(`🔌 Unsubscribed from COMPLETE Join ${DIGITAL_JOINS.CAFE_ORDER_COMPLETE}`, 'warning');
          } catch (err) {
            writeAckLog(`⚠️ Unsubscribe error (complete): ${err?.message || err}`, 'warning');
          }
          subCompleteRef.current = null;
        }
        if (subCancelRef.current) {
          try {
            cr.unsubscribeState('b', String(DIGITAL_JOINS.CAFE_ORDER_CANCEL), subCancelRef.current);
            writeAckLog(`🔌 Unsubscribed from CANCEL Join ${DIGITAL_JOINS.CAFE_ORDER_CANCEL}`, 'warning');
          } catch (err) {
            writeAckLog(`⚠️ Unsubscribe error (cancel): ${err?.message || err}`, 'warning');
          }
          subCancelRef.current = null;
        }
      }
    };
  }, [handleComplete, handleCancel]);

  return null;
};

export default OrderListener;