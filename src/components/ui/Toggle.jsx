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
        // Inert hook — only <html data-liquid="true"> styles it (global.css).
        data-checked={checked}
        className={`
          ui-toggle relative inline-flex items-center w-14 h-7 md:w-16 md:h-8 touchPanel:w-20 touchPanel:h-10 rounded-full transition-colors duration-200 ease-in-out
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
        {/* Handle is shifted to leave room for innerText: track w-16 minus w-6
            handle = 10 units of travel, so 1 + 9 = 10.
            NOTE: this used to be a `//` comment INSIDE the template literal
            below, which meant Tailwind emitted `w-16` and `w-6` as real classes
            on the handle — the knob was 4rem wide under the md breakpoint. */}
        <span
          className={`
            ui-toggle-knob inline-block w-6 h-6 md:w-6 md:h-6 touchPanel:w-8 touchPanel:h-8 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out
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