import { X } from 'lucide-react';
import Button from './Button';

// Dots + numpad, shared by PinModal (entry) and ChangePinModal (3-stage change)
// so the keypad markup lives in exactly one place.
const PinPad = ({ pin, length, onDigit, onBackspace, onClear }) => (
  <>
    <div className="flex justify-center space-x-3 mb-8">
      {Array.from({ length }, (_, i) => (
        <div
          key={i}
          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
            pin.length > i ? 'bg-primary border-primary' : 'bg-black/20 border-theme-border'
          }`}
        >
          {pin.length > i && <div className="w-3 h-3 bg-white rounded-full" />}
        </div>
      ))}
    </div>

    <div className="grid grid-cols-3 gap-3 mb-3">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
        <Button
          key={digit}
          variant="secondary"
          size="md"
          onClick={() => onDigit(String(digit))}
          className="h-16 text-2xl"
        >
          {digit}
        </Button>
      ))}
    </div>

    <div className="grid grid-cols-3 gap-3">
      <Button variant="secondary" size="md" onClick={onClear} className="h-16 text-lg">
        Clear
      </Button>
      <Button variant="secondary" size="md" onClick={() => onDigit('0')} className="h-16 text-2xl">
        0
      </Button>
      <Button
        variant="secondary"
        size="md"
        onClick={onBackspace}
        className="h-16 flex items-center justify-center"
        aria-label="Backspace"
      >
        <X size={24} />
      </Button>
    </div>
  </>
);

export default PinPad;
