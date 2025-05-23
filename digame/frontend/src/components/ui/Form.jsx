import React, { createContext, useContext, useState, useEffect } from 'react';

// Form Context
const FormContext = createContext();

// Main Form component
export const Form = ({ 
  children, 
  onSubmit, 
  className = '',
  validation = {},
  defaultValues = {},
  mode = 'onChange' // onChange, onBlur, onSubmit
}) => {
  const [values, setValues] = useState(defaultValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation function
  const validateField = (name, value) => {
    const fieldValidation = validation[name];
    if (!fieldValidation) return null;

    // Required validation
    if (fieldValidation.required && (!value || value.toString().trim() === '')) {
      return fieldValidation.required === true ? `${name} is required` : fieldValidation.required;
    }

    // Min length validation
    if (fieldValidation.minLength && value && value.length < fieldValidation.minLength) {
      return `${name} must be at least ${fieldValidation.minLength} characters`;
    }

    // Max length validation
    if (fieldValidation.maxLength && value && value.length > fieldValidation.maxLength) {
      return `${name} must be no more than ${fieldValidation.maxLength} characters`;
    }

    // Pattern validation
    if (fieldValidation.pattern && value && !fieldValidation.pattern.test(value)) {
      return fieldValidation.patternMessage || `${name} format is invalid`;
    }

    // Custom validation
    if (fieldValidation.validate && typeof fieldValidation.validate === 'function') {
      return fieldValidation.validate(value, values);
    }

    return null;
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    Object.keys(validation).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle field change
  const handleFieldChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (mode === 'onChange' && touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  // Handle field blur
  const handleFieldBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    if (mode === 'onBlur' || mode === 'onChange') {
      const error = validateField(name, values[name]);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mark all fields as touched
    const allTouched = {};
    Object.keys(validation).forEach(name => {
      allTouched[name] = true;
    });
    setTouched(allTouched);

    // Validate form
    const isValid = validateForm();
    
    if (isValid && onSubmit) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }

    setIsSubmitting(false);
  };

  const contextValue = {
    values,
    errors,
    touched,
    isSubmitting,
    handleFieldChange,
    handleFieldBlur,
    validateField
  };

  return (
    <FormContext.Provider value={contextValue}>
      <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
        {children}
      </form>
    </FormContext.Provider>
  );
};

// Form Field component
export const FormField = ({ 
  name, 
  children, 
  className = '' 
}) => {
  const context = useContext(FormContext);
  
  if (!context) {
    throw new Error('FormField must be used within a Form');
  }

  const { errors, touched } = context;
  const hasError = touched[name] && errors[name];

  return (
    <div className={`form-field ${className}`}>
      {React.cloneElement(children, {
        name,
        error: hasError,
        errorMessage: errors[name]
      })}
    </div>
  );
};

// Form Label component
export const FormLabel = ({ 
  children, 
  htmlFor, 
  required = false,
  className = '' 
}) => {
  return (
    <label 
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};

// Form Input component
export const FormInput = ({ 
  name,
  type = 'text',
  placeholder = '',
  disabled = false,
  error = false,
  errorMessage = '',
  className = '',
  ...props 
}) => {
  const context = useContext(FormContext);
  
  if (!context) {
    throw new Error('FormInput must be used within a Form');
  }

  const { values, handleFieldChange, handleFieldBlur } = context;

  const inputClasses = `
    w-full px-3 py-2 border rounded-lg
    focus:outline-none focus:ring-2 focus:ring-offset-1
    transition-colors duration-200
    ${error 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
    }
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
    ${className}
  `;

  return (
    <div>
      <input
        type={type}
        name={name}
        value={values[name] || ''}
        placeholder={placeholder}
        disabled={disabled}
        className={inputClasses}
        onChange={(e) => handleFieldChange(name, e.target.value)}
        onBlur={() => handleFieldBlur(name)}
        {...props}
      />
      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
};

// Form Textarea component
export const FormTextarea = ({ 
  name,
  placeholder = '',
  rows = 3,
  disabled = false,
  error = false,
  errorMessage = '',
  className = '',
  ...props 
}) => {
  const context = useContext(FormContext);
  
  if (!context) {
    throw new Error('FormTextarea must be used within a Form');
  }

  const { values, handleFieldChange, handleFieldBlur } = context;

  const textareaClasses = `
    w-full px-3 py-2 border rounded-lg resize-vertical
    focus:outline-none focus:ring-2 focus:ring-offset-1
    transition-colors duration-200
    ${error 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
    }
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
    ${className}
  `;

  return (
    <div>
      <textarea
        name={name}
        value={values[name] || ''}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={textareaClasses}
        onChange={(e) => handleFieldChange(name, e.target.value)}
        onBlur={() => handleFieldBlur(name)}
        {...props}
      />
      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
};

// Form Select component
export const FormSelect = ({ 
  name,
  options = [],
  placeholder = 'Select an option',
  disabled = false,
  error = false,
  errorMessage = '',
  className = '',
  ...props 
}) => {
  const context = useContext(FormContext);
  
  if (!context) {
    throw new Error('FormSelect must be used within a Form');
  }

  const { values, handleFieldChange, handleFieldBlur } = context;

  const selectClasses = `
    w-full px-3 py-2 border rounded-lg
    focus:outline-none focus:ring-2 focus:ring-offset-1
    transition-colors duration-200
    ${error 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
    }
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
    ${className}
  `;

  return (
    <div>
      <select
        name={name}
        value={values[name] || ''}
        disabled={disabled}
        className={selectClasses}
        onChange={(e) => handleFieldChange(name, e.target.value)}
        onBlur={() => handleFieldBlur(name)}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
};

// Form Checkbox component
export const FormCheckbox = ({ 
  name,
  label,
  disabled = false,
  error = false,
  errorMessage = '',
  className = '',
  ...props 
}) => {
  const context = useContext(FormContext);
  
  if (!context) {
    throw new Error('FormCheckbox must be used within a Form');
  }

  const { values, handleFieldChange, handleFieldBlur } = context;

  return (
    <div>
      <label className={`flex items-center space-x-2 ${className}`}>
        <input
          type="checkbox"
          name={name}
          checked={values[name] || false}
          disabled={disabled}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          onChange={(e) => handleFieldChange(name, e.target.checked)}
          onBlur={() => handleFieldBlur(name)}
          {...props}
        />
        <span className="text-sm text-gray-700">{label}</span>
      </label>
      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
};

// Form Submit Button
export const FormSubmitButton = ({ 
  children, 
  className = '',
  ...props 
}) => {
  const context = useContext(FormContext);
  
  if (!context) {
    throw new Error('FormSubmitButton must be used within a Form');
  }

  const { isSubmitting } = context;

  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className={`
        w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg
        hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        ${className}
      `}
      {...props}
    >
      {isSubmitting ? (
        <div className="flex items-center justify-center space-x-2">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <span>Submitting...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

// Hook for form state
export const useForm = (defaultValues = {}, validation = {}) => {
  const [values, setValues] = useState(defaultValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const setValue = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const setError = (name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const reset = () => {
    setValues(defaultValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    setValue,
    setError,
    reset
  };
};

export default Form;