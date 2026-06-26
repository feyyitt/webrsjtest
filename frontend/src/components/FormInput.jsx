import { forwardRef } from 'react';

const FormInput = forwardRef(({ 
  label, 
  error, 
  type = 'text',
  required = false,
  children,
  ...props 
}, ref) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-accent-700 dark:text-accent-300 mb-2">
          {label}
          {required && <span className="text-primary-600 dark:text-primary-400 ml-1">*</span>}
        </label>
      )}
      
      {type === 'textarea' ? (
        <textarea
          ref={ref}
          className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-accent-900 text-accent-900 dark:text-accent-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
            error ? 'border-red-500' : 'border-accent-300 dark:border-accent-600'
          }`}
          rows={4}
          {...props}
        />
      ) : type === 'select' ? (
        <select
          ref={ref}
          className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-accent-900 text-accent-900 dark:text-accent-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
            error ? 'border-red-500' : 'border-accent-300 dark:border-accent-600'
          }`}
          {...props}
        >
          {children}
        </select>
      ) : (
        <input
          ref={ref}
          type={type}
          className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-accent-900 text-accent-900 dark:text-accent-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
            error ? 'border-red-500' : 'border-accent-300 dark:border-accent-600'
          }`}
          {...props}
        />
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;
