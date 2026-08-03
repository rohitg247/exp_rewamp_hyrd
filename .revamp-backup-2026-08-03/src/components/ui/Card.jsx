// src/components/ui/Card.jsx
const Card = ({ children, className = "", variant = "default", ...props }) => {
  const hoverClass = "hover:shadow-2xl transition-all duration-300";
  
  // Variant styles - Now using CSS variables for dark mode compatibility
  const variantStyles = {
    default: "bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-lg",
    // Glass variant with CSS variable gradient
    glass: "bg-[radial-gradient(ellipse_at_top_left,var(--color-bg-secondary)_0%,var(--color-bg-secondary)_50%,color-mix(in_srgb,var(--color-primary-50)_30%,transparent)_100%)] backdrop-blur-sm border border-white/70 dark:border-white/10 shadow-xl",
//     // NEW: Blue gradient Dark Metal variant
    // gradientnew: "bg-[linear-gradient(to_bottom_right,var(--color-bg-secondary)_0%,var(--color-bg-secondary)_10%,var(--color-primary-50)_65%,var(--color-bg-secondary)_100%)] border border-[var(--color-border)] shadow-lg",

    gradient: "bg-gradient-to-br from-[var(--color-bg-secondary)] to-[var(--color-bg-secondary)] via-[var(--color-primary-50)] border border-[var(--color-border)] shadow-lg",

    gradientone: "bg-[linear-gradient(135deg,var(--color-bg-secondary)_0%,var(--color-bg-secondary)_20%,var(--color-primary-50)_55%,var(--color-primary-100)_70%,var(--color-bg-secondary)_100%)] shadow-lg",

    // origanl version keep it as it is 
    // gradient: "bg-gradient-to-br from-[var(--color-bg-secondary)] to-[var(--color-bg-secondary)] via-[var(--color-primary-50)] border border-[var(--color-border)] shadow-lg",
    
  };

  return (
    <div
      className={`rounded-xl p-6 touchPanel:p-8 ${hoverClass} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = "", ...props }) => (
  <div className={`mb-2 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = "", ...props }) => (
  <h3
    className={`text-lg font-semibold text-heading ${className}`}
    {...props}
  >
    {children}
  </h3>
);

export const CardContent = ({ children, className = "", ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

export default Card;
