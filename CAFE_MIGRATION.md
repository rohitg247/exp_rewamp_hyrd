# Café Page — Training Room Project Migration Document

> **Scope**: The source is the Boardroom project. The target is a separate Training Room project.
> All file paths are relative to whichever project root they belong to.
> Join numbers used in the source are shown for reference only —
> **the target project must define its own join numbers** in its own `joins.js`;
> the values are for the Crestron programmer to assign.

---

## Section 1: Files to Copy

Copy every file in this list from the source project into the target project at the stated target path.
Where a dependency (Button, Modal, etc.) already exists in the target, skip it.

### 1a — Core Café Files (must copy)

| File | Source path | Target path |
|---|---|---|
| Café page | `src/pages/CafePage.jsx` | `src/pages/CafePage.jsx` |
| Menu edit modal | `src/components/modals/EditMenuModal.jsx` | `src/components/modals/EditMenuModal.jsx` |
| Order list modal | `src/components/modals/OrderListModal.jsx` | `src/components/modals/OrderListModal.jsx` |
| Order ACK listener | `src/components/OrderListener.jsx` | `src/components/OrderListener.jsx` |

### 1b — Audio Assets (must copy)

| File | Source path | Target path | Used by |
|---|---|---|---|
| Order placed sound | `src/assets/sounds/order-placed.mp3` | `src/assets/sounds/order-placed.mp3` | CafePage.jsx |
| Order complete sound | `src/assets/sounds/success.mp3` | `src/assets/sounds/success.mp3` | OrderListener.jsx |
| Order cancelled sound | `src/assets/sounds/error.mp3` | `src/assets/sounds/error.mp3` | OrderListener.jsx |

### 1c — UI Dependencies (copy only if not already in target)

| File | Source path | Target path | Used by |
|---|---|---|---|
| On-screen keyboard | `src/components/ui/OnScreenKeyboard.jsx` | `src/components/ui/OnScreenKeyboard.jsx` | EditMenuModal.jsx |
| Modal wrapper | `src/components/ui/Modal.jsx` | `src/components/ui/Modal.jsx` | EditMenuModal, OrderListModal |
| Card component | `src/components/ui/Card.jsx` | `src/components/ui/Card.jsx` | CafePage.jsx |
| Button component | `src/components/ui/Button.jsx` | `src/components/ui/Button.jsx` | CafePage, modals |
| Toast container | `src/components/ui/ToastContainer.jsx` | `src/components/ui/ToastContainer.jsx` | `window.showToast` in OrderListener |
| Safe storage util | `src/utils/safeStorage.js` | `src/utils/safeStorage.js` | CafePage (menu + order persistence) |
| useJoin hook | `src/hooks/useJoin.js` | `src/hooks/useJoin.js` | CafePage (`useSerialJoin`), OrderListener (`useDigitalJoin`) |

---

## Section 2: Files to Modify in the Target Project

These are files that already exist (or will exist) in the target project and need specific additions
to wire up the Café feature.

| File | Change required |
|---|---|
| `src/crestron/joins.js` | Add 5 café join constants (user assigns numbers) |
| `src/App.jsx` (or router file) | Import CafePage and OrderListener; add `/cafe` route; mount `<OrderListener />` globally |
| `src/components/layout/Navbar.jsx` | Add Café button and Back button for Training Room context |
| Settings debug page | Add the TCP/ACK debug tab (see Section 5) |

---

## Section 3: Joins Audit

### All joins used by the Café feature

| Constant name | Type | Direction | Format | Component | Source project number |
|---|---|---|---|---|---|
| `CAFE_ORDER_LIST` | Serial | Frontend → Backend | `"Item,Qty\|Item,Qty"` e.g. `"Water,1\|Coffee,2"` | CafePage.jsx | S320 |
| `CAFE_ORDER_STATUS` | Serial | Frontend → Backend | `"orderId:status"` — `1`=complete, `0`=cancel | OrderListModal.jsx | S321 |
| `CAFE_ORDER_ACK` | Serial | Backend → Frontend | `"1"`=completed, `"0"`=cancelled | OrderListener.jsx | S322 |
| `CAFE_ORDER_COMPLETE` | Digital | Backend → Frontend | Pulse (true → false) on order completion | OrderListener.jsx | D132 |
| `CAFE_ORDER_CANCEL` | Digital | Backend → Frontend | Pulse (true → false) on order cancellation | OrderListener.jsx | D133 |

### What to add to the target project's `joins.js`

The numbers below are **placeholders** — assign whatever join numbers are free in the target
Crestron program. Add `CAFE_ORDER_LIST`, `CAFE_ORDER_STATUS`, and `CAFE_ORDER_ACK` to
`SERIAL_JOINS`; add `CAFE_ORDER_COMPLETE` and `CAFE_ORDER_CANCEL` to `DIGITAL_JOINS`.

