import { formatDateTime } from '../../utils/helpers'

const typeIcons = {
  drive_open: (
    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  application_update: (
    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  result_published: (
    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  general: (
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
    </svg>
  ),
}

const NotificationItem = ({ notification, onRead, onDelete }) => {
  const icon = typeIcons[notification.type] || typeIcons.general

  return (
    <div
      className={`flex gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors group ${
        !notification.isRead ? 'bg-blue-50/50' : ''
      }`}
    >
      {/* Icon dot */}
      <div className="shrink-0 mt-0.5">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          !notification.isRead ? 'bg-blue-100' : 'bg-gray-100'
        }`}>
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium leading-snug ${
            !notification.isRead ? 'text-gray-900' : 'text-gray-600'
          }`}>
            {notification.title}
          </p>
          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {!notification.isRead && (
              <button
                onClick={() => onRead(notification._id)}
                className="text-xs text-blue-600 hover:text-blue-800 whitespace-nowrap"
                title="Mark as read"
              >
                Read
              </button>
            )}
            <button
              onClick={() => onDelete(notification._id)}
              className="text-xs text-red-400 hover:text-red-600"
              title="Delete"
            >
              ✕
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notification.message}</p>
        <p className="text-xs text-gray-300 mt-1">{formatDateTime(notification.createdAt)}</p>
      </div>

      {/* Unread dot */}
      {!notification.isRead && (
        <div className="shrink-0 mt-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
        </div>
      )}
    </div>
  )
}

export default NotificationItem