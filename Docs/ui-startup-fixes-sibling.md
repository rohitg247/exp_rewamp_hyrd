# Apply the Training Room fixes to the Sibling Project

A step-by-step guide to reproduce, in your **sibling project**, every fix made in
the Training Room project. For the full "why" behind each, see
[ui-startup-fixes-generic.md](./ui-startup-fixes-generic.md). This doc is the
**action list**, with the Training Room implementation shown as the reference and
`<PLACEHOLDER>`s for the sibling's own names.

> ⚠️ **Read Part C of the generic doc first (panel-safe CSS).** The biggest source of
> "works on my laptop, broken on the panel" is Tailwind slash-opacity / arbitrary
> color classes. Use **inline `style={{}}` colors** for anything that must show on the
> panel.

### Name mapping (Training Room → sibling)
Fill this in for your sibling before you start:

| Concept | Training Room | Sibling (`<fill in>`) |
|---|---|---|
| Active-source storage key | `trainingRoomActiveSource` | |
| Force-default-source flag | `forceLecternSource` | |
| Default source / its join | `lectern` / `TR_SOURCE_LECTERN` (D440) | |
| Room-switch handler | `switchToRoom()` in `RoomModeListener.jsx` | |
| Landing enter handler | `handleEnterSystem()` in `LandingPage.jsx` | |
| Power storage key / hold flag | `aircon_power` / `acForceOn` | |
| Status-feed listener | `AcStatusListener.jsx` (serial feed) | |
| Manual power toggle | `handleACToggle()` in `AirconControl.jsx` | |

---

## 1. Default source on startup & room switch (Fix 1)
**Source component** (`SourceSelection.jsx` equiv): add a ref, rewrite the `useState`
initializer, add a mount effect.
```jsx
import { useState, useEffect, useRef } from "react";
const didInitDefault = useRef(false);
const [activeSource, setActiveSource] = useState(() => {
  const saved = safeSessionStorage.getItem('<activeSourceKey>');
  const force = safeSessionStorage.getItem('<forceDefaultSource>') === 'true';
  if (force || saved === null) { didInitDefault.current = true; return '<defaultSource>'; }
  return saved;
});
useEffect(() => {
  if (!didInitDefault.current) return;
  safeSessionStorage.removeItem('<forceDefaultSource>');
  <defaultSourceSetDigital>(true);
  setTimeout(() => <defaultSourceSetDigital>(false), 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```
**Room-switch handler**: add `import { safeSessionStorage } …` and inside the switch
function: `if (targetMode === '<targetRoom>') safeSessionStorage.setItem('<forceDefaultSource>', 'true');`
**Landing enter handler**: `if (roomMode === '<targetRoom>') safeSessionStorage.setItem('<forceDefaultSource>', 'true');`

## 2. Device ON at startup, then follow backend (Fix 2)
**Landing enter handler**: `safeSessionStorage.setItem('<powerKey>', 'true'); safeSessionStorage.setItem('<forceOn>', 'true');`
**Status-feed listener** (reference — Training Room `AcStatusListener.jsx`):
```js
let power = <parsedFeedValue>;            // boolean from your serial/analog feed
if (safeSessionStorage.getItem('<forceOn>') === 'true') {
  if (power) safeSessionStorage.removeItem('<forceOn>');
  else power = true;
}
safeSessionStorage.setItem('<powerKey>', String(power));
```
**Manual toggle handler**: add `safeSessionStorage.removeItem('<forceOn>');`

## 3. Navbar separation (Fix 3 + panel-safe)
On the `<nav>`: keep/add `relative z-20`, and set the shadow **inline** (no border line):
```jsx
<nav className="relative z-20 ..." style={{ boxShadow: "0 6px 14px -2px rgba(0,0,0,0.45)" }}>
```
(If you previously had a `shadow-*` class or an arbitrary `border-[rgba(...)]`, remove
it — the panel may not render those; the inline shadow is reliable. Raise `0.45` for a
stronger shadow.)

## 4 + 5. Card shadows + height stability (apply together)
- Remove `overflow-hidden` from card **wrapper** divs (keep it on the `Card`s).
- Fixed-height grids: `grid … auto-rows-fr … h-full min-h-0`; stacked-column wrappers: add `min-h-0`.
- Page-entry keyframe → **opacity only** (drop `scale()`/`translate()`):
  `@keyframes <entryKeyframe> { from { opacity:0 } to { opacity:1 } }`

## 6. Shutdown/standby screen (Fix 6)
- rAF-driven fill with one `FILL_MS` knob (`FILL_MS + 500ms` hold = total); round the `%`.
- **Remove** `transition-*` classes from the progress ring/bar.
- Cycle device messages off `progress`: `stepIndex = Math.floor(progress/100 * STEPS.length)`, `key`ed row with `animate-fadeIn`.
- ⚠️ **Inline** the bar colors (panel):
```jsx
<div className="w-full rounded-full h-3 touchPanel:h-6" style={{ backgroundColor: "rgba(255,255,255,0.22)" }}>
  <div className="h-3 touchPanel:h-6 rounded-full" style={{ width: `${progress}%`, backgroundColor: "<fillHex>" }} />
</div>
```

## 7. Landing + boot overlay (Fix 7)
- Keep your elegant frosted landing card (a frosted look via `backdrop-filter` +
  `rgba` background **works on the panel** — keep it as inline `style`).
- Add a multi-step boot overlay sharing the same card `style`. Drive it with a
  `STEP_DURATION`-paced state machine; navigate into the room on the **last** step.
- Set the Fix 1 & Fix 2 flags in the enter handler before sending the startup pulse.
- ⚠️ **Every boot-overlay text/track/fill color must be inline** (`style={{ color: 'rgba(255,255,255,…)' }}`),
  not `text-white/NN` or `bg-white/NN` — those render **black/invisible** on the panel.

---

## 🔴 Panel-safe CSS pass (do this before deploying — see generic doc Part C)
1. `grep -rnE "text-(white|black|gray)/[0-9]|bg-(white|black)/[0-9]|border-\[" src/` — for every **visible** element, move the color into an inline `style`.
2. Navbar/card separation → inline `box-shadow`, never a border line.
3. Keep `color-mix()` only with an `rgba()` fallback line before it.
4. Re-test on the actual panel after each deploy — the laptop dev browser does **not**
   reproduce these issues.

## Verify on the sibling
- Enter system → source defaults correctly; device shows **ON** even if an early `0` arrives.
- Shut down & re-enter → still defaults; switch rooms → resets.
- Navbar shows a soft shadow (no line/band) on laptop **and** panel.
- Boot + shutdown screens: **white** text and a **visible** fill bar on the panel.
- Card shadows visible; card heights stable after load and aligned with the sidebar.
