import { forwardRef } from 'react'

const Input = forwardRef(({
  label,
  name,
  type = 'text',
  placeholder = '',
  error = '',
  className = '',
  required = false,
  ...props
}, ref) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        ref={ref}
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className={`
          w-full px-3 py-2 text-sm rounded-lg border transition-colors
          bg-white text-gray-900 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${error ? 'border-red-400 focus:ring-red-400' : 'border-gray-300'}
        `}
        {...props}
      />

      {error && (
        <p className="text-xs text-red-500 mt-0.5">
          {error}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input