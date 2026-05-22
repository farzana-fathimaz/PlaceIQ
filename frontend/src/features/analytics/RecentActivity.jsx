import { formatDateTime } from '../../utils/helpers'
import ApplicationStatusBadge from '../applications/ApplicationStatusBadge'

const RecentActivity = ({ applications = [], drives = [] }) => (
  <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
    {applications.length === 0 && drives.length === 0 && (
      <p className="text-sm text-gray-400 text-center py-6">No recent activity</p>
    )}
    {applications.map((a, i) => (
      <div key={`app-${i}`} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
        <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-700">
            <span className="font-medium">{a.studentName}</span>
            {' — '}
            <span className="text-gray-500">{a.company}</span>
          </p>
          <p className="text-xs text-gray-400 truncate">{a.driveTitle}</p>
          <p className="text-xs text-gray-300 mt-0.5">{formatDateTime(a.updatedAt)}</p>
        </div>
        <ApplicationStatusBadge status={a.status} />
      </div>
    ))}
  </div>
)

export default RecentActivity