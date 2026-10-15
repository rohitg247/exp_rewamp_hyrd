# The `touchPanel:` breakpoint is dead — and that is deliberate

> **Read this before you "fix" the typo in `tailwind.config.js`.** Fixing it accomplishes
> nothing, for the reason in §2. The variant is dead twice over.

Target hardware: **TSW-1070**.

## 1. The line

`tailwind.config.js` → `theme.extend.screens`:

```js
'touchPanel': {
  'raw': '(min-width: 1910px) and (ipadmin-height: 1190px)'
},
```

`ipadmin-height` is not a CSS media feature. Per the Media Queries spec, a condition
containing an unknown feature evaluates to **false for the whole query** — the browser does
not skip the bad term, it discards the condition. The query never matches, and every
`touchPanel:` utility in this project is inert.

## 2. Fixing the typo would change nothing

**Corrected 2026-10-15.** An earlier version of this file said the panel "reports 1920×1200
CSS px with `width=device-width`, so it *would* satisfy `(min-width: 1910px) and
(min-height: 1190px)`". That was wrong.

1920×1200 is the TSW-1070's **device** resolution. The panel renders at **1.5× scale**, so the
**CSS viewport is 1280×800**. `min-width: 1910px` can never be satisfied, whatever the feature
name is.

So the variant is dead for two independent reasons: an invalid media feature **and** an
unreachable width.

**What this means in practice:** at 1280×800 the panel sits exactly on the **`xl`** tier
(1280px), so `sm:` / `md:` / `lg:` / `xl:` are the breakpoints actually sizing the UI. That is
why the iPad-oriented sizing reads correctly on the hardware — it is the same viewport class.

Verify on the unit: **Settings → Debug (bug icon) → Viewport** prints `window.innerWidth` /
`innerHeight`, `devicePixelRatio`, both breakpoint probes, and an ACTIVE/INERT verdict for
`touchPanel:` using the query string copied verbatim from the config. Record the measured
`devicePixelRatio` here once read.

## 3. Current consequence

The panel renders with the **base / `md:` / `lg:` / `xl:`** classes throughout, never the
`touchPanel:` ones. **The panel build was signed off in exactly this state**, so the base
sizing *is* the approved look. Turning the variant on would be a visual change to every page,
not a bug fix.

## 4. Blast radius if someone "fixes" it

```bash
grep -ro "touchPanel:" src/ | wc -l   # 801 occurrences
grep -rl "touchPanel:" src/ | wc -l   #  38 files
```

Font sizes, icon sizes, gaps, padding, card heights, stroke widths and the page-root height
maths would all change at once, the moment the query started matching.

## 5. If you genuinely want panel-specific sizing

Correcting `ipadmin-height` → `min-height` is **not** enough — see §2. A working query would
have to target the real CSS viewport, e.g. `(min-width: 1280px) and (min-height: 790px)`,
which also catches ordinary laptops and most tablets in landscape. At that point the variant
is no longer "the panel" and the honest answer is probably to **retire it** and fold the
intended sizes into the standard `xl:` tier.

That is a judgement call for whoever picks this up, not a recommendation to act now. Either
way it needs panel time booked: deploy, walk every page (Landing, Main, Room Controls, AV
Matrix, Audio, Cafe, Settings, Engineering) looking for clipped cards, overflowing grids and
text that no longer fits its button, then re-sign off the look. The dev browser at 1920×1080
fails the height term and will tell you nothing.

## 6. Decision

**2026-10-15 — left as-is, on purpose.** The panel build is in service and looks correct, the
only gain is cosmetic, and the cost is a full re-validation of every page on the hardware.
Documented here instead of silently "corrected".

## Related

- [Docs/crestron-panel-safe-css.md](Docs/crestron-panel-safe-css.md) — the Chromium 87-100
  engine baseline and what CSS the panel actually supports.
- [Docs/ui-startup-fixes-generic.md](Docs/ui-startup-fixes-generic.md)
