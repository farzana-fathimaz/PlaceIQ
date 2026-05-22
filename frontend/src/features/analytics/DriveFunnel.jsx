import { formatDate } from '../../utils/helpers'
import Badge          from '../../components/ui/Badge'

const statusVariant = {
  active:   'green',
  closed:   'red',
  upcoming: 'blue',
  archived: 'default',
}

const DriveFunnel = ({ drives = [] }) => {
  if (!drives.length) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-gray-400">
        No drive data available
      </div>
    )
  }

  const maxApplicants = Math.max(...drives.map((d) => d.totalApplicants), 1)

  return (
    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
      {drives.map((drive) => (
        <div key={drive.driveId} className="group">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
                {drive.company?.[0]?.toUpperCase()}
              </div>
              <p className="text-xs font-medium text-gray-700 truncate">
                {drive.company} — {drive.title}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-2">
              <span className="text-xs text-green-600 font-semibold">
                {drive.totalPlaced}/{drive.totalApplicants}
              </span>
              <Badge variant={statusVariant[drive.status] || 'default'}>
                {drive.status}
              </Badge>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-200 rounded-full relative"
              style={{ width: `${(drive.totalApplicants / maxApplicants) * 100}%` }}
            >
              <div
                className="h-full bg-green-500 rounded-full absolute left-0 top-0"
                style={{
                  width: drive.totalApplicants > 0
                    ? `${(drive.totalPlaced / drive.totalApplicants) * 100}%`
                    : '0%',
                }}
              />
            </div>
          </div>

          <div className="flex justify-between mt-0.5">
            <span className="text-xs text-gray-400">
              {drive.conversionRate}% conversion
              {drive.salaryLPA > 0 && ` · ₹${drive.salaryLPA} LPA`}
            </span>
            <span className="text-xs text-gray-400">
              {formatDate(drive.driveDate)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default DriveFunnel