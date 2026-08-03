// Toast.jsx
import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const Toast = ({ 
  id, 
  message, 
  type = 'success',
  duration = 3000, 
  onClose 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const typeConfig = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: <CheckCircle size={28} className="text-green-600 flex-shrink-0" />,
      textColor: 'text-green-800'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: <AlertCircle size={28} className="text-red-600 flex-shrink-0" />,
      textColor: 'text-red-800'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: <Info size={28} className="text-blue-600 flex-shrink-0" />,
      textColor: 'text-blue-800'
    }
  };

  const config = typeConfig[type];

  return (
    <div
      className={`
        ${config.bg} ${config.border}
        border-l-[6px] rounded-lg px-2 py-4 min-h-[64px]
        shadow-lg flex items-stretch justify-between
        animate-slide-down
        min-w-[300px] max-w-[400px]
      `}
    >
      <div className="flex items-center space-x-3">
        {config.icon}
        <p className={`${config.textColor} text-base touchPanel:text-lg font-medium`}>
          {message}
        </p>
      </div>
      <button
        onClick={() => onClose(id)}
        className={`${config.textColor} hover:opacity-70 transition-opacity flex items-center ml-4`}
      >
        <X size={20} />
      </button>
    </div>
  );
};

export default Toast;