# UI & Startup Fixes — Generic Reference (all Crestron React/Vite/Tailwind projects)

A reusable, project-agnostic write-up of every fix applied in the Training Room
project. Stack assumed: **React + Vite + Tailwind CSS**, **Crestron CrComLib** joins,
a `safeSessionStorage` / `safeLocalStorage` wrapper (sessionStorage cleared on
shutdown), deployed to **Crestron touch panels** (e.g. TSW-1070).

Each section: **Symptom → Cause → Fix → Code pattern.** Replace `<PLACEHOLDER>`
names with your project's join numbers / storage keys / component names.

> 🔴 **The single most important section is Part C (Crestron panel-safe CSS).**
> It explains why CSS that works in the laptop dev browser can break on the panel,
> and the inline-style rule that prevents it.

---

## Part A — Startup / state behaviors

### Fix 1 — Default the source to a chosen input on startup & room switch

**Symptom** After shutdown (which clears `sessionStorage`) the source panel shows
"no source selected"; switching back from another room restores a stale source.

**Cause** Active-source state is seeded from `sessionStorage` and defaults to
nothing; nothing forces a default on a fresh start, and the stored value persists
across room switches.

**Fix** Use a one-shot `sessionStorage` flag (`<forceDefaultSource>`) as the signal,
set in two places and consumed once on mount:
1. Set it when the system **switches into** the target room (room-switch handler).
2. Set it on the **landing "enter"** path (which may not go through the switch handler).
3. On mount, the source component seeds the default as active, pulses the backend
   join, and clears the flag. Capture the "is this a fresh/forced mount?" decision
   **inside the `useState` initializer** (via a ref) — not a later effect, or a
   persist-effect may overwrite storage first and hide the "fresh" condition.

Because the flag lives in `sessionStorage`, it is wiped on shutdown automatically.

```jsx
// Source component
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
  setTimeout(() => <defaultSourceSetDigital>(false), 100); // momentary pulse
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```
```js
// Room-switch choke point (covers backend joins + keyboard mocks)
if (targetMode === '<targetRoom>') safeSessionStorage.setItem('<forceDefaultSource>', 'true');
// Landing "enter" handler
if (roomMode === '<targetRoom>') safeSessionStorage.setItem('<forceDefaultSource>', 'true');
```

### Fix 2 — Show a device as ON at startup, then follow the backend ("hold-ON")

**Symptom** On startup a device (e.g. AC) briefly shows OFF even though the backend
turns it on — an early/stale `0` from the status feed lands in storage before the
real `1`.

**Cause** The status listener writes whatever the feed reports; the first frame can
be `0`.

**Fix** 1) On entering the system, prime storage ON + set a `<forceOn>` flag (no
signal sent — the processor turns the device on itself). 2) In the status listener,
while the flag is set, **ignore OFF** (keep ON); the first **ON** clears the flag,
after which all changes (incl. OFF) are honored. 3) A manual user toggle also clears
the flag so the user's choice always wins.

```js
// On entering the system
safeSessionStorage.setItem('<powerKey>', 'true');
safeSessionStorage.setItem('<forceOn>', 'true');

// Status-feed listener (read/write the flag through safeSessionStorage — no stale closures)
let power = <parsedFeedValue>;            // boolean
if (safeSessionStorage.getItem('<forceOn>') === 'true') {
  if (power) safeSessionStorage.removeItem('<forceOn>'); // confirmed ON → honor feed
  else power = true;                                     // startup: hold ON, ignore early OFF
}
safeSessionStorage.setItem('<powerKey>', String(power));

// Manual toggle handler
safeSessionStorage.removeItem('<forceOn>'); // user choice beats the startup hold
```

---

## Part B — Layout / styling

### Fix 3 — Navbar separation (shadow) not visible
**Symptom** The navbar's shadow shows in dev but is invisible/under the content.
**Cause** Two issues: (a) a later sibling (page content) paints over the navbar's
downward shadow — fix by lifting the nav with `relative z-20`; (b) the shadow class
itself may not render reliably on the panel (see Part C). **On the panel, prefer an
inline `box-shadow` over a border line** — a border can render as a muddy band.
```jsx
<nav className="relative z-20 ..." style={{ boxShadow: "0 6px 14px -2px rgba(0,0,0,0.45)" }}>
```

