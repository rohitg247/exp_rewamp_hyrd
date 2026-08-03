// src/components/ui/Select.jsx

import { ChevronDown } from 'lucide-react';

const Select = ({
  value = '',
  onChange,
  options = [],
  label = '',
  placeholder = 'Select an option',
  disabled = false,
  className = '',
  error = '',
  required = false,
}) => {
  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      {/* Label */}
      {label && (
        <label className="text-sm md:text-sm touchPanel:text-lg font-semibold text-heading">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Select Wrapper */}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full
            px-3 py-2 md:px-4 md:py-3 touchPanel:px-5 touchPanel:py-4
            border-2
            rounded-lg
            font-semibold
            text-sm md:text-sm touchPanel:text-lg
            bg-white
            text-primary
            cursor-pointer
            appearance-none
            transition-all
            duration-200
            focus:outline-none
            focus:ring-2
            focus:ring-primary
            focus:ring-opacity-50
            disabled:opacity-50
            disabled:cursor-not-allowed
            ${error ? 'border-red-500' : 'border-primary border-opacity-30 hover:border-opacity-50'}
          `}
        >
          <option value="">
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Chevron Icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <ChevronDown size={18} className="text-primary opacity-70" />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-xs font-semibold text-red-500 mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;
