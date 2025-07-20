import React from 'react';

// Simple toast notification system
let toastContainer = null;

export const showToast = (message, type = 'info') => {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
    document.body.appendChild(toastContainer);
  }
  
  const toast = document.createElement('div');
  toast.className = `px-4 py-2 rounded-md shadow-lg text-white transition-opacity duration-300 ${
    type === 'success' ? 'bg-green-500' :
    type === 'error' ? 'bg-red-500' :
    type === 'warning' ? 'bg-yellow-500' :
    'bg-blue-500'
  }`;
  toast.textContent = message;
  
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toastContainer.contains(toast)) {
        toastContainer.removeChild(toast);
      }
    }, 300);
  }, 3000);
};

export const Toast = ({ message, type = 'info', onClose }) => {
  return (
    <div className={`px-4 py-2 rounded-md shadow-lg text-white ${
      type === 'success' ? 'bg-green-500' :
      type === 'error' ? 'bg-red-500' :
      type === 'warning' ? 'bg-yellow-500' :
      'bg-blue-500'
    }`}>
      <div className="flex items-center justify-between">
        <span>{message}</span>
        {onClose && (
          <button onClick={onClose} className="ml-2 text-white hover:text-gray-200">
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast;
