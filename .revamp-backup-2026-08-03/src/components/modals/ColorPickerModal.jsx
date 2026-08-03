import { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import Modal from '../ui/Modal';
import OnScreenKeyboard from '../ui/OnScreenKeyboard';
import Button from '../ui/Button';
import { generateShades, isValidHex } from '../../utils/colorUtils';
import { useTheme } from '../../context/ThemeContext';

const SHADE_KEYS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Customize Theme Color"
      maxWidth="max-w-[75%]"
      maxHeight="95vh"
    >
      {/* Before / After Comparison */}
      <div className="mb-4">
        <p className="text-sm font-medium text-foreground mb-2">Current vs New</p>
        <div className="flex gap-3">
          {/* Current */}
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">Current</p>
            <div className="flex rounded-lg overflow-hidden h-8">
              {currentShades ? SHADE_KEYS.map(shade => (
                <div
                  key={`current-${shade}`}
                  className="flex-1"
                  style={{ backgroundColor: currentShades[shade] }}
                />
              )) : (
                <div className="flex-1 bg-gray-200 flex items-center justify-center text-xs">N/A</div>
              )}
            </div>
          </div>
          {/* New */}
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">New</p>
            <div className="flex rounded-lg overflow-hidden h-8">
              {previewShades ? SHADE_KEYS.map(shade => (
                <div
                  key={`new-${shade}`}
                  className="flex-1"
                  style={{ backgroundColor: previewShades[shade] }}
                />
              )) : (
                <div className="flex-1 bg-gray-200 flex items-center justify-center text-xs">Enter valid hex</div>
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
            className="w-12 h-12 touchPanel:w-16 touchPanel:h-16 rounded-lg border-2 flex-shrink-0"
            style={{
              backgroundColor: hexValid ? inputValue : '#cccccc',
              borderColor: hexValid ? inputValue : 'var(--color-border)',
            }}
          />
          <input
            type="text"
            value={inputValue}
            readOnly
            onFocus={() => setShowKeyboard(true)}
            placeholder="#004e7a"
            className={`flex-1 p-3 touchPanel:p-4 rounded-lg border-2 font-mono text-lg touchPanel:text-xl
              ${hexValid
                ? 'border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)]'
                : 'border-red-400 bg-red-50 text-red-700'
              }`}
            maxLength={7}
          />
        </div>
        {/* Invalid hex warning */}
        {inputValue.length > 1 && !hexValid && (
          <p className="mt-1 text-sm text-red-500 font-medium">
            Invalid hex format. Use #RRGGBB (e.g. #004e7a)
          </p>
        )}
      </div>

      {/* Shade Preview with labels */}
      {previewShades && (
        <div className="mb-4">
          <p className="text-sm font-medium text-foreground mb-2">Generated Palette</p>
          <div className="flex gap-1 rounded-lg overflow-hidden">
            {SHADE_KEYS.map(shade => (
              <div
                key={shade}
                className="flex-1 h-12 touchPanel:h-14 flex items-center justify-center text-xs font-mono"
                style={{
                  backgroundColor: previewShades[shade],
                  color: parseInt(shade) < 400 ? '#000' : '#fff',
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
