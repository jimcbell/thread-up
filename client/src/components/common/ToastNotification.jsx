import { useEffect } from 'react';

const ToastNotification = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeStyles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className={`${typeStyles[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3`}>
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-white hover:text-gray-200 font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ToastNotification;
