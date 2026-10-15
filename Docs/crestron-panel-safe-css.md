# Crestron panel-safe CSS — TSW-1070

> **Target hardware: TSW-1070.** Not the TSW-770, not the x60 series, not a desktop
> browser running WebXPanel. Where panel correctness and dev-browser convenience
> disagree, the panel wins.
>
> **Supersedes both earlier versions of this file.** The first claimed panels "have no
> GPU" and therefore drop `backdrop-filter` / `filter: blur()` / soft `box-shadow`. The
> second corrected that but asserted `color-mix()` "renders correctly on the TSW-1070".
> **The second was wrong about `color-mix`, and both were wrong about the reason.** The
> engine version below comes from Crestron's own manifest rather than from how things
> looked on screen.

## The engine

From the x70 application manifest — the file the panel reads on boot
([manifest_x70_apps.json](https://crestrondevicefiles.blob.core.windows.net/70-series/production/applications/manifest_x70_apps.json)).
The `TS*1070` rows are the TSW-1070's:

| Package | Version |
|---|---|
| `org.chromium.chrome` | **100.0.4896.79** |
| `com.crestron.webview` | 3.0 |

Two things that matter when re-checking this later:

- From firmware **2.004.0033** the Chrome browser is no longer part of the firmware image
  and is downloaded from Crestron's auto-update server during boot. The engine therefore
  tracks **that manifest**, not the firmware version — re-read the manifest, don't assume.
- The x60 release notes record "Upgraded Webview to version **87**", which is the floor for
  the Android System WebView that `com.crestron.webview` wraps.

**So: Chromium 87 ≤ engine ≤ 100. Write CSS to 87.**

Confirm it on the unit rather than arguing about it: **Settings → Debug (bug icon) →
Viewport** prints `navigator.userAgent` and a live `CSS.supports()` row per feature. Put the
real numbers back into this file once you have read them off the hardware.

## What the panel does not support

| Feature | Needs | On the TSW-1070 |
|---|---|---|
| `color-mix()` | Chromium 111 | ❌ **never paints** |
| `oklch()` / `lab()` | 111 | ❌ |
| CSS nesting | 112 | ❌ |
| `:has()` | 105 | ❌ |
| Container queries (`@container`) | 105 | ❌ |
| `text-wrap: balance` | 114 | ❌ |
| `scrollbar-gutter` | 94 | ⚠️ fails at 87, works at 100 |
| `aspect-ratio` | 88 | ⚠️ fails at 87 by one version — use `.ratio-16x9` |
| `:is()` / `:where()` | 88 | ⚠️ same band; Tailwind emits these for some variants |
| `backdrop-filter`, `filter: blur()`, `mix-blend-mode`, `box-shadow`, gradients | ≤76 | ✅ |
| `inset:` shorthand, `@property`, flex `gap`, `clamp()`, `:focus-visible`, `overscroll-behavior` | ≤87 | ✅ |

## Why these failures are silent

A `color-mix()` value is **accepted** when a custom property is declared — custom properties
take almost any token list. The failure happens at **substitution**, in the property that
consumes it, which becomes invalid-at-computed-value-time and falls back to its **initial**
value: `background-image: none`, `background-color: transparent`. Nothing errors. A surface
just quietly flattens, and only on the panel.

That is what made the previous version of this file wrong: the affected surfaces sat over a
`background-color` that *was* painting, so they looked approximately right.

## The rules

### 1. Translucency over a theme colour → `--rgb-*` triplet + `rgba()`

`global.css` declares every theme colour a second time as bare `r, g, b` channels, once per
theme block (`:root`, `[data-theme="blue-dark"]`, `[data-theme="purple"]`,
`[data-theme="dark-blue"]`, and the `[data-dark-mode="true"]` combinations). Compose the
alpha at the use site:

```css
/* ❌ never paints on the panel */
color-mix(in srgb, var(--color-primary-200) 22%, transparent)
/* ✅ works at Chromium 87, follows every theme */
rgba(var(--rgb-primary-200), 0.22)
```

This also works inline in JSX, which `color-mix` never could safely — a style object holds
one value per key, so it has nowhere to put a fallback.

Mixing two **opaque** colours is the same arithmetic as compositing the first at that alpha
over the second, so `color-mix(A 22%, B)` → `rgba(var(--rgb-A), 0.22)` wherever B is the
surface the element already sits on (which is why B was chosen in the first place).

A mix toward **white** is a lightening, so the veil goes the other way — a white layer *over*
the theme colour:

```css
/* was: color-mix(in srgb, var(--color-bg-secondary) 60%, white) */
background: linear-gradient(rgba(255,255,255,0.4), rgba(255,255,255,0.4)), var(--color-bg-secondary);
```

**Adding a theme?** Add its `--rgb-*` block too, or that theme silently inherits another's
tints. The custom colour picker is handled in [colorUtils.js](../src/utils/colorUtils.js):
`applyCustomColorToDOM()` writes the triplets inline beside the scale, and the
`[data-custom-color]` blocks derive the `--rgb-primary` alias so it follows dark mode.

### 2. Never reference an alias token in new CSS

Use the numbered step that holds the literal hex:

```css
var(--color-primary-400)   ✅     var(--color-primary)   ❌  (= var(--color-primary-500))
var(--color-success-500)   ✅     var(--color-success)   ❌  (= var(--color-success-500))
var(--color-danger-500)    ✅     var(--color-accent)    ❌  (= var(--color-danger-500))
```

[ShutdownScreen.jsx](../src/components/ShutdownScreen.jsx) documents this from the device: the
`bg-danger` class resolved through `--color-accent` → `--color-danger-500` and the bar painted
nothing. Note the related trap in `var(--color-success, #10b981)` — a CSS fallback only fires
when the property is **undefined**, and `--color-success` *is* defined, so it never runs.

### 3. Visible colour: no Tailwind slash-opacity, no bracket colours

| Technique | Panel | Use instead |
|---|---|---|
| `text-white/70`, `bg-white/20`, `border-white/30` | ❌ often not applied | inline `style={{ color: "rgba(255,255,255,0.7)" }}` |
| `bg-[rgba(...)]`, `border-[rgba(...)]` | ❌ unreliable | inline `style={{}}` with `rgba()`/hex |
| Solid utilities (`text-white`, `bg-primary`) | ✅ renders | fine |

Worth knowing: this project is on **Tailwind 3.4.17**, where `bg-white/20` compiles to plain
`rgb(255 255 255 / 0.2)` — supported since Chromium 65. Slash-opacity is therefore *not* an
engine limitation here; whatever breaks it is build- or specificity-related. The inline rule
stands either way, because it is what has been observed on the hardware.

Why it is so visible when it fails: `body { color: var(--color-text) }` is dark, so an
unapplied text colour inherits that and you get **black text on a dark panel**, and an
unapplied `bg-white/20` track goes **invisible**. On the laptop the utility works, so you
never see it in dev.

### 4. Height-driven 16:9 → `.ratio-16x9`

`aspect-ratio` needs 88. A height-driven ratio cannot use the padding-percentage trick
(percentage padding resolves against *width*), so `.ratio-16x9` carries `aspect-ratio` for
modern engines and, behind `@supports not (aspect-ratio: 16 / 9)`, an inline-SVG `::before`
whose intrinsic ratio resolves its own width at `height: 100%`.

### 5. Separation: shadow, not a border line

Use an inline `box-shadow` (e.g. `0 6px 14px -2px rgba(0,0,0,0.45)`) for navbar/card
separation. A thin coloured **border** can render as a muddy orange band on the panel, so
avoid it as the primary separator.

### 6. No hover

A tap fires `mousedown` then `mouseup`, and `mouseleave` often never arrives, so a hover
state can stick. Drive press feedback from `:active` — see `.gloss-sweep:active::after` and
`.landing-enter-btn-subtle:active::before`.

## Pre-deploy checklist

- [ ] `grep -rn "color-mix" src/` → no hits outside the Settings probe string.
- [ ] `grep -rn "var(--color-primary)\|var(--color-success)\|var(--color-accent)" src/` → no
      hits in anything you added.
- [ ] `grep -rnE "text-(white|black|gray)/[0-9]|bg-(white|black)/[0-9]|border-\[" src/` →
      inline every **visible** colour.
- [ ] Progress bars/tracks/fills, boot/shutdown text, status chips → inline colours.
- [ ] Any new theme block carries its own `--rgb-*` tints.
- [ ] All four themes × dark mode × the custom picker × liquid glass, checked on hardware.
- [ ] Re-test on the panel after every deploy. The dev browser is Chromium 13x and will
      happily render things the panel cannot.

## Related

- [TOUCHPANEL-BREAKPOINT.md](../TOUCHPANEL-BREAKPOINT.md) — why the `touchPanel:` Tailwind
  variant never matches, and the 1.5× scaling that puts the panel in the `xl` tier.
- [ui-startup-fixes-generic.md](./ui-startup-fixes-generic.md) — Part C, the original
  hard-won lessons.
