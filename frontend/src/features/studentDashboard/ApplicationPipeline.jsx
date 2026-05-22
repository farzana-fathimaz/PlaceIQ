import { useNavigate } from 'react-router-dom'
import { formatDate }  from '../../utils/helpers'
import ApplicationStatusBadge from '../applications/ApplicationStatusBadge'

const STATUS_ORDER   = ['applied', 'shortlisted', 'in_rounds', 'placed']
const STATUS_LABELS  = {
  applied:     'Applied',
  shortlisted: 'Shortlisted',
  in_rounds:   'In Rounds',
  placed:      'Placed',
}

const STATUS_STEP_COLOR = {
  applied:     'bg-blue-500',
  shortlisted: 'bg-yellow-500',
  in_rounds:   'bg-purple-500',
  placed:      'bg-green-500',
}

const ApplicationPipeline = ({ applications = [] }) => {
  const navigate = useNavigate()

  if (!applications.length) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-sm text-gray-400">No applications yet</p>
        <button
          onClick={() => navigate('/student/drives')}
          className="mt-2 text-xs text-blue-600 hover:underline"
        >
          Browse available drives →
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {applications.map((app) => {
        const drive       = app.driveId
        const activeStep  = STATUS_ORDER.indexOf(app.status)
        const isClosed    = ['rejected', 'withdrawn'].includes(app.status)

        return (
          <div
            key={app._id}
            className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors cursor-pointer"
            onClick={() => navigate('/student/applications')}
          >
            {/* Drive header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0 mt-0.5">
                  {drive?.company?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{drive?.company}</p>
                  <p className="text-xs text-gray-400 truncate max-w-48">
                    {drive?.title}
                  </p>
                </div>
              </div>
              <ApplicationStatusBadge status={app.status} />
            </div>

            {/* Pipeline steps */}
            {!isClosed ? (
              <div className="flex items-center gap-0 mt-2">
                {STATUS_ORDER.map((step, i) => {
                  const done    = i <= activeStep
                  const current = i === activeStep
                  const last    = i === STATUS_ORDER.length - 1

                  return (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          done
                            ? `${STATUS_STEP_COLOR[step]} border-transparent`
                            : 'bg-white border-gray-200'
                        }`}>
                          {done && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <p className={`text-[10px] mt-1 font-medium ${
                          current ? 'text-gray-700' : done ? 'text-gray-500' : 'text-gray-300'
                        }`}>
                          {STATUS_LABELS[step]}
                        </p>
                      </div>
                      {!last && (
                        <div className={`h-0.5 flex-1 mx-1 mb-4 transition-colors ${
                          i < activeStep ? 'bg-green-400' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="mt-2 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${app.status === 'rejected' ? 'bg-red-400' : 'bg-gray-300'}`} />
                <p className="text-xs text-gray-400">
                  {app.status === 'rejected' ? 'Application was not selected' : 'Application withdrawn'}
                </p>
              </div>
            )}

            {/* Drive meta */}
            <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
              {drive?.salaryLPA && (
                <span className="text-green-600 font-medium">₹{drive.salaryLPA} LPA</span>
              )}
              {drive?.jobRole && <span>{drive.jobRole}</span>}
              <span>Applied {formatDate(app.appliedAt)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ApplicationPipeline