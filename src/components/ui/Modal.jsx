import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import Button from './Button';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = 'max-w-lg',
  showCloseButton = true,
  fullHeight = false,
  height,
  maxHeight, // ✅ ADDED: new prop for max height cap
  // 2026-08-03 revamp: the surface colour moved to an inline style below.
  // It used to default to an arbitrary bracket colour, which does not
  // reliably apply on the TSW-1070.
  containerClassName = '',
  headerClassName = ''
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // ✅ CHANGED: style logic now handles height, maxHeight, and fullHeight
  const containerStyle = height
    ? { height }
    : maxHeight
    ? { maxHeight }
    : fullHeight
    ? { height: '90vh' }
    : undefined;

  // 🔴 2026-08-10 — rendered through a portal into <body>, NOT in place.
  //
  // App.jsx wraps every routed page in `animate-page-enter`, whose Tailwind
  // definition is `pageFadeIn 0.2s ease-out both`. The `both` fill-mode keeps
  // the final keyframe applied permanently, so that div permanently carries
  // `transform: translateY(0)` — and a non-none transform makes an element the
  // containing block for `position: fixed` descendants.
  //
  // Any modal rendered from inside a page (EditMenuModal is the only one) was
  // therefore positioned against that div rather than the viewport: it started
  // below the navbar, got clipped by the wrapper's `overflow-hidden`, and its
  // z-50 sat inside a nested stacking context so the fixed z-40 Sidebar painted
  // over it. Modals opened from App.jsx or the Navbar sit outside that div and
  // never showed the bug, which is why this one looked different.
  //
  // Portalling to document.body escapes the containing block entirely, so
  // placement no longer depends on where a modal happens to be rendered.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 touchPanel:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Dialog'}
    >
      {/* Backdrop — inline rgba, not bg-opacity-*, so it renders on the panel.
          The blur is what separates the dialog from a busy control screen. */}
      <div
        className="absolute inset-0 transition-opacity duration-200"
        style={{
          backgroundColor: 'rgba(2, 6, 23, 0.55)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
        onClick={onClose}
      />

      {/* Modal Container — overlay glass: a real backdrop-filter is affordable
          here because at most one dialog is on screen at a time. */}
      <div
        className={`
          relative rounded-xl
          w-full ${maxWidth}
          flex flex-col
          animate-slide-up
          ${containerClassName}
        `}
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          backgroundImage: 'var(--surface-glass)',
          boxShadow:
            'var(--surface-hairline), var(--surface-edge), var(--elev-raised)',
          ...containerStyle,
        }}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div
            className={`flex items-center justify-between p-4 sm:p-6 touchPanel:p-8 flex-shrink-0 ${headerClassName}`}
            style={{ borderBottom: '1px solid var(--color-border)' }}
          >
          {/* <div className="flex items-center justify-between p-4 sm:p-6 touchPanel:p-8 border-b border-border flex-shrink-0"> */}
            {title && (
              <h2 className="text-lg sm:text-xl touchPanel:text-2xl font-bold text-heading pr-4">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2 touchPanel:p-3 hover:bg-gray-100 rounded-full flex-shrink-0"
                aria-label="Close modal"
              >
                <X size={20} className="touchPanel:w-6 touchPanel:h-6" />
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-4 sm:p-6 touchPanel:p-8 overflow-auto flex-1">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
