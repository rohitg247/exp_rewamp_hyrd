import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { safeLocalStorage } from '../utils/safeStorage';
import { applyCustomColorToDOM, clearCustomColorFromDOM } from '../utils/colorUtils';

const ThemeContext = createContext();

const STORAGE_KEY_THEME = 'crestron_theme_name';
const STORAGE_KEY_DARK = 'crestron_dark_mode';
const STORAGE_KEY_CUSTOM = 'crestron_custom_color';
const STORAGE_KEY_LIQUID = 'crestron_liquid_glass';

export const ThemeProvider = ({ children }) => {
  // Initialize theme name from storage
  const [themeName, setThemeNameState] = useState(() => {
    try {
      return safeLocalStorage.getItem(STORAGE_KEY_THEME) || 'default';
    } catch {
      return 'default';
    }
  });

  // Initialize dark mode from storage
  const [isDarkMode, setIsDarkModeState] = useState(() => {
    try {
      return safeLocalStorage.getItem(STORAGE_KEY_DARK) === 'true';
    } catch {
      return false;
    }
  });

  // Initialize custom color from storage
  const [customColor, setCustomColorState] = useState(() => {
    try {
      return safeLocalStorage.getItem(STORAGE_KEY_CUSTOM) || '#004e7a';
    } catch {
      return '#004e7a';
    }
  });

  // Liquid Glass appearance mode. Deliberately a THIRD attribute rather than a
  // fifth data-theme value: data-theme carries colour and data-dark-mode carries
  // light/dark, so folding glass into either would cost the user their colour
  // choice every time they switched it on. Orthogonal means all themes × dark ×
  // liquid keep working, and off is byte-identical to the pre-liquid UI.
  const [isLiquid, setIsLiquidState] = useState(() => {
    try {
      return safeLocalStorage.getItem(STORAGE_KEY_LIQUID) === 'true';
    } catch {
      return false;
    }
  });

  // 2026-08-06: data-theme-switching drives the crossfade + bloom in global.css.
  // Held only for the length of the transition — a permanent universal colour
  // transition would tax every repaint on the panel.
  const switchTimer = useRef(null);
  // Must be LONGER than --dur-theme (240ms), not equal to it. This attribute is
  // what creates the crossfade; removing it at the exact moment the transition
  // ends means any timer lag strips the rule while colours are still moving,
  // and the remainder snaps. The 80ms buffer guarantees the fade completes.
  const THEME_SWITCH_MS = 320;

  const beginThemeSwitch = useCallback(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme-switching', 'true');
    clearTimeout(switchTimer.current);
    switchTimer.current = setTimeout(() => {
      root.removeAttribute('data-theme-switching');
    }, THEME_SWITCH_MS);
  }, []);

  useEffect(() => () => clearTimeout(switchTimer.current), []);

  // Apply theme to DOM - sets data-theme attribute and data-dark-mode attribute
  const applyThemeToDOM = useCallback((name, dark, custom) => {
    const root = document.documentElement;

    // 1. Clear any previous custom inline styles
    clearCustomColorFromDOM();

    // 2. Set base theme via data-theme attribute
    if (name === 'default' || name === 'custom') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', name);
    }

    // 3. If custom theme, apply the primary scale inline and flag the root so
    //    the [data-custom-color="true"] blocks in global.css can derive the rest
    //    inside the normal cascade (see applyCustomColorToDOM for why).
    if (name === 'custom') {
      try {
        applyCustomColorToDOM(custom);
        root.setAttribute('data-custom-color', 'true');
      } catch (error) {
        console.error('❌ Failed to apply custom theme color:', error);
        // Graceful fallback - stay on default theme
        root.removeAttribute('data-theme');
        root.removeAttribute('data-custom-color');
      }
    } else {
      root.removeAttribute('data-custom-color');
    }

    // 4. Set dark mode attribute (CSS handles the rest)
    if (dark) {
      root.setAttribute('data-dark-mode', 'true');
    } else {
      root.removeAttribute('data-dark-mode');
    }

    console.log(`🎨 Theme applied: ${name} | Dark: ${dark}${name === 'custom' ? ` | Color: ${custom}` : ''}`);
  }, []);

  // Kept OUT of applyThemeToDOM on purpose — that function clears and rewrites
  // data-theme / data-custom-color / data-dark-mode, and liquid must survive
  // every one of those switches untouched.
  const applyLiquidToDOM = useCallback((liquid) => {
    const root = document.documentElement;
    if (liquid) {
      root.setAttribute('data-liquid', 'true');
    } else {
      root.removeAttribute('data-liquid');
    }
  }, []);

  // Apply on mount
  useEffect(() => {
    applyThemeToDOM(themeName, isDarkMode, customColor);
    applyLiquidToDOM(isLiquid);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Public: Set theme name
  const setThemeName = useCallback((name) => {
    beginThemeSwitch();
    try {
      setThemeNameState(name);
      safeLocalStorage.setItem(STORAGE_KEY_THEME, name);
    } catch (error) {
      console.warn('⚠️ Error saving theme to storage:', error);
      setThemeNameState(name);
    }
    // Use current state values for dark and custom via functional update pattern
    setIsDarkModeState(prevDark => {
      setCustomColorState(prevCustom => {
        applyThemeToDOM(name, prevDark, prevCustom);
        return prevCustom;
      });
      return prevDark;
    });
  }, [applyThemeToDOM, beginThemeSwitch]);

  // Public: Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    beginThemeSwitch();
    setIsDarkModeState(prevDark => {
      const newDark = !prevDark;
      try {
        safeLocalStorage.setItem(STORAGE_KEY_DARK, String(newDark));
      } catch (error) {
        console.warn('⚠️ Error saving dark mode to storage:', error);
      }
      setThemeNameState(prevTheme => {
        setCustomColorState(prevCustom => {
          applyThemeToDOM(prevTheme, newDark, prevCustom);
          return prevCustom;
        });
        return prevTheme;
      });
      return newDark;
    });
  }, [applyThemeToDOM, beginThemeSwitch]);

  // Public: Set custom color (auto-switches to 'custom' theme)
  const setCustomColor = useCallback((hex) => {
    beginThemeSwitch();
    try {
      setCustomColorState(hex);
      safeLocalStorage.setItem(STORAGE_KEY_CUSTOM, hex);
      setThemeNameState('custom');
      safeLocalStorage.setItem(STORAGE_KEY_THEME, 'custom');
    } catch (error) {
      console.warn('⚠️ Error saving custom color to storage:', error);
      setCustomColorState(hex);
      setThemeNameState('custom');
    }
    setIsDarkModeState(prevDark => {
      applyThemeToDOM('custom', prevDark, hex);
      return prevDark;
    });
  }, [applyThemeToDOM, beginThemeSwitch]);

  // Public: Toggle Liquid Glass appearance
  const toggleLiquid = useCallback(() => {
    beginThemeSwitch();
    setIsLiquidState(prev => {
      const next = !prev;
      try {
        safeLocalStorage.setItem(STORAGE_KEY_LIQUID, String(next));
      } catch (error) {
        console.warn('⚠️ Error saving liquid glass mode to storage:', error);
      }
      applyLiquidToDOM(next);
      console.log(`🫧 Liquid Glass ${next ? 'ON' : 'OFF'}`);
      return next;
    });
  }, [applyLiquidToDOM, beginThemeSwitch]);

  return (
    <ThemeContext.Provider
      value={{
        themeName,
        setThemeName,
        isDarkMode,
        toggleDarkMode,
        customColor,
        setCustomColor,
        isLiquid,
        toggleLiquid,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
