// src/components/ui/Button.jsx
import { forwardRef } from 'react';

const Button = forwardRef(({ 
    children, 
    variant = 'primary', 
    size = 'md',
    disabled = false,
    className = '',
    ...props 
}, ref) => {
    // Base classes applied to all buttons
    const baseClasses = 'font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 touch-manipulation user-select-none';
    
    // Variant definitions - Updated with brightness for universal theme support
    const variants = {
        primary: 'bg-primary text-buttonText-primary border-2 border-transparent',
        danger: 'bg-danger hover:bg-danger-700 text-buttonText-primary border-2 border-transparent',
        success: 'bg-green-500 hover:bg-green-600 text-buttonText-primary border-2 border-transparent',
        // Updated: Same brightness on hover and active (press)
        secondary: 'bg-[var(--color-bg-secondary)] hover:brightness-95 active:brightness-95 text-buttonText-secondary border-2 border-primary-200',
        outline: 'bg-transparent border-2 border-primary text-buttonText-secondary hover:bg-primary hover:text-buttonText-primary',
        // Updated: Same brightness on hover and active (press)
        ghost: 'bg-transparent hover:brightness-95 active:brightness-95 text-buttonText-secondary border-2 border-transparent'
    };
    
    const sizes = {
        sm: 'py-2 px-4 text-sm',
        md: 'py-3 px-6 text-base',
        lg: 'py-4 px-8 text-lg',
        xl: 'py-5 px-10 text-xl',
        responsive: 'py-2 px-4 text-sm md:py-3 md:px-6 md:text-base touchPanel:py-4 touchPanel:px-8 touchPanel:text-lg',
        touchPanel: 'py-2 px-2 text-sm md:py-3 md:px-4 md:text-base touchPanel:py-3 touchPanel:px-6 touchPanel:text-base'
    };
    
    const disabledClasses = disabled 
        ? 'opacity-50 cursor-not-allowed hover:shadow-md active:scale-100' 
        : '';

    return (
        <button
            ref={ref}
            disabled={disabled}
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
});

Button.displayName = 'Button';

export default Button;
