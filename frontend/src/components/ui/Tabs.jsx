import React, { useState } from 'react';

export const Tabs = ({ defaultValue, children, className = '', ...props }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  return (
    <div className={`${className}`} {...props}>
      {React.Children.map(children, child => 
        React.cloneElement(child, { activeTab, setActiveTab })
      )}
    </div>
  );
};

export const TabsList = ({ children, className = '', activeTab, setActiveTab, ...props }) => {
  return (
    <div className={`flex space-x-1 rounded-lg bg-gray-100 p-1 ${className}`} {...props}>
      {React.Children.map(children, child => 
        React.cloneElement(child, { activeTab, setActiveTab })
      )}
    </div>
  );
};

export const TabsTrigger = ({ value, children, className = '', activeTab, setActiveTab, ...props }) => {
  const isActive = activeTab === value;
  
  return (
    <button
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
        isActive 
          ? 'bg-white text-gray-900 shadow-sm' 
          : 'text-gray-600 hover:text-gray-900'
      } ${className}`}
      onClick={() => setActiveTab(value)}
      {...props}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children, className = '', activeTab, ...props }) => {
  if (activeTab !== value) return null;
  
  return (
    <div className={`mt-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Tabs;
