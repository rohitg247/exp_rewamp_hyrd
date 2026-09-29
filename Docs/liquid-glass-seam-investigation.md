# Liquid glass: navbar/sidebar fixes + open seam bug

Branch: `boardroom-ver-liquid-glass` · 2026-09-29

## Fixed

| Issue | Cause | Change |
|---|---|---|
| Centre navbar capsule cut off at the bottom (liquid mode only) | `margin-block: -0.375rem` on `.ui-nav-cluster` (global.css) pulls the capsule 6px outside its wrapper, and the wrapper had `overflow-hidden`. The Shutdown cluster has no such wrapper, so it was fine. | `Navbar.jsx`: removed `overflow-hidden` from the centre wrapper and kept `min-w-0` |
| Speaker card in the sidebar misaligned with the page cards | Navbar was `min-h-[72px]` and grew to ~76px on laptop, but the sidebar (`top-[72px]`) and pages (`h-[calc(100vh-72px)]`) assume exactly 72/110px. Sidebar `pt-7 pb-5` was hiding the difference. | `Navbar.jsx`: `min-h-[72px] touchPanel:min-h-[110px]` → `h-[72px] touchPanel:h-[110px]`. `Sidebar.jsx`: padding is now `p-6 touchPanel:p-8`, the same as the pages |
| Grain layer painted over the whole app in liquid mode | `[data-liquid="true"] body::after` had `z-index: 0` with `mix-blend-mode: overlay` | `global.css`: `z-index: -1` (grain now sits under the app). Not the seam cause, but harmless; keep or revert |

Reverted: the "no backdrop-filter on buttons/toggles inside `.ui-card`" rule was tried and then removed.

## Open: vertical brightness seam inside cards

**Symptom:** a straight vertical line through the cards, lighter on the left and darker on the right. It sits at the same x in stacked cards (Mics and Global Display on the Main page) and passes through translucent buttons ("All OFF"). Liquid mode only. Seen on laptop Chrome.

**Ruled out:**
- Grain overlay: hiding `body::after` did not remove it.
- Mesh attachment: `background-attachment: scroll` on `body` did not remove it.
- Every gradient in the card layers (`--gloss-specular`, `--surface-glass`, `--surface-tint-soft`, `.gloss-sweep`, `.sheen-once`, Card.jsx rail/overlay) fades smoothly with no hard stops.

**Current theory:** Chrome draws `backdrop-filter` blur in GPU tiles. At fractional Windows display scaling (125%/150%) the tile edges show as seams. It may not appear on the TSW panel.

**Next steps if it shows on the TSW:**
1. Press F5, then in the Console turn off the glass blur:
   `document.head.insertAdjacentHTML('beforeend','<style id="t2">.ui-card,.ui-btn{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}</style>')`
   If the seam goes away, it's the blur. Lower `--liquid-blur` or drop the blur on cards.
2. Press F5, then remove the mesh: `document.body.style.backgroundImage = 'none'`. If the seam goes away, the mesh has the edge.
3. If neither removes it, read `MicrophoneControl` / `GlobalDisplayControl`.
4. Laptop only: check the Windows display scale and Chrome zoom (Ctrl+0 = 100%).
