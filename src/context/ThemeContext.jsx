import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { safeLocalStorage } from '../utils/safeStorage';
import { applyCustomColorToDOM, clearCustomColorFromDOM } from '../utils/colorUtils';

const ThemeContext = createContext();

const STORAGE_KEY_THEME = 'crestron_theme_name';
const STORAGE_KEY_DARK = 'crestron_dark_mode';
const STORAGE_KEY_CUSTOM = 'crestron_custom_color';

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

    // 3. If custom theme, apply custom color variables via inline styles
    if (name === 'custom') {
      try {
        applyCustomColorToDOM(custom);
      } catch (error) {
        console.error('❌ Failed to apply custom theme color:', error);
        // Graceful fallback - stay on default theme
        root.removeAttribute('data-theme');
      }
    }

    // 4. Set dark mode attribute (CSS handles the rest)
    if (dark) {
      root.setAttribute('data-dark-mode', 'true');
    } else {
      root.removeAttribute('data-dark-mode');
    }

    console.log(`🎨 Theme applied: ${name} | Dark: ${dark}${name === 'custom' ? ` | Color: ${custom}` : ''}`);
  }, []);

  // Apply on mount
  useEffect(() => {
    applyThemeToDOM(themeName, isDarkMode, customColor);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Public: Set theme name
  const setThemeName = useCallback((name) => {
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
  }, [applyThemeToDOM]);

  // Public: Toggle dark mode
  const toggleDarkMode = useCallback(() => {
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
  }, [applyThemeToDOM]);

  // Public: Set custom color (auto-switches to 'custom' theme)
  const setCustomColor = useCallback((hex) => {
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
  }, [applyThemeToDOM]);

  return (
    <ThemeContext.Provider
      value={{
        themeName,
        setThemeName,
        isDarkMode,
        toggleDarkMode,
        customColor,
        setCustomColor,
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
