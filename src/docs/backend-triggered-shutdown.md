# Backend-Triggered Shutdown — Implementation Reference

This document explains how the Crestron processor can remotely trigger a full system shutdown from the backend, and how the processor-feedback disable/enable pattern works for button state control (e.g. VC / BYOD). Use this as a reference when implementing the same patterns in a sibling project.

---

## 1. Backend-Triggered Shutdown (D7)

### What it does
When the Crestron processor sends a HIGH pulse on digital join D7, the frontend executes the exact same shutdown sequence as when the user manually confirms shutdown via the modal — no user interaction required.

> This project is single-room (no separate Combined/Boardroom modes) — `BACKEND_SHUTDOWN_COMBINED`/`BACKEND_SHUTDOWN_BOARDROOM` (D7/D8) were renamed/removed to `BACKEND_SHUTDOWN` (D7 only) accordingly. A sibling multi-room project may still want the two-join pattern — adapt as needed.

### Digital joins

| Join | Name | Direction | File |
|------|------|-----------|------|
| D7 | `BACKEND_SHUTDOWN` | Backend → Frontend (FEEDBACK) | `App.jsx` |

### Shutdown sequence (mirrors ShutdownModal exactly)
1. Close the shutdown modal if it happens to be open
2. Clear all session storage (`safeSessionStorage.clear()`) — resets all UI state
3. Dispatch `window` event `'system-shutdown'` — any component listening resets its in-memory state immediately
4. Send the shutdown pulse **back** to the processor (D5) — 100ms HIGH→LOW pulse
5. After 2000ms: mute all six microphones
6. After 500ms: show the `ShutdownScreen` component (progress animation)
7. `ShutdownScreen.onComplete` → navigate to landing page (`/`)

### Where it lives
**File:** `src/App.jsx` inside the `AppContent` component

```js
// triggerBackendShutdown function — called when D7 fires
const triggerBackendShutdown = () => {
  setShowShutdownModal(false);
  safeSessionStorage.clear();
  window.dispatchEvent(new Event('system-shutdown'));

  sendShutdownCombined(true);
  setTimeout(() => sendShutdownCombined(false), 100);

  setTimeout(() => { /* mute all mics */ }, 2000);
  setTimeout(() => setShowShutdown(true), 500);
};
```

---

## 2. Direct CrComLib Subscription Pattern

### Why direct CrComLib (not useDigitalJoin)?
The `useDigitalJoin` hook routes values through React state. React batches state updates, which means a 100ms HIGH pulse from the processor may be processed after it has already gone LOW — the component never sees `value === true`. Direct CrComLib subscription bypasses React batching and fires the callback synchronously as the signal arrives.

This pattern is used in this project by:
- `ProcessorConnectionContext.jsx` — `SYSTEM_HEARTBEAT_RECEIVE` (D131)
- `App.jsx` — `BACKEND_SHUTDOWN` (D7)

