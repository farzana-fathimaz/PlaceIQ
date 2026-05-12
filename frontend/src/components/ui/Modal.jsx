import { useEffect } from 'react'
import Button from './Button'

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showFooter = false,
  onConfirm,
  confirmText = 'Confirm',
  confirmVariant = 'primary',
  loading = false,
}) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className={`relative bg-white rounded-xl shadow-xl w-full ${sizes[size]} z-10 max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4 flex-1">
          {children}
        </div>

        {showFooter && (
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
              {confirmText}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal