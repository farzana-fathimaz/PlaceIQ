import { useNavigate } from 'react-router-dom'
import { formatDate }  from '../../utils/helpers'
import Badge           from '../../components/ui/Badge'
import Button          from '../../components/ui/Button'

const EligibleDrivesWidget = ({ drives = [] }) => {
  const navigate = useNavigate()

  if (!drives.length) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-gray-400">No new eligible drives right now</p>
        <p className="text-xs text-gray-300 mt-1">Check back later for new opportunities</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {drives.map((drive) => (
        <div
          key={drive._id}
          onClick={() => navigate(`/student/drives/${drive._id}`)}
          className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 text-sm font-bold shrink-0">
            {drive.company?.[0]?.toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-700 transition-colors">
                {drive.company}
              </p>
              {drive.salaryLPA && (
                <span className="text-xs font-bold text-green-600 shrink-0">
                  ₹{drive.salaryLPA}L
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 truncate">{drive.title}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant="blue">{drive.type}</Badge>
              {drive.lastApplyDate && (
                <span className="text-xs text-red-500 font-medium">
                  Apply by {formatDate(drive.lastApplyDate)}
                </span>
              )}
            </div>
          </div>

          <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      ))}

      <button
        onClick={() => navigate('/student/drives')}
        className="w-full text-xs text-blue-600 hover:text-blue-800 font-medium py-2 border border-dashed border-blue-200 rounded-lg hover:border-blue-400 transition-colors"
      >
        View all eligible drives →
      </button>
    </div>
  )
}

export default EligibleDrivesWidget