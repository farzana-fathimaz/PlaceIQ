import { useState } from 'react'
import Button  from '../../components/ui/Button'
import { markRoundResultsApi } from '../../api/rounds.api'
import { useUiStore }          from '../../store/uiStore'
import { RESULT_CONFIG }       from './roundHelpers'

const MarkResultsPanel = ({ round, onSuccess }) => {
  const { showSuccess, showError } = useUiStore()
  const [results,  setResults]  = useState(() =>
    (round.results || []).reduce((acc, r) => {
      acc[r.applicationId] = { result: r.result, remarks: r.remarks || '' }
      return acc
    }, {})
  )
  const [saving, setSaving] = useState(false)

  const setResult  = (appId, field, val) =>
    setResults((prev) => ({
      ...prev,
      [appId]: { ...prev[appId], [field]: val },
    }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = Object.entries(results).map(([applicationId, data]) => ({
        applicationId,
        result:  data.result,
        remarks: data.remarks,
      }))
      await markRoundResultsApi(round._id, payload)
      showSuccess('Results saved successfully')
      onSuccess()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save results')
    } finally {
      setSaving(false)
    }
  }

  const resultButtons = ['pass', 'pending', 'fail']

  if (!round.results || round.results.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-400">No students in this round</p>
      </div>
    )
  }

  const passCount    = Object.values(results).filter((r) => r.result === 'pass').length
  const failCount    = Object.values(results).filter((r) => r.result === 'fail').length
  const pendingCount = Object.values(results).filter((r) => r.result === 'pending').length

  return (
    <div>
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Pass',    value: passCount,    color: 'text-green-600' },
          { label: 'Pending', value: pendingCount, color: 'text-gray-500'  },
          { label: 'Fail',    value: failCount,    color: 'text-red-500'   },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Student result rows */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {round.results.map((entry) => {
          const appId   = entry.applicationId?._id || entry.applicationId
          const current = results[appId] || { result: 'pending', remarks: '' }

          return (
            <div
              key={appId}
              className="border border-gray-200 rounded-lg p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {entry.studentId?.name || 'Student'}
                  </p>
                  <p className="text-xs text-gray-400">{entry.studentId?.email}</p>
                </div>

                {/* Result buttons */}
                <div className="flex gap-1 shrink-0">
                  {resultButtons.map((r) => {
                    const cfg     = RESULT_CONFIG[r]
                    const active  = current.result === r
                    return (
                      <button
                        key={r}
                        onClick={() => setResult(appId, 'result', r)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                          active
                            ? `${cfg.color} border-current`
                            : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {cfg.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Remarks input */}
              <input
                type="text"
                placeholder="Add remarks (optional)..."
                value={current.remarks}
                onChange={(e) => setResult(appId, 'remarks', e.target.value)}
                className="mt-2 w-full px-2 py-1.5 text-xs rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-400 text-gray-600 placeholder-gray-300"
              />
            </div>
          )
        })}
      </div>

      <div className="flex justify-end mt-4 pt-3 border-t border-gray-200">
        <Button onClick={handleSave} loading={saving}>
          Save All Results
        </Button>
      </div>
    </div>
  )
}

export default MarkResultsPanel