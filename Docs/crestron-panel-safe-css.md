# Crestron Panel-Safe CSS — quick reference (CORRECTED)

> ⚠️ **Correction (supersedes the earlier version of this file).**
> An earlier draft claimed Crestron panels have "no GPU" and therefore drop
> `backdrop-filter` / `filter: blur()` / soft `box-shadow`. **Deployment on the
> TSW-1070 disproved that** — frosted cards (`backdrop-filter` + `rgba`), blurred
> orbs, `mix-blend-mode`, and `box-shadow` all render correctly on the panel.
>
> The **real** issue is narrower and is documented in full in
> [ui-startup-fixes-generic.md → Part C](./ui-startup-fixes-generic.md#part-c--🔴-crestron-panel-safe-css-the-hard-won-lessons).

## What actually breaks on the panel
**Tailwind's runtime color utilities** — not the visual effects:

| Technique | Panel | Use instead |
|---|---|---|
| `backdrop-filter`, `filter: blur()`, `mix-blend-mode`, gradients, `box-shadow` | ✅ renders | use freely |
| Solid Tailwind colors (`text-white`, `bg-success`, `bg-danger`) | ✅ renders | fine |
| `color-mix(in srgb, …)` | ✅ renders | keep an `rgba()` fallback for portability |
| **slash-opacity** (`text-white/70`, `bg-white/20`, `border-white/30`) | ❌ often not applied | **inline** `style={{ … }}` with `rgba()` |
| **arbitrary bracket colors** (`border-[rgba(...)]`, `bg-[rgba(...)]`) | ❌ unreliable | **inline** `style={{ … }}` with `rgba()`/hex |

## Why it only shows on the panel
`body { color: var(--color-text) }` is **dark**. When a slash-opacity class isn't
applied on the panel, the element inherits that dark color → **black text**; a
`bg-white/20` track → **invisible**. On the laptop the utility works, so you never
see it in dev.

## The rule
> For anything that must be visible on the panel — **text color, background, fill,
> track, border** — set it with an **inline `style={{}}`** using plain `rgba()`/hex.
> Do not rely on Tailwind `/opacity` or `[arbitrary-color]` classes.

```jsx
// ❌ panel risk           // ✅ panel-safe
className="text-white/70"   style={{ color: "rgba(255,255,255,0.7)" }}
className="bg-white/20"     style={{ backgroundColor: "rgba(255,255,255,0.22)" }}
```

## Separation: shadow, not a border line
Use an inline `box-shadow` (e.g. `0 6px 14px -2px rgba(0,0,0,0.45)`) for navbar/card
separation. A thin colored **border** can render as a muddy/“orange” band on the
panel — avoid it as the primary separator.

## Pre-deploy checklist
- [ ] `grep -rnE "text-(white|black|gray)/[0-9]|bg-(white|black)/[0-9]|border-\[" src/` → inline every **visible** color.
- [ ] Progress bars/tracks/fills, boot/shutdown text, status chips → inline colors.
- [ ] Navbar/card separation → inline `box-shadow`, not a border.
- [ ] `color-mix()` only with an `rgba()` fallback before it.
- [ ] Re-test on the panel after every deploy (dev browser ≠ panel).
