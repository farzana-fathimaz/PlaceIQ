import { useState, useEffect, useCallback } from 'react'
import { getApplicationsByDriveApi, updateApplicationStatusApi, getApplicationStatsApi } from '../../api/applications.api'
import { useUiStore }            from '../../store/uiStore'
import { formatDate }            from '../../utils/helpers'
import Button                    from '../../components/ui/Button'
import Badge                     from '../../components/ui/Badge'
import Input                     from '../../components/ui/Input'
import Select                    from '../../components/ui/Select'
import EmptyState                from '../../components/ui/EmptyState'
import ApplicationStatusBadge    from './ApplicationStatusBadge'
import StatusHistory             from './StatusHistory'
import Modal                     from '../../components/ui/Modal'

const NEXT_STATUS = {
  applied:     [{ label: 'Shortlist',  value: 'shortlisted' }, { label: 'Reject', value: 'rejected' }],
  shortlisted: [{ label: 'Move to Rounds', value: 'in_rounds'  }, { label: 'Reject', value: 'rejected' }],
  in_rounds:   [{ label: 'Mark Placed',    value: 'placed'     }, { label: 'Reject', value: 'rejected' }],
}

const DriveApplicationsTable = ({ driveId }) => {
  const [applications, setApplications] = useState([])
  const [pagination,   setPagination]   = useState(null)
  const [stats,        setStats]        = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [search,       setSearch]       = useState('')
  const [selected,     setSelected]     = useState(null)
  const [noteModal,    setNoteModal]    = useState(null)
  const [note,         setNote]         = useState('')
  const [updating,     setUpdating]     = useState(false)
  const { showSuccess, showError }      = useUiStore()

  const fetchApplications = useCallback(async (extra = {}) => {
    setLoading(true)
    try {
      const params = { status: statusFilter, search, ...extra }
      const [appsRes, statsRes] = await Promise.all([
        getApplicationsByDriveApi(driveId, params),
        getApplicationStatsApi(driveId),
      ])
      setApplications(appsRes.data.data.applications)
      setPagination(appsRes.data.data.pagination)
      setStats(statsRes.data.data.stats)
    } catch {
      showError('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }, [driveId, statusFilter, search])

  useEffect(() => { fetchApplications() }, [driveId, statusFilter])

  const openNoteModal = (app, newStatus) => {
    setNoteModal({ app, newStatus })
    setNote('')
  }

  const handleStatusUpdate = async () => {
    if (!noteModal) return
    setUpdating(true)
    try {
      await updateApplicationStatusApi(noteModal.app._id, {
        status: noteModal.newStatus,
        note,
      })
      showSuccess(`Application ${noteModal.newStatus}`)
      setNoteModal(null)
      setSelected(null)
      fetchApplications()
    } catch (err) {
      showError(err.response?.data?.message || 'Update failed')
    } finally {
      setUpdating(false)
    }
  }

  const statusOptions = [
    { label: 'Applied',     value: 'applied'     },
    { label: 'Shortlisted', value: 'shortlisted' },
    { label: 'In Rounds',   value: 'in_rounds'   },
    { label: 'Placed',      value: 'placed'      },
    { label: 'Rejected',    value: 'rejected'    },
    { label: 'Withdrawn',   value: 'withdrawn'   },
  ]

  return (
    <div>
      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-6 gap-2 mb-4">
          {[
            { label: 'Applied',     value: stats.applied,     color: 'text-blue-600'   },
            { label: 'Shortlisted', value: stats.shortlisted, color: 'text-yellow-600' },
            { label: 'In Rounds',   value: stats.in_rounds,   color: 'text-purple-600' },
            { label: 'Placed',      value: stats.placed,      color: 'text-green-600'  },
            { label: 'Rejected',    value: stats.rejected,    color: 'text-red-500'    },
            { label: 'Withdrawn',   value: stats.withdrawn,   color: 'text-gray-400'   },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <Input
          placeholder="Search name or email..."
          value={search}
          className="flex-1 max-w-xs"
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchApplications()}
        />
        <Select
          placeholder="All Statuses"
          options={statusOptions}
          value={statusFilter}
          className="w-44"
          onChange={(e) => setStatusFilter(e.target.value)}
        />
        <Button variant="secondary" onClick={() => fetchApplications()}>Search</Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-6 w-6 rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      ) : applications.length === 0 ? (
        <EmptyState title="No applications found" description="No applications match your filters" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Roll No</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">CGPA</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Backlogs</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Applied</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {applications.map((app) => {
                const sp      = app.studentProfile
                const actions = NEXT_STATUS[app.status] || []

                return (
                  <>
                    <tr
                      key={app._id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelected(selected === app._id ? null : app._id)}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{app.studentId?.name}</p>
                        <p className="text-xs text-gray-400">{app.studentId?.email}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">
                        {sp?.rollNumber || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${
                          (sp?.cgpa || 0) >= 8 ? 'text-green-600' :
                          (sp?.cgpa || 0) >= 6.5 ? 'text-yellow-600' : 'text-red-500'
                        }`}>
                          {sp?.cgpa ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={(sp?.activeBacklogs || 0) > 0 ? 'text-red-500 font-medium' : 'text-gray-400'}>
                          {sp?.activeBacklogs ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {formatDate(app.appliedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <ApplicationStatusBadge status={app.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          {actions.map((a) => (
                            <Button
                              key={a.value}
                              size="sm"
                              variant={a.value === 'rejected' ? 'ghost' : 'secondary'}
                              className={a.value === 'rejected' ? 'text-red-500' : ''}
                              onClick={() => openNoteModal(app, a.value)}
                            >
                              {a.label}
                            </Button>
                          ))}
                          {sp?.resumeUrl && (
                            
                              href={`http://localhost:5000${sp.resumeUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-600 hover:underline ml-1"
                            >
                              Resume
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expandable row — status history */}
                    {selected === app._id && (
                      <tr key={`${app._id}-expand`}>
                        <td colSpan={7} className="bg-gray-50 px-8 py-4 border-b border-gray-200">
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-2">Status History</p>
                              <StatusHistory history={app.statusHistory || []} />
                            </div>
                            {app.notes && (
                              <div>
                                <p className="text-xs font-medium text-gray-500 mb-2">Officer Notes</p>
                                <p className="text-sm text-gray-600">{app.notes}</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-500">
            Page {pagination.page} of {pagination.totalPages} — {pagination.total} applications
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" disabled={pagination.page <= 1}
              onClick={() => fetchApplications({ page: pagination.page - 1 })}>Previous</Button>
            <Button size="sm" variant="secondary" disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchApplications({ page: pagination.page + 1 })}>Next</Button>
          </div>
        </div>
      )}

      {/* Status update note modal */}
      <Modal
        isOpen={!!noteModal}
        onClose={() => setNoteModal(null)}
        title={`${noteModal?.newStatus === 'rejected' ? 'Reject' : 'Update'} Application`}
        size="sm"
        showFooter
        onConfirm={handleStatusUpdate}
        confirmText="Confirm"
        confirmVariant={noteModal?.newStatus === 'rejected' ? 'danger' : 'primary'}
        loading={updating}
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Moving <strong>{noteModal?.app?.studentId?.name}</strong> to{' '}
            <strong className="capitalize">{noteModal?.newStatus?.replace(/_/g, ' ')}</strong>.
          </p>
          <div>
            <label className="label">Note (optional)</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Add a note for this status change..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default DriveApplicationsTable