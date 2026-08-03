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
 * Apply a custom primary color to the DOM by setting CSS custom properties
 * Generates full shade scale and updates all primary-related variables
 * @param {string} hex - Primary hex color
 */
export function applyCustomColorToDOM(hex) {
  const root = document.documentElement;
  const shades = generateShades(hex);

  // Apply primary shade scale
  Object.entries(shades).forEach(([shade, color]) => {
    root.style.setProperty(`--color-primary-${shade}`, color);
  });

  // Update derived primary variables
  root.style.setProperty('--color-primary', shades['500']);
  root.style.setProperty('--color-primary-light', shades['50']);
  root.style.setProperty('--color-primary-foreground', '#ffffff');
  root.style.setProperty('--color-heading', shades['500']);
  root.style.setProperty('--color-button-primary-text', '#ffffff');
  root.style.setProperty('--color-button-secondary-text', shades['500']);

  // Generate a background from primary-200
  root.style.setProperty('--color-bg', shades['200']);
}

/**
 * Remove all custom inline style properties from the root element
 * This restores the CSS stylesheet-defined values
 */
export function clearCustomColorFromDOM() {
  const root = document.documentElement;
  const props = [
    '--color-primary', '--color-primary-light', '--color-primary-foreground',
    '--color-heading', '--color-button-primary-text', '--color-button-secondary-text',
    '--color-bg',
    ...['50', '100', '200', '300', '400', '500', '600', '700', '800', '900']
      .map(s => `--color-primary-${s}`)
  ];
  props.forEach(prop => root.style.removeProperty(prop));
}
