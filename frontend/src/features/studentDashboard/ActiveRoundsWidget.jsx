import { useNavigate }    from 'react-router-dom'
import { formatDateTime } from '../../utils/helpers'
import { ROUND_TYPE_LABELS, RESULT_CONFIG, ROUND_STATUS_CONFIG } from '../rounds/roundHelpers'

const ActiveRoundsWidget = ({ roundData = [] }) => {
  const navigate = useNavigate()

  if (!roundData.length) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-gray-400">Not in any rounds yet</p>
        <p className="text-xs text-gray-300 mt-1">You will see active rounds here once shortlisted</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {roundData.map((driveRounds) => (
        <div key={driveRounds.driveId} className="border border-gray-100 rounded-xl overflow-hidden">
          {/* Drive header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-purple-50 border-b border-purple-100">
            <div className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-bold">
              {driveRounds.company?.[0]?.toUpperCase()}
            </div>
            <p className="text-xs font-semibold text-purple-800">{driveRounds.company}</p>
            <p className="text-xs text-purple-500 truncate">— {driveRounds.driveTitle}</p>
          </div>

          {/* Rounds */}
          <div className="divide-y divide-gray-50">
            {driveRounds.rounds.map((round) => {
              const resultCfg = RESULT_CONFIG[round.result]   || RESULT_CONFIG.pending
              const statusCfg = ROUND_STATUS_CONFIG[round.roundStatus] || {}

              return (
                <div key={round.roundId} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {round.roundNumber}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">{round.name}</p>
                        <p className="text-xs text-gray-400">
                          {ROUND_TYPE_LABELS[round.type] || round.type}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${resultCfg.color}`}>
                        {resultCfg.label}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusCfg.color || 'bg-gray-100 text-gray-500'}`}>
                        {statusCfg.label || round.roundStatus}
                      </span>
                    </div>
                  </div>

                  {/* Round details */}
                  <div className="mt-2 ml-8 space-y-1 text-xs text-gray-500">
                    {round.scheduledAt && (
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDateTime(round.scheduledAt)}
                      </div>
                    )}
                    {round.venue && (
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {round.venue} ({round.mode})
                      </div>
                    )}
                  </div>

                  {/* Instructions */}
                  {round.instructions && (
                    <div className="mt-2 ml-8 bg-yellow-50 border border-yellow-100 rounded px-2.5 py-1.5">
                      <p className="text-xs text-yellow-700">
                        <span className="font-medium">Note: </span>
                        {round.instructions}
                      </p>
                    </div>
                  )}

                  {/* Remarks if any */}
                  {round.remarks && (
                    <div className="mt-2 ml-8">
                      <p className="text-xs text-gray-500 italic">"{round.remarks}"</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ActiveRoundsWidget