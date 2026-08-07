// src/components/modals/ColorPickerModal.jsx
// 2026-08-06 UI revamp: preset swatches added, error state moved onto the danger
// tokens (it was hardcoded red-50/red-700 and unreadable in dark mode), and the
// bracket-value utilities replaced with inline styles — arbitrary Tailwind values
// silently fail to paint on the TSW-1070. See Docs/crestron-panel-safe-css.md.
import { useState, useEffect } from 'react';
import { RotateCcw, Check } from 'lucide-react';
import Modal from '../ui/Modal';
import OnScreenKeyboard from '../ui/OnScreenKeyboard';
import Button from '../ui/Button';
import { generateShades, isValidHex, readableTextOn } from '../../utils/colorUtils';
import { useTheme } from '../../context/ThemeContext';

const SHADE_KEYS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];

// Mid-dark tones only: each has to carry white or near-black text as a button
// fill AND still generate a usable 50..900 ramp. Pastels don't survive that.
const PRESETS = [
  { name: 'Actis Blue', hex: '#004e7a' },
  { name: 'Azure', hex: '#0369a1' },
  { name: 'Teal', hex: '#0f766e' },
  { name: 'Emerald', hex: '#047857' },
  { name: 'Indigo', hex: '#4338ca' },
  { name: 'Violet', hex: '#6d28d9' },
  { name: 'Amber', hex: '#b45309' },
  { name: 'Slate', hex: '#334155' },
];

