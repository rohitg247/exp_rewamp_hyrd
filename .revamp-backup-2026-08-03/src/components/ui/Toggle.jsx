// src/components/ui/Toggle.jsx (Corrected Inner Text Positioning)

const Toggle = ({ 
  checked = false, 
  onChange, 
  label, 
  disabled = false,
  className = '',
  checkedBgClass = 'bg-primary',
  // Text to display inside the switch track
  innerText = null, 
  ...props 
}) => {
  return (
    <div className={`inline-flex items-center ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange?.(!checked)}
        disabled={disabled}
        className={`
          relative inline-flex items-center w-14 h-7 md:w-16 md:h-8 touchPanel:w-20 touchPanel:h-10 rounded-full transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2
          ${checked ? checkedBgClass : 'bg-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        {...props}
      >
        {/* INNER TEXT POSITIONING LOGIC */}
        {innerText && (
            <>
                {/* OFF Text (Visible when unchecked, positioned on the right) */}
                <span 
                    className={`
                        absolute top-1/2 -translate-y-1/2 text-xs font-semibold
                        transition-opacity duration-150
                        ${checked 
                            ? 'right-2 text-white opacity-0' // Hide when checked
                            : 'right-2 text-gray-600 opacity-100' // Show when unchecked
                        }
                    `}
                >
                    {innerText.off}
                </span>

                {/* ON Text (Visible when checked, positioned on the left) */}
                <span 
                    className={`
                        absolute top-1/2 -translate-y-1/2 text-xs font-semibold
                        transition-opacity duration-150
                        ${checked 
                            ? 'left-2 text-white opacity-100' // Show when checked
                            : 'left-2 text-gray-600 opacity-0' // Hide when unchecked
                        }
                    `}
                >
                    {innerText.on}
                </span>
            </>
        )}
        
        {/* SLIDER HANDLE */}
        <span
          className={`
            inline-block w-6 h-6 md:w-6 md:h-6 touchPanel:w-8 touchPanel:h-8 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out
            // Shifted the tracker to make room for text. w-16 - w-6 handle = 10 units space. 1 + 9 = 10
            ${checked ? 'translate-x-7 md:translate-x-9 touchPanel:translate-x-11' : 'translate-x-1'} 
          `}
        />
      </button>
      {label && (
        <span className="ml-3 text-sm font-medium text-heading">
          {label}
        </span>
      )}
    </div>
  );
};

export default Toggle;