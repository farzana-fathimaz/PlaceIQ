import { useNavigate }          from 'react-router-dom'
import { useNotificationStore } from '../../store/notificationStore'
import { useAuthStore }         from '../../store/authStore'

const NotificationBell = () => {
  const { unreadCount }  = useNotificationStore()
  const { user }         = useAuthStore()
  const navigate         = useNavigate()

  const path = user?.role === 'officer'
    ? '/officer/notifications'
    : '/student/notifications'

  return (
    <button
      onClick={() => navigate(path)}
      className="relative text-gray-400 hover:text-gray-600 transition-colors p-1"
      title="Notifications"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}

export default NotificationBell