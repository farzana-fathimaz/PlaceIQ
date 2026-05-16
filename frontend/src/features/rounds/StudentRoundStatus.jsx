import { useState, useEffect } from 'react'
import { getStudentRoundStatusApi } from '../../api/rounds.api'
import { formatDateTime }           from '../../utils/helpers'
import { ROUND_TYPE_LABELS, RESULT_CONFIG, ROUND_STATUS_CONFIG } from './roundHelpers'
import Badge from '../../components/ui/Badge'

const StudentRoundStatus = ({ driveId }) => {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getStudentRoundStatusApi(driveId)
        setData(res.data.data.roundStatus)
      } catch {}
      finally { setLoading(false) }
    }
    fetch()
  }, [driveId])

  if (loading) return (
    <div className="flex items-center gap-2 py-4">
      <div className="animate-spin h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent" />
      <span className="text-xs text-gray-400">Loading round status...</span>
    </div>
  )

  if (!data || data.rounds.length === 0) return null

  return (
    <div className="space-y-3">
      {data.rounds.map((round) => {
        const resultCfg = RESULT_CONFIG[round.result]   || RESULT_CONFIG.pending
        const statusCfg = ROUND_STATUS_CONFIG[round.roundStatus] || {}

        return (
          <div
            key={round.roundId}
            className="border border-gray-200 rounded-xl p-4 bg-white"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {round.roundNumber}
                  </span>
                  <h4 className="text-sm font-semibold text-gray-800">{round.name}</h4>
                </div>
                <p className="text-xs text-gray-400 mt-1 ml-8">
                  {ROUND_TYPE_LABELS[round.type] || round.type}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${resultCfg.color}`}>
                  {resultCfg.label}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusCfg.color || 'bg-gray-100 text-gray-500'}`}>
                  {statusCfg.label || round.roundStatus}
                </span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500 ml-8">
              {round.scheduledAt && (
                <div>
                  <span className="text-gray-400">Scheduled: </span>
                  <span>{formatDateTime(round.scheduledAt)}</span>
                </div>
              )}
              {round.venue && (
                <div>
                  <span className="text-gray-400">Venue: </span>
                  <span>{round.venue}</span>
                </div>
              )}
              {round.mode && (
                <div>
                  <span className="text-gray-400">Mode: </span>
                  <span className="capitalize">{round.mode}</span>
                </div>
              )}
              {round.duration && (
                <div>
                  <span className="text-gray-400">Duration: </span>
                  <span>{round.duration}</span>
                </div>
              )}
            </div>

            {round.instructions && (
              <div className="mt-2 ml-8 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                <p className="text-xs text-yellow-700">
                  <span className="font-medium">Instructions: </span>
                  {round.instructions}
                </p>
              </div>
            )}

            {round.remarks && (
              <div className="mt-2 ml-8 bg-gray-50 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-500">
                  <span className="font-medium text-gray-600">Feedback: </span>
                  {round.remarks}
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default StudentRoundStatus