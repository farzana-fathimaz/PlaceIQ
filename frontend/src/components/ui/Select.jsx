const Select = ({
  label,
  name,
  options = [],
  error = '',
  placeholder = 'Select...',
  className = '',
  required = false,
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        className={`
          w-full px-3 py-2 text-sm rounded-lg border bg-white text-gray-900
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-colors
          ${error ? 'border-red-400' : 'border-gray-300'}
        `}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  )
}

export default Select