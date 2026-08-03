import { useState, useRef, useEffect } from 'react';

// ── Toggle drag interaction on the slider track ──
// Set to true to re-enable drag/touch input directly on the slider
const SLIDER_DRAG_ENABLED = false;

const Slider = ({ 
  value = 0, 
  onChange, 
  min = 0, 
  max = 100, 
  step = 1,
  orientation = 'horizontal',
  className = '',
  showValue = true,
  label,
  ...props 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);
  
  const handleStart = (e) => {
    if (!SLIDER_DRAG_ENABLED) return; // ← guarded
    setIsDragging(true);
    updateValue(e);
  };
  
  const handleMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    updateValue(e);
  };
  
  const handleEnd = () => {
    setIsDragging(false);
  };
  
  const updateValue = (e) => {
    if (!sliderRef.current) return;
    const clientX = e.type.includes('touch') ? e.touches[0]?.clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0]?.clientY : e.clientY;
    const rect = sliderRef.current.getBoundingClientRect();
    let percentage;
    if (orientation === 'vertical') {
      percentage = 1 - (clientY - rect.top) / rect.height;
    } else {
      percentage = (clientX - rect.left) / rect.width;
    }
    percentage = Math.max(0, Math.min(1, percentage));
    const newValue = min + (max - min) * percentage;
    const steppedValue = Math.round(newValue / step) * step;
    onChange?.(steppedValue);
  };
  
  useEffect(() => {
    if (!isDragging || !SLIDER_DRAG_ENABLED) return; // ← guarded
    const handleGlobalMove = (e) => handleMove(e);
    const handleGlobalEnd = () => handleEnd();
    document.addEventListener('mousemove', handleGlobalMove);
    document.addEventListener('mouseup', handleGlobalEnd);
    document.addEventListener('touchmove', handleGlobalMove, { passive: false });
    document.addEventListener('touchend', handleGlobalEnd);
    return () => {
      document.removeEventListener('mousemove', handleGlobalMove);
      document.removeEventListener('mouseup', handleGlobalEnd);
      document.removeEventListener('touchmove', handleGlobalMove);
      document.removeEventListener('touchend', handleGlobalEnd);
    };
  }, [isDragging]);
  
  const percentage = ((value - min) / (max - min)) * 100;
  const containerClass = orientation === 'vertical' ? 'h-48 w-6 flex-col' : 'w-full h-6 flex-row';
  const trackClass = orientation === 'vertical' ? 'w-2 h-full mx-auto' : 'h-2 w-full my-auto';
  const thumbStyle = orientation === 'vertical'
    ? { bottom: `${percentage}%`, transform: 'translate(-50%, 50%)', left: '50%' }
    : { left: `${percentage}%`, transform: 'translate(-50%, -50%)', top: '50%' };

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className="text-sm font-medium text-heading mb-3">
          {label}
          {showValue && ` (${value})`}
        </label>
      )}
      <div 
        ref={sliderRef}
        className={`relative select-none touch-none ${containerClass} ${SLIDER_DRAG_ENABLED ? 'cursor-pointer' : 'cursor-default'}`}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        style={{ touchAction: 'none' }}
        {...props}
      >
        {/* Track Background */}
        <div className={`absolute bg-gray-300 rounded-full ${trackClass}`} 
          style={orientation === 'vertical' 
            ? { left: '50%', transform: 'translateX(-50%)' }
            : { top: '50%', transform: 'translateY(-50%)' }
          }
        />
        {/* Fill */}
        <div 
          className="absolute bg-primary rounded-full transition-all duration-100"
          style={orientation === 'vertical'
            ? { width: '8px', height: `${percentage}%`, bottom: 0, left: '50%', transform: 'translateX(-50%)', borderRadius: '4px' }
            : { height: '8px', width: `${percentage}%`, top: '50%', transform: 'translateY(-50%)', borderRadius: '4px' }
          }
        />
        {/* Thumb */}
        <div
          className="absolute w-6 h-6 bg-white border-2 border-primary rounded-full shadow-lg transition-transform duration-100 active:scale-125"
          style={thumbStyle}
        />
      </div>
      {showValue && !label && (
        <span className="text-sm font-medium text-heading mt-2">{value}</span>
      )}
    </div>
  );
};

export default Slider;