### Fix 4 — Card shadows clipped by a parent `overflow-hidden`
**Symptom** Some cards (esp. stacked ones) show no shadow.
**Cause** A card's own `overflow-hidden` does **not** clip its box-shadow, but a
**parent wrapper** with `overflow-hidden` hugging the card does.
**Fix** Remove `overflow-hidden` from the **wrapper `<div>`s** (keep it on the
`Card`s themselves so content stays clipped). Apply together with Fix 5.

### Fix 5 — Cards grow taller after load / misalign with a fixed sidebar
**Symptom** Card heights increase shortly after load.
**Cause** (a) An entry keyframe animating `scale()` makes everything start ~1%
smaller and grow in (the sidebar, rendered outside, doesn't scale). (b) Grid rows
are content-sized (`auto`), so late-loading content (fonts, ResizeObserver widgets,
images) inflates them.
**Fix**
```diff
- @keyframes fadeInPage { from { opacity:0; transform: translateY(8px) scale(.99) } to { opacity:1; transform: none } }
+ @keyframes fadeInPage { from { opacity:0 } to { opacity:1 } }   /* pure opacity fade */
```
```diff
- <div class="grid grid-cols-3 gap-6 flex-1 h-full">
+ <div class="grid grid-cols-3 auto-rows-fr gap-6 flex-1 h-full min-h-0">
- <div class="flex flex-col gap-6 h-full overflow-hidden">       {/* stacked column wrapper */}
+ <div class="flex flex-col gap-6 h-full min-h-0">
```
`auto-rows-fr` (= `grid-auto-rows: minmax(0,1fr)`) locks rows to the container height;
`min-h-0` overrides the default `min-height:auto` so items respect the locked track.

**Height-stability rule:** for any fixed-height, no-scroll panel layout — definite
height down the whole chain; **grids also need definite rows** (`auto-rows-fr`);
add `min-h-0`/`min-w-0` on flex/grid items that should shrink to their track; put
`overflow` on the **leaf** (card/scroll area), never as the mechanism that caps an
ancestor's height.

### Fix 6 — Shutdown/standby progress screen (smooth, exact duration, living status)
**Goal** A specific total time, a **smooth** fill, and cycling device messages.
- Drive `progress` from elapsed time with `requestAnimationFrame` (≈60fps), one
  `FILL_MS` knob; total ≈ `FILL_MS + hold`. Round the displayed `%`, and **remove
  any CSS `transition` on the bar/ring** (a transition fights per-frame updates).
- Cycle status messages derived from `progress` (no extra timers):
  `stepIndex = Math.floor(progress/100 * STEPS.length)`, render a `key`ed row so
  `animate-fadeIn` re-runs on each change.
```jsx
const FILL_MS = 9500; // 9.5s fill + 0.5s hold = 10s total
const tick = (ts) => {
  if (start === undefined) start = ts;
  const e = ts - start;
  setProgress(Math.min(100, (e / FILL_MS) * 100));
  if (e < FILL_MS) raf = requestAnimationFrame(tick);
  else done = setTimeout(onComplete, 500);
};
```
> ⚠️ The progress **bar colors** must be inline on the panel — see Part C.

### Fix 7 — Landing revamp + theme-matched boot/startup overlay
- Keep an elegant frosted landing card; **extend** it with a multi-step boot overlay
  that shares the same card aesthetic.
- Drive the boot sequence from a `STEP_DURATION`-paced state machine; navigate into
  the room on the **last** step (not a fixed `setTimeout`).
- Animate the boot only with `transform`/`opacity` (panel-friendly).
- Set the startup flags from Fixes 1 & 2 inside the landing "enter" handler.
- ⚠️ All boot-overlay **text/track/fill colors must be inline** on the panel — Part C.

---

## Part C — 🔴 Crestron panel-safe CSS (the hard-won lessons)

The TSW-1070 (and panels like it) render most modern CSS **fine** — `backdrop-filter`,
`filter: blur()`, `mix-blend-mode`, gradients, and `box-shadow` all worked in our
deployment (a frosted card + blurred orbs render correctly). **The real trap is
Tailwind's runtime color utilities:**

| Technique | Renders on panel? | Use instead |
|---|---|---|
| `backdrop-filter`, `filter: blur()`, `mix-blend-mode`, gradients, `box-shadow` | ✅ Yes | Use freely |
| Solid Tailwind colors (`text-white`, `bg-success`, `bg-danger`) | ✅ Yes | Fine |
| `color-mix(in srgb, …)` | ✅ Yes (this firmware) | Keep an `rgba()` fallback for portability |
| **Tailwind slash-opacity utilities** (`text-white/70`, `bg-white/20`, `border-white/30`) | ❌ **Often NOT applied** | **Inline** `style={{ color/backgroundColor/border: 'rgba(...)' }}` |
| **Arbitrary bracket-color classes** (`border-[rgba(...)]`, `bg-[rgba(...)]`) | ❌ **Unreliable** | **Inline** style with plain `rgba()`/hex |

### Why it bites you (and only on the panel)
- The global base sets a **dark** default: `body { color: var(--color-text) }`.
- When a slash-opacity utility (e.g. `text-white/70`) **isn't applied** on the panel,
  the element inherits that dark color → **black text** — even though it looks white
  on your laptop. Same for `bg-white/20` → an **invisible** track/fill.

### The rule
> **For anything that must be visible on the panel — text color, backgrounds, fills,
> tracks, borders — set the color with an inline `style={{}}` using plain `rgba()` or
> hex. Do not rely on Tailwind `/opacity` or `[arbitrary-color]` classes.**

```jsx
// ❌ panel risk:  className="text-white/70"      className="bg-white/20"
// ✅ panel-safe:  style={{ color: "rgba(255,255,255,0.7)" }}   style={{ backgroundColor: "rgba(255,255,255,0.22)" }}
```

### Separation: prefer shadow over a border line
A `box-shadow` renders consistently and looks the same on laptop and panel. A 1–2px
colored **border** can render as a muddy/“orange” band on the panel — avoid it as the
primary separator; use an inline `box-shadow` instead (Fix 3).

### Pre-deploy checklist
- [ ] `grep -rnE "text-(white|black|gray)/[0-9]|bg-(white|black)/[0-9]|border-\["` over `src/` — for any **visible** element, move the color to an inline `style`.
- [ ] Any element whose visibility depends on a Tailwind color → inline `rgba()`/hex.
- [ ] Progress bars/tracks/fills, boot/shutdown text, status chips → inline colors.
- [ ] Navbar/card separation → inline `box-shadow`, not a border line.
- [ ] Keep `color-mix()` only with an `rgba()` fallback before it (portability to other firmware).
- [ ] Sanity test on the panel after **every** deploy of these screens (dev browser ≠ panel).

---

## Apply / verify checklist
- [ ] Fix 1: `<forceDefaultSource>` flag (set on switch + landing enter; consumed + pulsed on mount via a ref in the `useState` initializer).
- [ ] Fix 2: prime `<powerKey>` ON + `<forceOn>` on entry; hold-ON in the status listener; clear `<forceOn>` on manual toggle.
- [ ] Fix 3: `relative z-20` + inline `box-shadow` on the nav (no border line).
- [ ] Fix 4: remove `overflow-hidden` from card **wrapper** divs (keep on cards).
- [ ] Fix 5: opacity-only entry keyframe; `auto-rows-fr` + `min-h-0` on fixed-height grids and stacked-column wrappers.
- [ ] Fix 6: rAF-driven `FILL_MS` fill; round `%`; remove CSS transitions on bar/ring; cycle messages off `progress`.
- [ ] Fix 7: elegant landing + boot overlay sharing one card style; flags set in the enter handler.
- [ ] Part C: **inline colors** for every panel-visible text/bg/fill/border; verify on the panel.