```js
// ── Café Orders ──
CAFE_ORDER_LIST:     ???,  // [SERIAL]   CafePage.jsx        – Frontend sends order string
CAFE_ORDER_STATUS:   ???,  // [SERIAL]   OrderListModal.jsx  – Frontend sends orderId:status
CAFE_ORDER_ACK:      ???,  // [SERIAL]   OrderListener.jsx   – Backend sends ACK string
CAFE_ORDER_COMPLETE: ???,  // [FEEDBACK] OrderListener.jsx   – Backend pulses on completion
CAFE_ORDER_CANCEL:   ???,  // [FEEDBACK] OrderListener.jsx   – Backend pulses on cancellation
```

**No café join is missing from the source project** — all five are defined and used.
The target simply needs its own copy with its own numbers.

---

## Section 4: Integration Steps

### 4.1 `src/crestron/joins.js`

Add to `DIGITAL_JOINS`:

```diff
+ CAFE_ORDER_COMPLETE: ???,  // [FEEDBACK] OrderListener.jsx – pulse on order completed
+ CAFE_ORDER_CANCEL:   ???,  // [FEEDBACK] OrderListener.jsx – pulse on order cancelled
```

Add to `SERIAL_JOINS`:

```diff
+ CAFE_ORDER_LIST:   ???,  // [SERIAL] CafePage.jsx        – "Item,Qty|Item,Qty"
+ CAFE_ORDER_STATUS: ???,  // [SERIAL] OrderListModal.jsx  – "orderId:status"
+ CAFE_ORDER_ACK:    ???,  // [SERIAL] OrderListener.jsx   – ACK from backend
```

---

### 4.2 `src/App.jsx` (or the target router file)

**Diff A — import the two new components** (alongside existing page imports):

```diff
+ import CafePage      from "./pages/CafePage";
+ import OrderListener from "./components/OrderListener";
```

**Diff B — mount OrderListener globally** (inside the component that wraps all routes,
alongside any other global listeners already present):

```diff
  <>
    {/* existing global listeners */}
+   <OrderListener />
    {/* rest of the app */}
  </>
```

**Diff C — add the `/cafe` route** (alongside the Training Room home route). Pass `roomType`
from whatever room-mode state the target project uses so the Navbar receives the correct context:

```diff
+ <Route
+   path="/cafe"
+   element={
+     <ContentWrapper onShutdown={handleShutdownClick} roomType={roomMode}>
+       <CafePage sidebarEnabled={SIDEBAR_ENABLED} />
+     </ContentWrapper>
+   }
+ />
```

**Diff D — add `/cafe` to the sidebar route list** if the target project uses the same
`sidebarRoutes` pattern to control Sidebar visibility:

```diff
  const sidebarRoutes = [
    "/training-room",
    // ... other routes
+   "/cafe",
  ];
```

---

### 4.3 `src/components/layout/Navbar.jsx`

The Boardroom navbar uses a two-slot right-side button pattern:

- **Slot 1** — Café button on the room home page; Back button on `/cafe` or `/settings`
- **Slot 2** — Café button on `/settings`; Settings button everywhere else

Replicate this pattern for `roomType === "training"`.

**Diff A — add `isCafePage` path check** alongside any existing path checks:

```diff
+ const isCafePage     = location.pathname === "/cafe";
  const isSettingsPage = location.pathname === "/settings";
```

**Diff B — suppress the centre nav tab bar for Training Room** (Café lives in the right-side
slot, not the scrollable centre row):

```diff
  const renderNavButtons = () => {
-   if (roomType === "boardroom") return null;
+   if (roomType === "boardroom" || roomType === "training") return null;
```

**Diff C — extend the right-side button block to cover Training Room**. Replace
`"/training-room"` below with the actual TR home route used in the target project:

```diff
- {roomType === "boardroom" ? (
+ {(roomType === "boardroom" || roomType === "training") ? (
    <>
      {/* SLOT 1 — Café on home, Back on /cafe or /settings */}
      {(isCafePage || isSettingsPage) ? (
        <Button
          variant="secondary"
          onClick={() => navigate(
-           "/boardroom"
+           roomType === "training" ? "/training-room" : "/boardroom"
          )}
        >
          <ArrowLeft /> Back
        </Button>
      ) : (
        <Button variant="secondary" onClick={() => navigate("/cafe")}>
          <Coffee /> Cafe
        </Button>
      )}

      {/* SLOT 2 — Café on /settings, Settings elsewhere */}
      {isSettingsPage ? (
        <Button variant="secondary" onClick={() => navigate("/cafe")}>
          <Coffee /> Cafe
        </Button>
      ) : (
        <Button variant="secondary" onClick={() => navigate("/settings")}>
          <Settings />
        </Button>
      )}
    </>
  ) : (
    /* other room types — existing code unchanged */
  )}
```

**Diff D — fix logo-click home navigation**:

```diff
- navigate(roomType === "boardroom" ? "/boardroom" : "/combined-room");
+ if (roomType === "boardroom")      navigate("/boardroom");
+ else if (roomType === "training")  navigate("/training-room");
+ else                               navigate("/combined-room");
```

---

### 4.4 Target Settings page — add TCP/ACK debug tab

**Diff A — global ACK log helpers** (top of file, outside the component):

```js
const getAckLogs   = () => window.__ackLogs || [];
const clearAckLogs = () => { window.__ackLogs = []; };
```

**Diff B — ACK state and polling** (inside the component, alongside `debugTab` state):

