import { useState, useEffect }  from 'react'
import {
  getNotificationsApi,
  markAsReadApi,
  markAllAsReadApi,
  deleteNotificationApi,
  deleteAllReadApi,
} from '../../api/notifications.api'
import { useNotificationStore } from '../../store/notificationStore'
import { useUiStore }           from '../../store/uiStore'
import Button                   from '../../components/ui/Button'
import Select                   from '../../components/ui/Select'
import NotificationItem         from '../../features/notifications/NotificationItem'
import EmptyState               from '../../components/ui/EmptyState'

const filterOptions = [
  { label: 'Drive Open',       value: 'drive_open'       },
  { label: 'App Update',       value: 'application_update' },
  { label: 'Result Published', value: 'result_published' },
  { label: 'General',         value: 'general'           },
]

const StudentNotificationsPage = () => {
  const { notifications, unreadCount, setNotifications, markOneRead, markAllReadLocally, removeNotification } =
    useNotificationStore()
  const { showSuccess, showError } = useUiStore()

  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('')
  const [unreadOnly, setUnreadOnly] = useState(false)

  const fetchNotifications = async (params = {}) => {
    setLoading(true)
    try {
      const res = await getNotificationsApi({ limit: 50, ...params })
      setNotifications(res.data.data.notifications, res.data.data.pagination)
    } catch {
      showError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNotifications() }, [])

  const handleMarkRead = async (id) => {
    try {
      await markAsReadApi(id)
      markOneRead(id)
    } catch {}
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllAsReadApi()
      markAllReadLocally()
      showSuccess('All notifications marked as read')
    } catch {
      showError('Failed to mark all as read')
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteNotificationApi(id)
      removeNotification(id)
    } catch {
      showError('Failed to delete')
    }
  }

  const handleClearRead = async () => {
    try {
      await deleteAllReadApi()
      showSuccess('Read notifications cleared')
      fetchNotifications()
    } catch {
      showError('Failed to clear notifications')
    }
  }

  const handleFilterChange = (val) => {
    setFilter(val)
    fetchNotifications({ type: val, unread: unreadOnly ? 'true' : undefined })
  }

  const handleUnreadToggle = () => {
    const next = !unreadOnly
    setUnreadOnly(next)
    fetchNotifications({ type: filter, unread: next ? 'true' : undefined })
  }

  return (
    <div className="page-wrapper max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Notifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button size="sm" variant="secondary" onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          )}
          <Button size="sm" variant="ghost" className="text-red-500" onClick={handleClearRead}>
            Clear read
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <Select
          placeholder="All Types"
          options={filterOptions}
          value={filter}
          className="w-48"
          onChange={(e) => handleFilterChange(e.target.value)}
        />
        <button
          onClick={handleUnreadToggle}
          className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
            unreadOnly
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
          }`}
        >
          Unread only
        </button>
        {(filter || unreadOnly) && (
          <button
            onClick={() => { setFilter(''); setUnreadOnly(false); fetchNotifications() }}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Notifications list */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-6 w-6 rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            title="No notifications"
            description="You will receive notifications about drives, applications, and results here"
          />
        ) : (
          notifications.map((n) => (
            <NotificationItem
              key={n._id}
              notification={n}
              onRead={handleMarkRead}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default StudentNotificationsPage