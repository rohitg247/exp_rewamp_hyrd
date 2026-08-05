# Change log — Boardroom control UI

This project is **not in git yet**, so this file is the change history. Newest entry first.
Each entry records what the code looked like **before**, what it looks like **after**, and why.

---

## 2026-08-03 — Premium UI revamp (visual pass) + lint cleanup

**Asked for:** a revamp that reads premium and holds the eye — glassmorphism, gradients,
effects beyond a plain gaussian blur — plus a coloured fill bar across the top of each card.
Crestron joins explicitly out of scope. Target hardware: **TSW-1070, 1920×1200**.

**Safety net:** no git repo here, so the full pre-change `src/` + `tailwind.config.js` were copied to
`.revamp-backup-2026-08-03/` (87 files). To roll back, copy that folder back over `src/`.

### Design language added

| Effect | Why it earns its place | Cost on panel |
|---|---|---|
| **Accent rail** — 4px gradient bar on the top edge of a card, hue per category | Control zone is identifiable from across the room without reading labels | Free (one gradient) |
| **Static glass** — layered gradient + specular top hairline, *no* backdrop-filter | Reads as glass without paying live-blur cost on six cards at once | Free |
| **Real backdrop-filter** — navbar + modal only | Genuine depth where content passes behind a surface, bounded to ≤2 elements | Bounded |
| **Gradient mesh backdrop** (`.page-mesh`) | Cards sit *on* something instead of floating on a flat tone | Free, static |
| **Paper grain** (SVG `feTurbulence`, 4.5–5.5%) | Kills gradient banding, very visible at 1920×1200; reads as print, not web | Free, no repaint |
| **Elevation ramp** (`--elev-rest/-raised/-pressed`) | One depth story; previously every card picked its own `shadow-lg/xl/2xl` | Free |
| **Icon plate** (`CardIcon`) | Anchors the card title and carries the category hue | Free |
| **Press physics** (`.press-fx`, 120 ms) | Touch panels need instant tactile feedback; it was inconsistent before | Free |
| **Specular sweep** (`.sheen-once`) | Confirms a command landed without a toast; transform+opacity only | Cheap |

Deliberately avoided: heavy multi-layer gaussian blur, animated backdrops, per-frame filters —
the things most likely to stutter on panel hardware.

### Files changed

**`src/styles/global.css`** — *added, changed nothing existing*
- **Before:** theme blocks only (`:root`, 3 `[data-theme]`, 3 dark-mode combinations).
- **After:** a new dated token block after the theme blocks: `--elev-rest/-raised/-pressed`,
  `--surface-glass`, `--surface-hairline`, `--surface-edge`, `--overlay-glass`, `--overlay-blur`,
  `--rail-from/-to/-height`, `--mesh-bg`, `--grain`, `--grain-opacity`, `--ease-snap/-smooth`,
  `--dur-press/-smooth`. Plus utilities `.page-mesh`, `.press-fx`, `.sheen-once` and a
  `prefers-reduced-motion` block.
- **Why derived, not per-theme:** every token references the existing `--color-*` vars, so all four
  themes re-derive automatically. Only the four **dark** surfaces override (a white 0.9 hairline on a
  dark card reads as a chalk line): `[data-theme="blue-dark"]`, `[data-dark-mode="true"]`,
  `[data-theme="purple"][data-dark-mode="true"]`, `[data-theme="dark-blue"][data-dark-mode="true"]`.

**`tailwind.config.js`**
- **Before:** `boxShadow` had `navbar`, `navbar-elegant`, `nav-button`, `theme`.
- **After:** + `rest`, `raised`, `pressed` mapped to the elevation tokens. Nothing removed.

**`src/components/ui/Card.jsx`** — rewritten
- **Before:** `glass` variant used `bg-[radial-gradient(...)]` + `backdrop-blur-sm` +
  **`border-white/70`**. Three dead commented-out variants (`gradient`, `gradientone`) — verified
  unused; only `default` and `glass` are called anywhere.
- **After:** surfaces set via inline `style`, new optional `tone` prop draws the accent rail, new
  `interactive` prop opts into press physics, new exported `CardIcon`. Dead variants deleted.
- **🔴 Bug fixed:** `border-white/70` is slash-opacity — documented in
  `Docs/crestron-panel-safe-css.md` as **not applying on the panel**. Every glass card's edge was
  missing on the TSW-1070 while looking fine on the laptop.

**`src/components/ui/Button.jsx`**
- **Before:** `shadow-md hover:shadow-lg active:scale-95`; `secondary`/`ghost` used
  `bg-[var(--color-bg-secondary)]` (arbitrary bracket colour).
- **After:** elevation tokens + `.press-fx`; the `secondary` surface set inline. **API unchanged** —
  no caller edited.

**`src/components/ui/Modal.jsx`**
- **Before:** backdrop `bg-black bg-opacity-50`; container default
  `containerClassName='bg-[var(--color-bg-secondary)]'`; header divider
  `border-b border-[var(--color-border)]`; no dialog semantics.
- **After:** backdrop inline `rgba(2,6,23,0.55)` + 6px blur; container is overlay glass with the
  elevation ramp; divider set inline; added `role="dialog"`, `aria-modal="true"`, `aria-label`.
  Verified no caller passes `containerClassName`, so the default change is safe.

**`src/components/layout/Navbar.jsx`**
- **Before:** `bg-[var(--color-bg-secondary)]`, plain drop shadow, icon-only buttons with `title` but
  no accessible name.
