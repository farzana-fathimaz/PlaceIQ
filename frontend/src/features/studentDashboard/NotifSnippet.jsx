import { useNavigate }  from 'react-router-dom'
import { formatDateTime } from '../../utils/helpers'

const typeColor = {
  drive_open:          'bg-blue-100 text-blue-600',
  application_update:  'bg-green-100 text-green-600',
  result_published:    'bg-purple-100 text-purple-600',
  general:             'bg-gray-100 text-gray-500',
}

const typeIcon = {
  drive_open: '🏢',
  application_update: '📋',
  result_published: '📊',
  general: '🔔',
}

const NotifSnippet = ({ notifications = [] }) => {
  const navigate = useNavigate()

  if (!notifications.length) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-gray-400">No notifications yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {notifications.map((n) => (
        <div
          key={n._id}
          className={`flex gap-3 p-3 rounded-xl transition-colors ${
            !n.isRead ? 'bg-blue-50 border border-blue-100' : 'border border-gray-100'
          }`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${typeColor[n.type] || typeColor.general}`}>
            {typeIcon[n.type] || '🔔'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className={`text-xs font-medium leading-snug ${!n.isRead ? 'text-gray-800' : 'text-gray-600'}`}>
                {n.title}
              </p>
              {!n.isRead && (
                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{n.message}</p>
            <p className="text-xs text-gray-300 mt-0.5">{formatDateTime(n.createdAt)}</p>
          </div>
        </div>
      ))}
      <button
        onClick={() => navigate('/student/notifications')}
        className="w-full text-xs text-blue-600 hover:text-blue-800 font-medium py-2 border border-dashed border-blue-200 rounded-lg hover:border-blue-400 transition-colors"
      >
        View all notifications →
      </button>
    </div>
  )
}

export default NotifSnippet