import { useState, useEffect }      from 'react'
import {
  getNotificationsApi,
  markAsReadApi,
  markAllAsReadApi,
  deleteNotificationApi,
  deleteAllReadApi,
  sendNotificationApi,
} from '../../api/notifications.api'
import { getDrivesApi }             from '../../api/drives.api'
import { useNotificationStore }     from '../../store/notificationStore'
import { useUiStore }               from '../../store/uiStore'
import Button                       from '../../components/ui/Button'
import Card, { CardHeader }         from '../../components/ui/Card'
import Select                       from '../../components/ui/Select'
import NotificationItem             from '../../features/notifications/NotificationItem'
import EmptyState                   from '../../components/ui/EmptyState'

const targetGroupOptions = [
  { label: 'All Students',       value: 'all_students'    },
  { label: 'Drive Applicants',   value: 'drive_applicants' },
  { label: 'Placed Students',    value: 'placed_students'  },
]

const typeOptions = [
  { label: 'General',          value: 'general'          },
  { label: 'Drive Open',       value: 'drive_open'       },
  { label: 'Result Published', value: 'result_published' },
]

const defaultForm = {
  targetGroup:    'all_students',
  relatedDriveId: '',
  title:          '',
  message:        '',
  type:           'general',
  sendEmail:      true,
}

const NotificationsPage = () => {
  const { notifications, unreadCount, setNotifications, markOneRead, markAllReadLocally, removeNotification } = useNotificationStore()
  const { showSuccess, showError } = useUiStore()

  const [loading,  setLoading]  = useState(true)
  const [sending,  setSending]  = useState(false)
  const [drives,   setDrives]   = useState([])
  const [form,     setForm]     = useState(defaultForm)
  const [activeTab, setActiveTab] = useState('send')

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  useEffect(() => {
    fetchNotifications()
    fetchDrives()
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await getNotificationsApi({ limit: 50 })
      setNotifications(res.data.data.notifications, res.data.data.pagination)
    } catch {
      showError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const fetchDrives = async () => {
    try {
      const res = await getDrivesApi({ limit: 100 })
      setDrives(res.data.data.drives || [])
    } catch {}
  }

  const handleMarkRead = async (id) => {
    try {
      await markAsReadApi(id)
      markOneRead(id)
    } catch {
      showError('Failed to mark as read')
    }
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
      showError('Failed to delete notification')
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

  const handleSend = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      return showError('Title and message are required')
    }
    if (form.targetGroup === 'drive_applicants' && !form.relatedDriveId) {
      return showError('Please select a drive for drive applicants')
    }
    setSending(true)
    try {
      const res = await sendNotificationApi(form)
      showSuccess(`Notification sent to ${res.data.data.sent} recipient(s)`)
      setForm(defaultForm)
      if (activeTab === 'inbox') fetchNotifications()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to send notification')
    } finally {
      setSending(false)
    }
  }

  const driveOptions = drives.map((d) => ({ label: `${d.company} — ${d.title}`, value: d._id }))

  return (
    <div className="page-wrapper">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Notifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">Send and manage notifications</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-5">
        {[
          { key: 'send',  label: 'Send Notification'  },
          { key: 'inbox', label: `My Inbox (${unreadCount} unread)` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); if (tab.key === 'inbox') fetchNotifications() }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Send Notification */}
      {activeTab === 'send' && (
        <div className="max-w-2xl">
          <Card>
            <CardHeader title="Compose Notification" subtitle="Send to students based on group or criteria" />

            <div className="space-y-4">
              <Select
                label="Target Group"
                required
                options={targetGroupOptions}
                value={form.targetGroup}
                onChange={(e) => set('targetGroup', e.target.value)}
              />

              {form.targetGroup === 'drive_applicants' && (
                <Select
                  label="Select Drive"
                  required
                  options={driveOptions}
                  value={form.relatedDriveId}
                  onChange={(e) => set('relatedDriveId', e.target.value)}
                  placeholder="Choose a drive..."
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Notification Type"
                  options={typeOptions}
                  value={form.type}
                  onChange={(e) => set('type', e.target.value)}
                />
              </div>

              <div>
                <label className="label">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Notification title..."
                  value={form.title}
                  maxLength={120}
                  onChange={(e) => set('title', e.target.value)}
                />
                <p className="text-xs text-gray-300 mt-1 text-right">{form.title.length}/120</p>
              </div>

              <div>
                <label className="label">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Write your notification message here..."
                  value={form.message}
                  maxLength={500}
                  onChange={(e) => set('message', e.target.value)}
                />
                <p className="text-xs text-gray-300 mt-1 text-right">{form.message.length}/500</p>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="sendEmail"
                  checked={form.sendEmail}
                  onChange={(e) => set('sendEmail', e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                <label htmlFor="sendEmail" className="text-sm text-gray-700 cursor-pointer">
                  Also send email notification
                  <span className="text-xs text-gray-400 ml-1">(requires SMTP setup)</span>
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleSend} loading={sending} className="min-w-32">
                  Send Notification
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Inbox */}
      {activeTab === 'inbox' && (
        <div className="max-w-2xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">{notifications.length} notification(s)</p>
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

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-6 w-6 rounded-full border-2 border-blue-600 border-t-transparent" />
              </div>
            ) : notifications.length === 0 ? (
              <EmptyState title="No notifications" description="Notifications you receive will appear here" />
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
      )}
    </div>
  )
}

export default NotificationsPage