import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000); // Auto-close after 4s
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: { bg: 'bg-emerald-500', icon: <CheckCircle size={20} /> },
    error: { bg: 'bg-rose-500', icon: <AlertCircle size={20} /> },
    info: { bg: 'bg-blue-600', icon: <Info size={20} /> },
  };

  const current = styles[type] || styles.info;

  return (
    <div className={`fixed top-8 right-8 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl text-white shadow-2xl animate-in slide-in-from-right-full duration-300 ${current.bg}`}>
      {current.icon}
      <p className="text-sm font-bold tracking-wide">{message}</p>
      <button onClick={onClose} className="ml-4 hover:opacity-70 transition-opacity">
        <X size={18} />
      </button>
    </div>
  );
};

export default Toast;