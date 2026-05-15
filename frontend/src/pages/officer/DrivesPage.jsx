import { useState, useEffect, useCallback } from 'react'
import { useNavigate }    from 'react-router-dom'
import { getDrivesApi, getDriveStatsApi, updateDriveStatusApi, deleteDriveApi } from '../../api/drives.api'
import { useDriveStore }  from '../../store/driveStore'
import { useUiStore }     from '../../store/uiStore'
import { formatDate, debounce } from '../../utils/helpers'
import Button             from '../../components/ui/Button'
import Input              from '../../components/ui/Input'
import Select             from '../../components/ui/Select'
import Card               from '../../components/ui/Card'
import EmptyState         from '../../components/ui/EmptyState'
import DriveStatusBadge   from '../../features/drives/DriveStatusBadge'
import CreateDriveModal   from '../../features/drives/CreateDriveModal'

const statusOptions = [
  { label: 'Draft',    value: 'draft'    },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Active',   value: 'active'   },
  { label: 'Closed',   value: 'closed'   },
]

const typeOptions = [
  { label: 'Tech',     value: 'tech'     },
  { label: 'Non-Tech', value: 'non-tech' },
  { label: 'Both',     value: 'both'     },
]

const nextStatus = {
  draft:    'upcoming',
  upcoming: 'active',
  active:   'closed',
}

const DrivesPage = () => {
  const { drives, pagination, stats, filters, setDrives, setStats, setFilters, resetFilters } = useDriveStore()
  const { showSuccess, showError } = useUiStore()
  const navigate  = useNavigate()

  const [loading,     setLoading]     = useState(false)
  const [showCreate,  setShowCreate]  = useState(false)
  const [showArchived, setShowArchived] = useState(false)

  const fetchDrives = useCallback(async (extra = {}) => {
    setLoading(true)
    try {
      const params = { ...filters, ...extra }
      if (showArchived) params.archived = 'true'
      const res = await getDrivesApi(params)
      setDrives(res.data.data.drives, res.data.data.pagination)
    } catch {
      showError('Failed to load drives')
    } finally {
      setLoading(false)
    }
  }, [filters, showArchived])

  const fetchStats = async () => {
    try {
      const res = await getDriveStatsApi()
      setStats(res.data.data.stats)
    } catch {}
  }

  useEffect(() => {
    fetchDrives()
    fetchStats()
  }, [showArchived])

  const debouncedSearch = useCallback(
    debounce((val) => {
      setFilters({ search: val })
      fetchDrives({ search: val })
    }, 500),
    []
  )

  const handleFilterChange = (key, val) => {
    setFilters({ [key]: val })
    fetchDrives({ [key]: val })
  }

  const handleStatusAdvance = async (drive) => {
    const next = nextStatus[drive.status]
    if (!next) return
    try {
      await updateDriveStatusApi(drive._id, next)
      showSuccess(`Drive moved to ${next}`)
      fetchDrives()
      fetchStats()
    } catch (err) {
      showError(err.response?.data?.message || 'Status update failed')
    }
  }

  const handleArchive = async (drive) => {
    if (!window.confirm(`Archive "${drive.title}"? This cannot be undone.`)) return
    try {
      await updateDriveStatusApi(drive._id, 'archived')
      showSuccess('Drive archived')
      fetchDrives()
      fetchStats()
    } catch (err) {
      showError(err.response?.data?.message || 'Archive failed')
    }
  }

  const handleDelete = async (drive) => {
    if (!window.confirm(`Delete "${drive.title}"? This is permanent.`)) return
    try {
      await deleteDriveApi(drive._id)
      showSuccess('Drive deleted')
      fetchDrives()
      fetchStats()
    } catch (err) {
      showError(err.response?.data?.message || 'Delete failed')
    }
  }

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Placement Drives</h1>
          <p className="text-sm text-gray-500 mt-0.5">{pagination?.total ?? 0} drives</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => { setShowArchived(!showArchived); resetFilters() }}
          >
            {showArchived ? 'View Active' : 'View Archived'}
          </Button>
          <Button onClick={() => setShowCreate(true)}>+ Create Drive</Button>
        </div>
      </div>

      {/* Stats row */}
      {stats && !showArchived && (
        <div className="grid grid-cols-5 gap-3 mb-5">
          {[
            { label: 'Draft',    value: stats.draft,    color: 'text-gray-600'  },
            { label: 'Upcoming', value: stats.upcoming, color: 'text-blue-600'  },
            { label: 'Active',   value: stats.active,   color: 'text-green-600' },
            { label: 'Closed',   value: stats.closed,   color: 'text-red-500'   },
            { label: 'Archived', value: stats.archived, color: 'text-gray-400'  },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card className="mb-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="col-span-2">
            <Input
              placeholder="Search title, company, role..."
              defaultValue={filters.search}
              onChange={(e) => debouncedSearch(e.target.value)}
            />
          </div>
          {!showArchived && (
            <Select
              placeholder="All Statuses"
              options={statusOptions}
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            />
          )}
          <Select
            placeholder="All Types"
            options={typeOptions}
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          />
          <Button variant="ghost" onClick={() => { resetFilters(); fetchDrives({ search: '', status: '', type: '' }) }}>
            Reset
          </Button>
        </div>
      </Card>

      {/* Drive Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-7 w-7 rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      ) : drives.length === 0 ? (
        <EmptyState
          title={showArchived ? 'No archived drives' : 'No drives found'}
          description={showArchived ? '' : 'Create your first placement drive'}
          action={!showArchived && <Button onClick={() => setShowCreate(true)}>Create Drive</Button>}
        />
      ) : (
        <div className="space-y-3">
          {drives.map((drive) => (
            <div
              key={drive._id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-card transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Company logo placeholder */}
                <div className="w-11 h-11 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 text-sm font-bold shrink-0">
                  {drive.company?.[0]?.toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800 truncate">{drive.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{drive.company} · {drive.jobRole || 'Role not specified'} · {drive.jobLocation || 'Location TBD'}</p>
                    </div>
                    <DriveStatusBadge status={drive.status} />
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span>{drive.type?.toUpperCase()}</span>
                    {drive.salaryLPA && <span className="text-green-600 font-medium">₹{drive.salaryLPA} LPA</span>}
                    {drive.driveDate && <span>Drive: {formatDate(drive.driveDate)}</span>}
                    {drive.lastApplyDate && <span>Apply by: {formatDate(drive.lastApplyDate)}</span>}
                    <span>{drive.totalApplicants} applicants</span>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <Button size="sm" variant="secondary" onClick={() => navigate(`/officer/drives/${drive._id}`)}>
                      View
                    </Button>
                    {nextStatus[drive.status] && (
                      <Button size="sm" onClick={() => handleStatusAdvance(drive)}>
                        Move to {nextStatus[drive.status]}
                      </Button>
                    )}
                    {drive.status !== 'archived' && (
                      <Button size="sm" variant="ghost" onClick={() => handleArchive(drive)}>
                        Archive
                      </Button>
                    )}
                    {drive.totalApplicants === 0 && drive.status === 'draft' && (
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(drive)} className="text-red-500">
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">Page {pagination.page} of {pagination.totalPages}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" disabled={pagination.page <= 1} onClick={() => fetchDrives({ page: pagination.page - 1 })}>Previous</Button>
            <Button size="sm" variant="secondary" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchDrives({ page: pagination.page + 1 })}>Next</Button>
          </div>
        </div>
      )}

      <CreateDriveModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => { fetchDrives(); fetchStats() }}
      />
    </div>
  )
}

export default DrivesPage