```diff
+ const [ackLogs, setAckLogs] = useState([]);

+ // Poll the global buffer every 500 ms while the ACK tab is active
+ useEffect(() => {
+   if (!showDebug || debugTab !== 'ack') return;
+   const poll = setInterval(() => setAckLogs([...getAckLogs()]), 500);
+   return () => clearInterval(poll);
+ }, [showDebug, debugTab]);

+ // Snapshot when the tab first becomes active
+ useEffect(() => {
+   if (debugTab === 'ack') setAckLogs([...getAckLogs()]);
+ }, [debugTab]);
```

**Diff C — wire ackLogs into the active log list**:

```diff
  const activeLogList =
    debugTab === 'device'    ? debugLogs :
    debugTab === 'heartbeat' ? heartbeatLogs :
+   ackLogs;
```

**Diff D — add Clear handler branch**:

```diff
  const handleClearLogs = () => {
    if (debugTab === 'device')         setDebugLogs([]);
    else if (debugTab === 'heartbeat') clearHeartbeatLogs();
+   else { clearAckLogs(); setAckLogs([]); }
  };
```

**Diff E — add the TCP/ACK tab button** in the debug panel tab row (after the Heartbeat tab):

```diff
+ <button
+   onClick={() => setDebugTab('ack')}
+   className={`flex-1 py-2 text-xs font-semibold transition-colors ${
+     debugTab === 'ack'
+       ? 'bg-gray-800 text-blue-400 border-b-2 border-blue-400'
+       : 'text-gray-400 hover:text-white'
+   }`}
+ >
+   TCP / ACK
+ </button>
```

**Diff F — add the ACK footer block** in the debug panel footer:

```diff
- <div className="text-xs text-gray-400 space-y-1">
-   {/* existing footer lines */}
- </div>
+ {debugTab !== 'ack' ? (
+   <div className="text-xs text-gray-400 space-y-1">
+     {/* existing footer lines unchanged */}
+   </div>
+ ) : (
+   <div className="text-xs text-gray-400 space-y-1">
+     <div>ACK log entries: {ackLogs.length}</div>
+     <div>Join subscribed: {window.__ackSubActive ? '✅ Yes' : '❓ Unknown'}</div>
+     <div>Last ACK: {ackLogs.length > 0 ? ackLogs[ackLogs.length - 1].message : '—'}</div>
+     <div>WebXPanel: {isConnected ? '✅ Connected' : '❌ Disconnected'}</div>
+   </div>
+ )}
```

---

## Section 5: What Is Boardroom-Specific and Must Not Be Carried Over

### 5.1 Back-button navigation target

In the source project, the Back button always navigates to `"/boardroom"`. In the target it must
navigate to `"/training-room"` (or whatever the TR home route is). This is covered by Diff C in
Section 4.3, but is the single most likely copy-paste mistake.

### 5.2 The Boardroom Settings page is missing the TCP/ACK debug tab

This is a gap in the **source project** that must not be replicated in the target.

| Capability | `SettingsPage.jsx` (Combined Room) | `SettingsPageBoardroom.jsx` (Boardroom) |
|---|---|---|
| `window.__ackLogs` polling | Yes — every 500 ms while tab is active | **No** |
| TCP / ACK tab button | Yes | **No** |
| `window.__ackSubActive` status in footer | Yes | **No** |
| Last ACK message in footer | Yes | **No** |
| `activeLogList` ACK branch | Yes | **No** (falls through to `heartbeatLogs`) |
| `handleClearLogs` ACK branch | Yes | **No** |

The Training Room project's Settings page should be built from `SettingsPage.jsx`,
**not** `SettingsPageBoardroom.jsx`. All six ACK-related items above are already present in
`SettingsPage.jsx` and Section 4.4 shows exactly what to add.

### 5.3 `window.__ackSubActive` flag

`OrderListener.jsx` sets `window.__ackSubActive = true` after successfully subscribing to the
two digital joins, and `false` on unmount. The Settings ACK footer reads this flag to show
subscription status. This works as long as `<OrderListener />` is mounted before the Settings
page is opened — guaranteed by mounting it at the App root level (Section 4.2 Diff B).

### 5.4 Join numbers are program-specific

The source project's join numbers (D132, D133, S320, S321, S322) are assigned inside the
Boardroom Crestron program. The Training Room Crestron program may use completely different
numbers. Every reference to the café join constants is resolved through the target's own
`joins.js` — so as long as Section 4.1 is done correctly, none of the copied component
files need to be edited.

### 5.5 `OrderListModal.jsx` is currently commented out in `CafePage.jsx`

In the source project the import and trigger button for `OrderListModal` are both commented out.
Copy the file across anyway — it is complete and functional. Whether to enable it in the target
is a product decision, not a code gap.

### 5.6 localStorage keys are shared across rooms

The Café feature stores data under `cafe_menu_items` and `cafe_orders` with no room prefix.
If both the Boardroom and Training Room UIs ever run in the same browser session on the same
origin, they will share the same menu and order list. This is acceptable for a single-panel
deployment but worth noting if the projects are ever hosted under a shared domain.
