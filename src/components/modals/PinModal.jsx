import { useState } from 'react';
import { Lock } from 'lucide-react';
import Modal from '../ui/Modal';
import PinPad from '../ui/PinPad';
import { getPin, PIN_LENGTH } from '../../utils/pin';

const PinModal = ({ isOpen, onSuccess, onClose, showCloseButton = true }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleDigitClick = (digit) => {
    if (pin.length >= PIN_LENGTH) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError('');
    if (newPin.length === PIN_LENGTH) {
      setTimeout(() => handleSubmit(newPin), 100);
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  // Read the PIN at submit time, not module load, so a change takes effect
  // without a reload.
  const handleSubmit = (pinToCheck = pin) => {
    if (pinToCheck === getPin()) {
      setPin('');
      setError('');
      onSuccess();
    } else {
      setError('Incorrect PIN. Please try again.');
      setPin('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enter PIN" showCloseButton={showCloseButton} maxWidth="max-w-md">
      <div className="py-6">
        <div className="mb-6 flex justify-center">
          <Lock size={48} className="text-primary" />
        </div>

        <p className="text-center mb-6" style={{ color: 'var(--color-text-light)' }}>
          Enter the room PIN to start the session
        </p>

        <PinPad
          pin={pin}
          length={PIN_LENGTH}
          onDigit={handleDigitClick}
          onBackspace={handleBackspace}
          onClear={handleClear}
        />

        {error && <p className="text-center text-danger mt-4">{error}</p>}
      </div>
    </Modal>
  );
};

export default PinModal;
