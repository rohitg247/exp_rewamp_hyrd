// ============================================
// COLOR UTILITIES - Ported from theme-generator-final.html
// ============================================

/**
 * Convert hex color to HSL
 * @param {string} hex - Hex color string (e.g., "#004e7a")
 * @returns {{ h: number, s: number, l: number }}
 */
export function hexToHSL(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Convert HSL values to hex color string
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {string} Hex color string
 */
export function hslToHex(h, s, l) {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Generate 10-shade color scale from a base hex color
 * @param {string} hex - Base hex color (used as shade 500)
 * @returns {Object} Shades object { '50': '#...', '100': '#...', ..., '900': '#...' }
 */
export function generateShades(hex) {
  const hsl = hexToHSL(hex);
  const shades = {};
  const baseLightness = hsl.l;

  const targetLightnessMap = {
    50: 96, 100: 90, 200: 80, 300: 65, 400: 55,
    500: null, 600: null, 700: null, 800: null, 900: null
  };

  Object.entries(targetLightnessMap).forEach(([shade, targetLightness]) => {
    if (shade === '500') {
      shades[shade] = hex;
    } else if (parseInt(shade) < 500) {
      shades[shade] = hslToHex(hsl.h, hsl.s, targetLightness);
    } else {
      const darkenFactor = (parseInt(shade) - 500) / 500;
      const newLightness = baseLightness * (1 - darkenFactor * 0.7);
      shades[shade] = hslToHex(hsl.h, hsl.s, Math.max(5, newLightness));
    }
  });

  return shades;
}

/**
 * Validate hex color format
 * @param {string} str - String to validate
 * @returns {boolean}
 */
export function isValidHex(str) {
  return /^#[0-9A-Fa-f]{6}$/.test(str);
}

/**
 * Pick the text colour that stays legible on top of a given background hex,
 * using WCAG relative luminance (not a lightness threshold — lightness ignores
 * how much each channel actually contributes, so saturated yellows and cyans
 * come out wrong).
 * @param {string} hex - Background hex color
 * @returns {string} '#ffffff' or '#111827'
 */
export function readableTextOn(hex) {
  const channel = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const r = channel(parseInt(hex.slice(1, 3), 16));
  const g = channel(parseInt(hex.slice(3, 5), 16));
  const b = channel(parseInt(hex.slice(5, 7), 16));
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  // Contrast against white vs against near-black; take whichever is higher.
  const onWhite = 1.05 / (luminance + 0.05);
  const onDark = (luminance + 0.05) / 0.05;
  return onWhite > onDark ? '#ffffff' : '#111827';
}

/**
 * Apply a custom primary color to the DOM.
 *
 * Sets ONLY the raw --color-primary-50..900 scale plus the two foreground
 * colours that are a function of the picked hue. Every other derived token
 * (--color-primary, --color-heading, --color-bg, ...) is owned by the
 * [data-custom-color="true"] blocks in global.css.
 *
 * Inline styles on the root element outrank every stylesheet rule, so anything
 * written here is invisible to the theme cascade. Writing --color-bg here used
 * to leave dark mode with a pale background under near-white text.
 *
 * @param {string} hex - Primary hex color
 */
export function applyCustomColorToDOM(hex) {
  const root = document.documentElement;
  const shades = generateShades(hex);

  Object.entries(shades).forEach(([shade, color]) => {
    root.style.setProperty(`--color-primary-${shade}`, color);
  });

  // Foregrounds depend on the picked colour, not on the theme, so they stay
  // inline. Hardcoding #ffffff here is what made pale picks unreadable.
  const onPrimary = readableTextOn(shades['500']);
  root.style.setProperty('--color-primary-foreground', onPrimary);
  root.style.setProperty('--color-button-primary-text', onPrimary);
}

/**
 * Remove all custom inline style properties from the root element
 * This restores the CSS stylesheet-defined values
 */
export function clearCustomColorFromDOM() {
  const root = document.documentElement;
  const props = [
    '--color-primary-foreground', '--color-button-primary-text',
    ...['50', '100', '200', '300', '400', '500', '600', '700', '800', '900']
      .map(s => `--color-primary-${s}`),
    // Written by earlier builds — cleared so a panel that ran the old code
    // doesn't keep a stale inline override after an update.
    '--color-primary', '--color-primary-light', '--color-heading',
    '--color-button-secondary-text', '--color-bg',
  ];
  props.forEach(prop => root.style.removeProperty(prop));
}

/**
 * Self-check. Not run by the app — call from a console or a node one-liner:
 *   import('./src/utils/colorUtils.js').then(m => m.demo())
 */
export function demo() {
  const assert = (cond, msg) => { if (!cond) throw new Error(`colorUtils: ${msg}`); };

  const shades = generateShades('#004e7a');
  assert(shades['500'] === '#004e7a', '500 must be the input hex verbatim');
  const lightness = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900']
    .map(s => hexToHSL(shades[s]).l);
  lightness.forEach((l, i) => {
    if (i > 0) assert(l <= lightness[i - 1] + 0.01, `shade scale must darken (broke at index ${i})`);
  });

  assert(readableTextOn('#ffffff') === '#111827', 'white bg needs dark text');
  assert(readableTextOn('#000000') === '#ffffff', 'black bg needs light text');
  assert(readableTextOn('#ffe08a') === '#111827', 'pale yellow needs dark text');
  assert(readableTextOn('#004e7a') === '#ffffff', 'actis blue needs light text');

  assert(isValidHex('#004e7a') && !isValidHex('#04e7a') && !isValidHex('004e7ab'), 'hex validation');

  return 'colorUtils: all checks passed';
}
