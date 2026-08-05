import { useState, useRef, useEffect } from 'react';


const VolumeSlider = ({
  value = 50,
  onChange,
  onChangeComplete,
  onThrottledChange,  // NEW: fires at most every 100ms during drag for real-time backend sends
  min = 0,
  max = 100,
  step = 1,
  showValue = true,
  label = 'Volume',
  className = '',
  sliderHeight = '', // DEPRECATED: Dynamic sizing now uses flex-1 h-full
  interactive = true, // ✅ NEW PROP - default true for backward compatibility
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [, setIsActive] = useState(false); // track mouse/finger pressed state
  const sliderRef = useRef(null);
  const lastSentValueRef = useRef(null);
  const throttleTimerRef = useRef(null);
  const latestValueRef = useRef(value);


  const handleStart = (e) => {
    if (!interactive) return; // ✅ ADDED - prevent drag if not interactive
    setIsDragging(true);
    setIsActive(true);       // Show thumb on press down
    updateValue(e);
  };


  const handleMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    updateValue(e);
  };


  const handleEnd = (e) => {
    setIsDragging(false);
    setIsActive(false);      // Hide thumb on release
    // Clear any pending throttle timer
    if (throttleTimerRef.current) {
      clearTimeout(throttleTimerRef.current);
      throttleTimerRef.current = null;
    }
    if (onChangeComplete && sliderRef.current) {
      const clientY = e?.type?.includes('touch') ? e?.changedTouches?.[0]?.clientY : e?.clientY;
      const rect = sliderRef.current.getBoundingClientRect();
      let percentage = 1 - (clientY - rect.top) / rect.height;
      percentage = Math.max(0, Math.min(1, percentage));
      const newValue = min + (max - min) * percentage;
      const steppedValue = Math.round(newValue / step) * step;


      if (steppedValue !== lastSentValueRef.current) {
        lastSentValueRef.current = steppedValue;
        onChangeComplete(steppedValue);
      }
    }
  };


  const updateValue = (e) => {
    if (!sliderRef.current) return;
    const clientY = e.type.includes('touch') ? e.touches[0]?.clientY : e.clientY;
    const rect = sliderRef.current.getBoundingClientRect();
    let percentage = 1 - (clientY - rect.top) / rect.height;
    percentage = Math.max(0, Math.min(1, percentage));
    const newValue = min + (max - min) * percentage;
    const steppedValue = Math.round(newValue / step) * step;

    onChange?.(steppedValue);

    // Throttled send: fire onThrottledChange at most every 500ms during drag
    latestValueRef.current = steppedValue;
    if (onThrottledChange && !throttleTimerRef.current) {
      throttleTimerRef.current = setTimeout(() => {
        throttleTimerRef.current = null;
        onThrottledChange(latestValueRef.current);
      }, 500);
    }
  };


  useEffect(() => {
    if (!isDragging) return;
    const handleGlobalMove = (e) => handleMove(e);
    const handleGlobalEnd = (e) => handleEnd(e);


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


  const getColor = () => {
    if (percentage <= 70) {
      return 'from-green-500 to-green-600';
    } else if (percentage <= 90) {
      return 'from-yellow-500 to-yellow-600';
    } else {
      return 'from-red-500 to-red-600';
    }
  };


  return (
    <div className={`flex flex-col items-center justify-center gap-3 h-full ${className}`}>
      {label && (
        <label className="text-sm md:text-sm touchPanel:text-lg font-semibold text-heading">
          {label}
        </label>
      )}
      <div
        ref={sliderRef}
        className={`relative w-12 md:w-14 touchPanel:w-20 ${sliderHeight || 'flex-1'} min-h-12 md:min-h-16 touchPanel:min-h-20 bg-gradient-to-b from-gray-100 to-gray-200 rounded-full ${interactive ? 'cursor-pointer' : 'cursor-default'} select-none touch-none shadow-lg border-2 border-gray-300 transition-shadow hover:shadow-xl overflow-hidden`}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        style={{ touchAction: 'none' }}
      >
        <div className="absolute inset-2 rounded-full bg-white opacity-30" />
        <div
          className={`absolute bottom-0 left-0 right-0 rounded-full bg-gradient-to-t ${getColor()} shadow-md`}
          style={{
            height: `clamp(0px, ${percentage}%, calc(100% - 0px))`,
            opacity: 0.9,
            transition: 'height 0s ease',  
          }}
        />
        {/* {isActive && (
          <div
            className="absolute left-1/2 w-10 h-10 bg-white border-2 border-gray-400 rounded-full shadow-md transform -translate-x-1/2 transition-transform duration-150 active:scale-105 cursor-grab active:cursor-grabbing"
            style={{
              bottom: `clamp(0px, calc(${percentage}% - 20px), calc(100% - 40px))`,
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
            }}
          >
            <div className="absolute inset-1 rounded-full bg-gray-300" />
          </div>
        )} */}
      </div>
      {showValue && (
        <div className="text-center mt-2">
          <p className="text-xs font-semibold text-heading touchPanel:text-xl">
            {Math.round(percentage)}%
          </p>
        </div>
      )}
    </div>
  );
};


export default VolumeSlider;