- **After:** overlay glass (real `backdrop-filter` + saturate), specular top edge added to the
  existing shadow, `aria-label` on the four icon-only buttons (Settings, dark-mode, palette, info).

**`src/pages/MainPage.jsx`** — root gets `.page-mesh`; the six cards get category rails and icon
plates: Mics/Speakers `audio`, Source Selection `video`, Lighting `lighting`, Climate `climate`,
Drapes `neutral`. Grid geometry, `touchPanel:` breakpoints and the sidebar offset untouched.

**`src/pages/LandingPage.jsx`** — deliberately **not** rewritten; it was already panel-verified
premium (inline rgba, frosted card, orbs, grid). Added only: a grain layer on both the landing and
the boot overlay, and **fixed two `shadow-success/50`** slash-opacity glows (status dot + boot chip)
that were silently dropping their halo on the panel.

**`RoomControlsPage` / `AudioControlsPage` / `AVMatrixPage` / `CafePage` / `SettingsPage`** —
`.page-mesh` on each root; `tone` on every card (lighting/neutral/video, audio ×4, video ×3,
brand+climate, video+neutral). RoomControls titles also got icon plates. No logic touched.

**`src/components/modals/EditMenuModal.jsx`** — reported as "doesn't blend with the theme"
- **Root cause:** the list container was `bg-gray-50` and the item rows `bg-secondary`. In every
  theme those resolve to near-identical values — **identical in dark mode** (`#1e293b` both) — so the
  whole list read as one flat blob with no depth. The count chip was `bg-gray-100 text-gray-400`
  (~2.6:1 contrast, fails WCAG AA).
- **After:** container is a recessed *well* (`--color-bg` + `--elev-pressed` + edge ring); rows are
  raised glass surfaces sitting on it; count chip is a primary-tinted badge; keyboard panel uses the
  same well with a primary ring instead of a 2px border (thick borders band on the panel);
  `text-gray-400` → `text-muted-foreground`. Added `aria-label` (`Edit <item>` / `Delete <item>`) to
  the icon-only row buttons, which previously had **no accessible name at all**.

### 🔴 Panel-safety audit (per `Docs/crestron-panel-safe-css.md`)

- **`--color-text-muted` was never defined in any theme.** 6 usages across `LightingControl.jsx`,
  `SourceSelection.jsx`, `ErrorBoundary.jsx` silently fell back to full-strength body text instead of
  the muted colour. Corrected to the real token, `--color-text-light`. Pre-existing bug.
- `LayoutApplyBar.jsx` — `text-white/70` on the "Applying…" label → inline `rgba`. On the panel this
  inherited the dark body colour, i.e. black text on the blue progress fill.
- `EngineeringPage.jsx` — same slash-opacity failure on the reboot countdown → inline.
- `AVMatrixPage.jsx` — two `hover:bg-white/20` clear-route buttons → inline hover handlers.
- **Still outstanding (not changed):** ~35 `bg-[var(--…)]` / `text-[var(--…)]` arbitrary-bracket
  colours across device components. They evidently render today, so they were left alone rather than
  churned. If any of them ever goes black-on-dark on the panel, this is the first place to look.

### Lint

- **Before:** `npm run lint` → **987 problems (963 errors)** — it has never been clean.
- **After:** **0 errors, 10 warnings**, exit code 0.
- `eslint.config.js`: ignore `dist`, `.revamp-backup-*`, and the abandoned `* copy*.jsx` duplicates;
  `react/prop-types` **off** (615 of the errors — this codebase has never used runtime prop
  validation, `prop-types` isn't even a dependency, and it's deprecated in React 19; it flagged zero
  real defects); `no-irregular-whitespace` configured with `skipStrings/Templates/JSXText/Comments`
  so intentional `&nbsp;` in content stays legal while code-level irregular whitespace is still an
  error.
- Real fixes: 135 non-breaking spaces used as **indentation** in `Toggle.jsx` normalised; ~27 unused
  imports/variables removed (`React` imports left over from pre-jsx-runtime, unused lucide icons,
  `MOCK_DEVICES`, dead `handleSupportClick`, etc.); one unescaped apostrophe in `UnderDevelopment`.
- The 10 remaining warnings are `react-hooks/exhaustive-deps` (7) and
  `react-refresh/only-export-components` (3). **Left alone on purpose** — adding those deps changes
  effect re-run behaviour on hardware that talks to a live processor, which is not a cosmetic change.

### Verification

- ✅ `npm run build` — passes, 22.6s.
- ✅ `npm run lint` — 0 errors.
- ⬜ **Hardware pass is yours** — the dev browser is not the panel. On the TSW-1070 check: card edges
  and rails visible in **all four themes** (`Alt+1..4`) and dark mode (`Alt+D`); no black-on-dark
  text; navbar separation reads as a shadow, not a band; grain doesn't soften text (if it does, lower
  `--grain-opacity`); touch response still immediate; no page scrolls.

### Not done

- The 9+ abandoned `* copy*.jsx` duplicates are **still on disk**, now lint-ignored. Say the word and
  they get deleted.
- Emergent AI was requested for this work but is unusable: its MCP server is registered yet
  unauthenticated (needs `/mcp` OAuth), the official plugin marketplace has **no** `emergent` plugin,
  and it builds new apps in a cloud sandbox rather than editing local CH5 source.