(An earlier example, `DISABLE_VIDEO_CALL`/`ENABLE_VIDEO_CALL`, was removed along with the Boardroom Source Selection UI in this project's single-room consolidation — see §3 below, which still documents the generic pattern for sibling projects.)

### Pattern template
```js
useEffect(() => {
  const cr = window.CrComLib?.CrComLib || window.CrComLib;
  if (!cr) return; // Crestron panel not connected

  const subId = cr.subscribeState('b', String(JOIN_NUMBER), (value) => {
    if (value === true) {
      // handle the HIGH pulse here
    }
  });

  return () => {
    cr.unsubscribeState('b', String(JOIN_NUMBER), subId);
  };
}, []); // empty deps — subscribe once on mount, unsubscribe on unmount
```

**Key points:**
- `'b'` = boolean (digital join). Use `'n'` for analog, `'s'` for serial.
- Always store the subscription ID returned by `subscribeState` and pass it to `unsubscribeState` for cleanup.
- `window.CrComLib?.CrComLib || window.CrComLib` handles both the nested and flat export shapes of the Crestron library.
- All React state setters (`setState`, hook setters) are stable references — no stale closure risk when calling them from inside the subscription callback.

---

## 3. Processor-Feedback Disable/Enable Pattern (Generic)

This pattern lets the Crestron processor disable or re-enable a UI button from the backend. This project previously used it for the Video Call button (removed along with the Boardroom Source Selection UI in a single-room consolidation); a sibling project might use it for a BYOD button or any other toggleable control — the pattern below is still generically correct.

### How it works
The processor sends HIGH pulses on two separate digital joins:
- One join → **disable** the button (frontend sets `isButtonDisabled = true`)
- One join → **re-enable** the button (frontend sets `isButtonDisabled = false`)

The frontend never sends these signals — they are receive-only (`[FEEDBACK]`).

### Implementation (adapt join numbers and names for your project)

```js
// In your component — use safeLocalStorage so state survives shutdown (safeSessionStorage.clear()
// is called on shutdown and would wipe it; localStorage is NOT cleared on shutdown)
const [isButtonDisabled, setIsButtonDisabled] = useState(() => {
  const saved = safeLocalStorage.getItem('myButtonDisabled');
  return saved !== null ? JSON.parse(saved) : false;
});

// Persist state — localStorage so it survives navigation AND shutdown
useEffect(() => {
  safeLocalStorage.setItem('myButtonDisabled', JSON.stringify(isButtonDisabled));
}, [isButtonDisabled]);

// Direct CrComLib subscription for backend control
useEffect(() => {
  const cr = window.CrComLib?.CrComLib || window.CrComLib;
  if (!cr) return;

  // In this project: DISABLE_VIDEO_CALL = D134, ENABLE_VIDEO_CALL = D135
  // In your project: replace with your DISABLE_BYOD / ENABLE_BYOD join numbers
  const subDisable = cr.subscribeState('b', String(DIGITAL_JOINS.DISABLE_YOUR_BUTTON), (value) => {
    if (value === true) setIsButtonDisabled(true);
  });

  const subEnable = cr.subscribeState('b', String(DIGITAL_JOINS.ENABLE_YOUR_BUTTON), (value) => {
    if (value === true) setIsButtonDisabled(false);
  });

  return () => {
    cr.unsubscribeState('b', String(DIGITAL_JOINS.DISABLE_YOUR_BUTTON), subDisable);
    cr.unsubscribeState('b', String(DIGITAL_JOINS.ENABLE_YOUR_BUTTON), subEnable);
  };
}, []);
```

Pass `disabled={isButtonDisabled}` to your `<Button>` component.

### Handling pulses while the component is unmounted (e.g. landing page)
The component-level subscriptions only run while the component is mounted. If the processor sends a disable/enable pulse while the user is on the landing page, those subscriptions aren't active. To capture these pulses, add a **parallel set of subscriptions in `App.jsx`** (which is always mounted) that writes to `safeLocalStorage` only:

```js
// App.jsx — runs always, ensures landing-page pulses are persisted
useEffect(() => {
  const cr = window.CrComLib?.CrComLib || window.CrComLib;
  if (!cr) return;

  const subDisable = cr.subscribeState('b', String(DIGITAL_JOINS.DISABLE_YOUR_BUTTON), (value) => {
    if (value === true) safeLocalStorage.setItem('myButtonDisabled', 'true');
  });

  const subEnable = cr.subscribeState('b', String(DIGITAL_JOINS.ENABLE_YOUR_BUTTON), (value) => {
    if (value === true) safeLocalStorage.setItem('myButtonDisabled', 'false');
  });

  return () => {
    cr.unsubscribeState('b', String(DIGITAL_JOINS.DISABLE_YOUR_BUTTON), subDisable);
    cr.unsubscribeState('b', String(DIGITAL_JOINS.ENABLE_YOUR_BUTTON), subEnable);
  };
}, []);
```

When the component mounts later, its `useState` initializer reads the updated `safeLocalStorage` value — the correct state is already there. When both are mounted simultaneously, both subscriptions fire: the component's own subscription updates React state directly, and App.jsx writes to localStorage. No conflict.

### Disabled state persists through shutdown
The disabled state intentionally survives shutdown. `safeSessionStorage.clear()` is called on shutdown but the disabled flag is stored in `safeLocalStorage` (not sessionStorage), so it is unaffected. The button remains disabled after the user returns to the landing page and navigates back in — only an `ENABLE_YOUR_BUTTON` pulse from the processor can re-enable it.

Do **not** reset `isButtonDisabled` inside a `'system-shutdown'` event listener. That would allow users to bypass the processor's disable signal by simply shutting down and restarting the session.

### Join naming convention used in this project
```
// In src/crestron/joins.js:
DISABLE_VIDEO_CALL: 134,  // [FEEDBACK] Backend → disable VC/BYOD button
ENABLE_VIDEO_CALL: 135,   // [FEEDBACK] Backend → re-enable VC/BYOD button
// In your sibling project these might be named:
// DISABLE_BYOD: <join>, ENABLE_BYOD: <join>
// The pattern and implementation are identical regardless of naming.
```
