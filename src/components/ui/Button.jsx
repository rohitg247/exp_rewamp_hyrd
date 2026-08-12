// src/components/ui/Button.jsx
//
// 2026-08-03 UI revamp: elevation ramp + standardised press physics.
// The variant/size API is unchanged, so no caller needs editing.
//
// PANEL RULE (TSW-1070): the two variants that used an arbitrary bracket colour
// now set that surface with an inline style instead — bracket colours are
// documented as unreliable on the panel.
import { forwardRef } from 'react';

const Button = forwardRef(({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    className = '',
    style,
    ...props
}, ref) => {
    // Base classes applied to all buttons. press-fx carries the 120ms
    // scale/shadow response defined once in global.css.
    // `ui-btn` + the data-variant below are inert hooks: nothing styles them
    // unless <html data-liquid="true"> is set (see global.css → LIQUID GLASS).
    const baseClasses = 'ui-btn font-semibold rounded-lg press-fx shadow-rest hover:shadow-raised active:shadow-pressed touch-manipulation user-select-none';

    // Variant definitions - Updated with brightness for universal theme support
    // 2026-08-06: gloss-sweep on the filled variants only — a travelling
    // highlight needs a solid fill under it to read at all.
    const variants = {
        primary: 'bg-primary text-buttonText-primary border-2 border-transparent gloss-sweep',
        danger: 'bg-danger hover:bg-danger-700 text-buttonText-primary border-2 border-transparent gloss-sweep',
        success: 'bg-green-500 hover:bg-green-600 text-buttonText-primary border-2 border-transparent',
        // Updated: Same brightness on hover and active (press)
        secondary: 'hover:brightness-95 active:brightness-95 text-buttonText-secondary border-2 border-primary-200',
        outline: 'bg-transparent border-2 border-primary text-buttonText-secondary hover:bg-primary hover:text-buttonText-primary',
        // Updated: Same brightness on hover and active (press)
        ghost: 'bg-transparent hover:brightness-95 active:brightness-95 text-buttonText-secondary border-2 border-transparent'
    };

    // Panel-safe surface for the variants that can't use a Tailwind colour class.
    const variantStyle = variant === 'secondary'
        ? { backgroundColor: 'var(--color-bg-secondary)' }
        : null;

    const sizes = {
        sm: 'py-2 px-4 text-sm',
        md: 'py-3 px-6 text-base',
        lg: 'py-4 px-8 text-lg',
        xl: 'py-5 px-10 text-xl',
        responsive: 'py-2 px-4 text-sm md:py-3 md:px-6 md:text-base touchPanel:py-4 touchPanel:px-8 touchPanel:text-lg',
        touchPanel: 'py-2 px-2 text-sm md:py-3 md:px-4 md:text-base touchPanel:py-3 touchPanel:px-6 touchPanel:text-base'
    };

    const disabledClasses = disabled
        ? 'opacity-50 cursor-not-allowed hover:shadow-rest'
        : '';

    return (
        <button
            ref={ref}
            disabled={disabled}
            data-variant={variant}
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
            style={{ ...variantStyle, ...style }}
            {...props}
        >
            {children}
        </button>
    );
});

Button.displayName = 'Button';

export default Button;
