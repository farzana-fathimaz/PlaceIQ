import { formatDateTime } from '../../utils/helpers'

const dotColor = {
  applied:     'bg-blue-400',
  shortlisted: 'bg-yellow-400',
  in_rounds:   'bg-purple-400',
  placed:      'bg-green-500',
  rejected:    'bg-red-400',
  withdrawn:   'bg-gray-400',
}

const StatusHistory = ({ history = [] }) => {
  if (!history.length) return null

  return (
    <div className="space-y-3">
      {[...history].reverse().map((h, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${dotColor[h.status] || 'bg-gray-300'}`} />
            {i < history.length - 1 && (
              <div className="w-px flex-1 bg-gray-200 mt-1" />
            )}
          </div>
          <div className="pb-3">
            <p className="text-xs font-semibold text-gray-700 capitalize">
              {h.status.replace(/_/g, ' ')}
            </p>
            {h.note && (
              <p className="text-xs text-gray-400 mt-0.5">{h.note}</p>
            )}
            <p className="text-xs text-gray-300 mt-0.5">{formatDateTime(h.changedAt)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatusHistory