import React, { useState } from 'react';

export const Dialog = ({ 
  open, 
  onOpenChange, 
  children,
  className = ''
}) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50" 
        onClick={() => onOpenChange?.(false)}
      />
      <div className={`relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 ${className}`}>
        {children}
      </div>
    </div>
  );
};

export const DialogContent = ({ children, className = '' }) => {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
};

export const DialogHeader = ({ children, className = '' }) => {
  return (
    <div className={`pb-4 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

export const DialogTitle = ({ children, className = '' }) => {
  return (
    <h2 className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </h2>
  );
};

export const DialogFooter = ({ children, className = '' }) => {
  return (
    <div className={`pt-4 border-t border-gray-200 flex justify-end space-x-2 ${className}`}>
      {children}
    </div>
  );
};

export default Dialog;
