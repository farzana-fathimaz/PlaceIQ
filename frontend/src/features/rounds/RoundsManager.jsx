import { useState, useEffect } from 'react'
import {
  getRoundsForDriveApi,
  updateRoundStatusApi,
  deleteRoundApi,
} from '../../api/rounds.api'
import { useUiStore }     from '../../store/uiStore'
import { formatDateTime } from '../../utils/helpers'
import Button             from '../../components/ui/Button'
import Badge              from '../../components/ui/Badge'
import Modal              from '../../components/ui/Modal'
import EmptyState         from '../../components/ui/EmptyState'
import CreateRoundModal   from './CreateRoundModal'
import EditRoundModal     from './EditRoundModal'
import MarkResultsPanel   from './MarkResultsPanel'
import {
  ROUND_TYPE_LABELS,
  ROUND_TYPE_COLORS,
  ROUND_STATUS_CONFIG,
  RESULT_CONFIG,
  NEXT_ROUND_STATUS,
} from './roundHelpers'

const RoundsManager = ({ driveId }) => {
  const [rounds,       setRounds]       = useState([])
  const [loading,      setLoading]      = useState(true)
  const [showCreate,   setShowCreate]   = useState(false)
  const [editRound,    setEditRound]    = useState(null)
  const [resultsRound, setResultsRound] = useState(null)
  const [expanding,    setExpanding]    = useState(null)
  const { showSuccess, showError }      = useUiStore()

  const fetchRounds = async () => {
    setLoading(true)
    try {
      const res = await getRoundsForDriveApi(driveId)
      setRounds(res.data.data.rounds)
    } catch {
      showError('Failed to load rounds')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRounds() }, [driveId])

  const handleAdvanceStatus = async (round) => {
    const next = NEXT_ROUND_STATUS[round.status]
    if (!next) return
    try {
      await updateRoundStatusApi(round._id, next)
      showSuccess(`Round moved to ${next}`)
      fetchRounds()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update status')
    }
  }

  const handleDelete = async (round) => {
    if (!window.confirm(`Delete round "${round.name}"? This cannot be undone.`)) return
    try {
      await deleteRoundApi(round._id)
      showSuccess('Round deleted')
      fetchRounds()
    } catch (err) {
      showError(err.response?.data?.message || 'Delete failed')
    }
  }

  const toggleExpand = (id) =>
    setExpanding(expanding === id ? null : id)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-6 w-6 rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{rounds.length} round(s) created</p>
        <Button size="sm" onClick={() => setShowCreate(true)}>+ Add Round</Button>
      </div>

      {rounds.length === 0 ? (
        <EmptyState
          title="No rounds created"
          description="Create rounds for this drive to track interview stages"
          action={<Button onClick={() => setShowCreate(true)}>Create First Round</Button>}
        />
      ) : (
        <div className="space-y-3">
          {rounds.map((round) => {
            const statusCfg  = ROUND_STATUS_CONFIG[round.status]
            const isExpanded = expanding === round._id
            const next       = NEXT_ROUND_STATUS[round.status]

            const passCount    = round.results?.filter((r) => r.result === 'pass').length    || 0
            const failCount    = round.results?.filter((r) => r.result === 'fail').length    || 0
            const pendingCount = round.results?.filter((r) => r.result === 'pending').length || 0
            const totalCount   = round.results?.length || 0

            return (
              <div
                key={round._id}
                className="border border-gray-200 rounded-xl overflow-hidden bg-white"
              >
                {/* Round header */}
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Round number badge */}
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                      {round.roundNumber}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-800">{round.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={ROUND_TYPE_COLORS[round.type] || 'default'}>
                              {ROUND_TYPE_LABELS[round.type] || round.type}
                            </Badge>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCfg?.color}`}>
                              {statusCfg?.label}
                            </span>
                            <Badge variant={round.mode === 'online' ? 'blue' : 'default'}>
                              {round.mode}
                            </Badge>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          {round.status === 'ongoing' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setResultsRound(round)}
                            >
                              Mark Results
                            </Button>
                          )}
                          {next && (
                            <Button
                              size="sm"
                              onClick={() => handleAdvanceStatus(round)}
                            >
                              {next === 'ongoing' ? 'Start Round' : 'Complete'}
                            </Button>
                          )}
                          {round.status === 'scheduled' && (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => setEditRound(round)}>Edit</Button>
                              <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(round)}>Delete</Button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Round meta info */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        {round.scheduledAt && (
                          <span>{formatDateTime(round.scheduledAt)}</span>
                        )}
                        {round.venue && <span>{round.venue}</span>}
                        {round.duration && <span>{round.duration}</span>}
                      </div>

                      {/* Results summary bar */}
                      {totalCount > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center gap-3 text-xs mb-1.5">
                            <span className="text-green-600 font-medium">{passCount} pass</span>
                            <span className="text-gray-400">{pendingCount} pending</span>
                            <span className="text-red-500">{failCount} fail</span>
                            <span className="text-gray-300">/ {totalCount} total</span>
                          </div>
                          {totalCount > 0 && (
                            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden flex">
                              <div
                                className="bg-green-500 h-full"
                                style={{ width: `${(passCount / totalCount) * 100}%` }}
                              />
                              <div
                                className="bg-red-400 h-full"
                                style={{ width: `${(failCount / totalCount) * 100}%` }}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Toggle student list */}
                      {totalCount > 0 && (
                        <button
                          onClick={() => toggleExpand(round._id)}
                          className="text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium"
                        >
                          {isExpanded ? 'Hide students' : `View ${totalCount} students`}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Instructions banner */}
                  {round.instructions && (
                    <div className="mt-3 ml-13 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 ml-0 md:ml-13">
                      <p className="text-xs text-yellow-700">
                        <span className="font-medium">Instructions: </span>
                        {round.instructions}
                      </p>
                    </div>
                  )}
                </div>

                {/* Expanded student list */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                    <div className="space-y-2">
                      {round.results.map((entry) => {
                        const cfg = RESULT_CONFIG[entry.result] || RESULT_CONFIG.pending
                        return (
                          <div
                            key={entry._id}
                            className="flex items-center justify-between gap-3 py-1.5"
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                              <div>
                                <p className="text-xs font-medium text-gray-700">
                                  {entry.studentId?.name || 'Student'}
                                </p>
                                {entry.remarks && (
                                  <p className="text-xs text-gray-400">{entry.remarks}</p>
                                )}
                              </div>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
                              {cfg.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Create Round Modal */}
      <CreateRoundModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        driveId={driveId}
        onSuccess={fetchRounds}
      />

      {/* Edit Round Modal */}
      <EditRoundModal
        isOpen={!!editRound}
        onClose={() => setEditRound(null)}
        round={editRound}
        onSuccess={fetchRounds}
      />

      {/* Mark Results Modal */}
      <Modal
        isOpen={!!resultsRound}
        onClose={() => setResultsRound(null)}
        title={`Mark Results — ${resultsRound?.name}`}
        size="lg"
      >
        {resultsRound && (
          <MarkResultsPanel
            round={resultsRound}
            onSuccess={() => {
              setResultsRound(null)
              fetchRounds()
            }}
          />
        )}
      </Modal>
    </div>
  )
}

export default RoundsManager