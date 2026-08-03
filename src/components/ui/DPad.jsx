import { useState } from 'react';

// Arrow SVG component with rotation and press translation
const ArrowTriangle = ({ direction, pressed, className = '' }) => {
  const rotations = {
    up: 'rotate(0deg)',
    right: 'rotate(90deg)',
    down: 'rotate(180deg)',
    left: 'rotate(-90deg)',
  };

  // Translate the arrow slightly in its direction when pressed
  // Note: Rotations flip the coordinate system, so use opposite values to move in visual direction
  const pressedTranslate = {
    up: 'translateY(-2px)',
    right: 'translateY(-2px)',
    down: 'translateY(-2px)',
    left: 'translateY(-2px)',
  };

  return (
    <svg
      className={className}
      style={{
        transform: `${rotations[direction]} ${pressed ? pressedTranslate[direction] : ''}`,
        transition: 'transform 0.15s ease',
        display: 'block',
        margin: 'auto',
      }}
      viewBox="0 0 30 30"
      aria-hidden="true"
      focusable="false"
    >
      <polygon points="15,5 27,25 3,25" fill={pressed ? '#9CA3AF' : '#fff'} />
    </svg>
  );
};

// Modern dark/cross d-pad
const DPad = ({ onDirectionPress, onCenterPress }) => {

  // Track active (pressed) state for visual feedback
  const [active, setActive] = useState(null);

  // Styling helpers/utility
  const crossBase = 'absolute bg-primary transition-all duration-150';
  const btnBase =
    'absolute flex items-center justify-center rounded-xl shadow-sm z-10 ' +
    'transition-all duration-100 select-none outline-none cursor-pointer ' +
    'active:scale-95 focus-visible:ring-2 ring-primary';
  // Remove hover and active background color from buttons
  const btnBg = 'bg-primary';
  const pressedBg = 'bg-gray-800';

  return (
    <div
      className="relative flex items-center justify-center select-none w-44 h-44 min-w-44 min-h-44 md:w-52 md:h-52 md:min-w-52 md:min-h-52 touchPanel:w-[264px] touchPanel:h-[264px] touchPanel:min-w-[264px] touchPanel:min-h-[264px]"
    >
      {/* Cross arms: rounded, dark using primary color with inverted elliptical radius */}
      <div
        className={`${crossBase} w-16 h-36 md:w-20 md:h-44 touchPanel:w-[90px] touchPanel:h-[216px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[35px/75px] z-0`}
      />
      <div
        className={`${crossBase} w-36 h-16 md:w-44 md:h-20 touchPanel:w-[216px] touchPanel:h-[90px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[75px/35px] z-0`}
      />

      {/* Directional Buttons */}
      {/* Up */}
      <button
        className={`${btnBase} ${btnBg} ${active === 'up' ? pressedBg : ''} w-14 h-14 md:w-16 md:h-16 touchPanel:w-[84px] touchPanel:h-[84px] top-3 md:top-4 touchPanel:top-[18px] left-1/2 -translate-x-1/2`}
        onPointerDown={() => setActive('up')}
        onPointerUp={() => setActive(null)}
        onPointerLeave={() => setActive(null)}
        onClick={() => onDirectionPress?.('up')}
        aria-label="Up"
        tabIndex={0}
        type="button"
      >
        <ArrowTriangle direction="up" pressed={active === 'up'} className="w-7 h-7 md:w-8 md:h-8 touchPanel:w-[42px] touchPanel:h-[42px]" />
      </button>

      {/* Down */}
      <button
        className={`${btnBase} ${btnBg} ${active === 'down' ? pressedBg : ''} w-14 h-14 md:w-16 md:h-16 touchPanel:w-[84px] touchPanel:h-[84px] bottom-3 md:bottom-4 touchPanel:bottom-[18px] left-1/2 -translate-x-1/2`}
        onPointerDown={() => setActive('down')}
        onPointerUp={() => setActive(null)}
        onPointerLeave={() => setActive(null)}
        onClick={() => onDirectionPress?.('down')}
        aria-label="Down"
        tabIndex={0}
        type="button"
      >
        <ArrowTriangle direction="down" pressed={active === 'down'} className="w-7 h-7 md:w-8 md:h-8 touchPanel:w-[42px] touchPanel:h-[42px]" />
      </button>

      {/* Left */}
      <button
        className={`${btnBase} ${btnBg} ${active === 'left' ? pressedBg : ''} w-14 h-14 md:w-16 md:h-16 touchPanel:w-[84px] touchPanel:h-[84px] left-3 md:left-4 touchPanel:left-[18px] top-1/2 -translate-y-1/2`}
        onPointerDown={() => setActive('left')}
        onPointerUp={() => setActive(null)}
        onPointerLeave={() => setActive(null)}
        onClick={() => onDirectionPress?.('left')}
        aria-label="Left"
        tabIndex={0}
        type="button"
      >
        <ArrowTriangle direction="left" pressed={active === 'left'} className="w-7 h-7 md:w-8 md:h-8 touchPanel:w-[42px] touchPanel:h-[42px]" />
      </button>

      {/* Right */}
      <button
        className={`${btnBase} ${btnBg} ${active === 'right' ? pressedBg : ''} w-14 h-14 md:w-16 md:h-16 touchPanel:w-[84px] touchPanel:h-[84px] right-3 md:right-4 touchPanel:right-[18px] top-1/2 -translate-y-1/2`}
        onPointerDown={() => setActive('right')}
        onPointerUp={() => setActive(null)}
        onPointerLeave={() => setActive(null)}
        onClick={() => onDirectionPress?.('right')}
        aria-label="Right"
        tabIndex={0}
        type="button"
      >
        <ArrowTriangle direction="right" pressed={active === 'right'} className="w-7 h-7 md:w-8 md:h-8 touchPanel:w-[42px] touchPanel:h-[42px]" />
      </button>

      {/* Center OK Button */}
      <button
        className={`absolute flex items-center justify-center rounded-full z-20 w-12 h-12 md:w-14 md:h-14 touchPanel:w-[72px] touchPanel:h-[72px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                     transition-all duration-100 select-none outline-none cursor-pointer
                     active:scale-95 focus-visible:ring-2 ring-primary ${btnBg}
                     ${active === 'center' ? pressedBg : ''}`}
        onPointerDown={() => setActive('center')}
        onPointerUp={() => setActive(null)}
        onPointerLeave={() => setActive(null)}
        onClick={() => onCenterPress?.()}
        aria-label="OK"
        tabIndex={0}
        type="button"
      >
        <span className="font-bold text-white text-xs md:text-sm touchPanel:text-base">OK</span>
      </button>
    </div>
  );
};

export default DPad;
