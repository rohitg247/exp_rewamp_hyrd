import { useEffect } from 'react';
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
  containerClassName = 'bg-[var(--color-bg-secondary)]',
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 touchPanel:p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={`
          relative rounded-xl shadow-2xl
          w-full ${maxWidth}
          flex flex-col
          animate-slide-up
          ${containerClassName}
        `}
        style={containerStyle}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className={`flex items-center justify-between p-4 sm:p-6 touchPanel:p-8 border-b border-[var(--color-border)] flex-shrink-0 ${headerClassName}`}>
          {/* <div className="flex items-center justify-between p-4 sm:p-6 touchPanel:p-8 border-b border-[var(--color-border)] flex-shrink-0"> */}
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
    </div>
  );
};

export default Modal;
