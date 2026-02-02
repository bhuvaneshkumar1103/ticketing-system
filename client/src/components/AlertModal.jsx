import React from 'react';
import { AlertTriangle, Info, AlertCircle, X } from 'lucide-react';

const AlertModal = ({ isOpen, type = 'info', title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  const config = {
    info: {
      icon: <Info className="text-blue-500" size={28} />,
      btnColor: 'bg-blue-600 hover:bg-blue-700',
      bgColor: 'bg-blue-50'
    },
    warning: {
      icon: <AlertTriangle className="text-amber-500" size={28} />,
      btnColor: 'bg-amber-600 hover:bg-amber-700',
      bgColor: 'bg-amber-50'
    },
    danger: {
      icon: <AlertCircle className="text-rose-500" size={28} />,
      btnColor: 'bg-rose-600 hover:bg-rose-700',
      bgColor: 'bg-rose-50'
    }
  };

  const theme = config[type] || config.info;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onCancel}></div>
      
      {/* Modal Box */}
      <div className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl ${theme.bgColor}`}>
              {theme.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-black text-gray-900 leading-tight mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 flex gap-3 justify-end">
          <button 
            onClick={onCancel}
            className="bg-gray-200 px-8 py-2.5 hover:bg-gray-300 rounded-xl text-black font-bold text-sm shadow-lg transition-all active:scale-95"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className={`px-8 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg transition-all active:scale-95 ${theme.btnColor}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;