const ColorPickerModal = ({ isOpen, onClose }) => {
  const { customColor, setCustomColor, setThemeName, themeName } = useTheme();
  const [inputValue, setInputValue] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(false);

  // Reset input when modal opens
  useEffect(() => {
    if (isOpen) {
      setInputValue(customColor || '#004e7a');
      setShowKeyboard(false);
    }
  }, [isOpen, customColor]);

  const hexValid = isValidHex(inputValue);
  const previewShades = hexValid ? generateShades(inputValue) : null;

  // Get current active theme's primary color for Before/After comparison
  const currentPrimary = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-primary-500').trim() || '#004e7a';
  const currentShades = isValidHex(currentPrimary) ? generateShades(currentPrimary) : null;

  const handleKeyboardInput = (newValue) => {
    // Ensure # prefix is maintained
    if (!newValue.startsWith('#')) {
      newValue = '#' + newValue.replace(/#/g, '');
    }
    // Limit to 7 chars (#RRGGBB)
    if (newValue.length <= 7) {
      setInputValue(newValue);
    }
  };

  const handleApply = () => {
    if (hexValid) {
      setCustomColor(inputValue);
      onClose();
    }
  };

  const handleReset = () => {
    setThemeName('default');
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  // A picked colour can be any hue at any lightness, so the strips need their own
  // frame — without it a pale pick bleeds into a light card and a dark pick
  // bleeds into a dark one.
  const stripFrame = {
    boxShadow: 'var(--surface-edge), var(--surface-hairline)',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Customize Theme Color"
      maxWidth="max-w-[75%]"
      maxHeight="95vh"
    >
      {/* Preset swatches — the primary path. Typing hex on a wall panel is the
          fallback, not the default. */}
      <div className="mb-5">
        <p className="text-sm font-medium text-foreground mb-2">Presets</p>
        <div className="flex flex-wrap gap-3 touchPanel:gap-4">
          {PRESETS.map(({ name, hex }) => {
            const selected = inputValue.toLowerCase() === hex.toLowerCase();
            return (
              <button
                key={hex}
                type="button"
                onClick={() => setInputValue(hex)}
                aria-label={`${name}, ${hex}`}
                aria-pressed={selected}
                className="press-fx flex flex-col items-center gap-1.5 rounded-lg p-1"
              >
                <span
                  className="w-14 h-14 touchPanel:w-20 touchPanel:h-20 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: hex,
                    boxShadow: selected
                      ? '0 0 0 3px rgba(255, 255, 255, 0.85), 0 0 0 6px rgba(15, 23, 42, 0.55)'
                      : 'var(--surface-edge), var(--surface-hairline)',
                  }}
                >
                  {selected && (
                    <Check
                      className="w-6 h-6 touchPanel:w-8 touchPanel:h-8"
                      strokeWidth={3}
                      style={{ color: readableTextOn(hex) }}
                    />
                  )}
                </span>
                <span className="text-xs touchPanel:text-sm text-muted-foreground">
                  {name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Before / After Comparison */}
      <div className="mb-4">
        <p className="text-sm font-medium text-foreground mb-2">Current vs New</p>
        <div className="flex gap-3">
          {/* Current */}
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">Current</p>
            <div className="flex rounded-lg overflow-hidden h-8" style={stripFrame}>
              {currentShades ? SHADE_KEYS.map(shade => (
                <div
                  key={`current-${shade}`}
                  className="flex-1"
                  style={{ backgroundColor: currentShades[shade] }}
                />
              )) : (
                <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">N/A</div>
              )}
            </div>
          </div>
          {/* New */}
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">New</p>
            <div className="flex rounded-lg overflow-hidden h-8" style={stripFrame}>
              {previewShades ? SHADE_KEYS.map(shade => (
                <div
                  key={`new-${shade}`}
                  className="flex-1"
                  style={{ backgroundColor: previewShades[shade] }}
                />
              )) : (
                <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">Enter valid hex</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hex Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-2">
          Primary Color (Hex)
        </label>
        <div className="flex items-center gap-3">
          {/* Live preview swatch */}
          <div
            className="w-12 h-12 touchPanel:w-16 touchPanel:h-16 rounded-lg flex-shrink-0"
            style={{
              backgroundColor: hexValid ? inputValue : 'var(--color-gray-200)',
              boxShadow: 'var(--surface-edge), var(--surface-hairline)',
            }}
          />
          <input
            type="text"
            value={inputValue}
            readOnly
            onFocus={() => setShowKeyboard(true)}
            placeholder="#004e7a"
            className="flex-1 p-3 touchPanel:p-4 rounded-lg border-2 font-mono text-lg touchPanel:text-xl"
            style={{
              backgroundColor: hexValid ? 'var(--color-bg-secondary)' : 'var(--color-danger-surface)',
              borderColor: hexValid ? 'var(--color-border)' : 'var(--color-danger-400)',
              color: hexValid ? 'var(--color-text)' : 'var(--color-danger-on-surface)',
            }}
            maxLength={7}
          />
        </div>
        {/* Invalid hex warning */}
        {inputValue.length > 1 && !hexValid && (
          <p
            className="mt-1 text-sm font-medium"
            style={{ color: 'var(--color-danger-on-surface)' }}
            role="alert"
          >
            Invalid hex format. Use #RRGGBB (e.g. #004e7a)
          </p>
        )}
      </div>

      {/* Shade Preview with labels */}
      {previewShades && (
        <div className="mb-4">
          <p className="text-sm font-medium text-foreground mb-2">Generated Palette</p>
          <div className="flex gap-1 rounded-lg overflow-hidden" style={stripFrame}>
            {SHADE_KEYS.map(shade => (
              <div
                key={shade}
                className="flex-1 h-12 touchPanel:h-14 flex items-center justify-center text-xs font-mono"
                style={{
                  backgroundColor: previewShades[shade],
                  color: readableTextOn(previewShades[shade]),
                }}
              >
                {shade}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mb-4">
        <Button
          variant="outline"
          size="lg"
          onClick={handleCancel}
          className="flex-1 touchPanel:text-xl touchPanel:py-5"
        >
          Cancel
        </Button>
        {themeName === 'custom' && (
          <Button
            variant="secondary"
            size="lg"
            onClick={handleReset}
            className="flex items-center justify-center gap-2 touchPanel:text-xl touchPanel:py-5"
            title="Reset to Default Theme"
          >
            <RotateCcw className="w-4 h-4 touchPanel:w-5 touchPanel:h-5" />
            Reset
          </Button>
        )}
        <Button
          variant="primary"
          size="lg"
          onClick={handleApply}
          disabled={!hexValid}
          className="flex-1 touchPanel:text-xl touchPanel:py-5"
        >
          Apply Theme
        </Button>
      </div>

      {/* OnScreen Keyboard */}
      {showKeyboard && (
        <OnScreenKeyboard
          value={inputValue}
          onChange={handleKeyboardInput}
          onEnter={handleApply}
          onClose={() => setShowKeyboard(false)}
        />
      )}
    </Modal>
  );
};

export default ColorPickerModal;
