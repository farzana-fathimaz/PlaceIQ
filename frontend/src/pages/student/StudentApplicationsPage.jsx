import { useState, useEffect } from 'react'
import { useNavigate }              from 'react-router-dom'
import { getMyApplicationsApi, withdrawApplicationApi } from '../../api/applications.api'
import { useUiStore }               from '../../store/uiStore'
import { formatDate }               from '../../utils/helpers'
import Card                         from '../../components/ui/Card'
import Badge                        from '../../components/ui/Badge'
import Button                       from '../../components/ui/Button'
import Select                       from '../../components/ui/Select'
import EmptyState                   from '../../components/ui/EmptyState'
import ApplicationStatusBadge       from '../../features/applications/ApplicationStatusBadge'
import StatusHistory                from '../../features/applications/StatusHistory'
import StudentRoundStatus from '../../features/rounds/StudentRoundStatus'

const statusOptions = [
  { label: 'Applied',     value: 'applied'     },
  { label: 'Shortlisted', value: 'shortlisted' },
  { label: 'In Rounds',   value: 'in_rounds'   },
  { label: 'Placed',      value: 'placed'      },
  { label: 'Rejected',    value: 'rejected'    },
  { label: 'Withdrawn',   value: 'withdrawn'   },
]

const StudentApplicationsPage = () => {
  const [applications, setApplications] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [expanded,     setExpanded]     = useState(null)
  const [withdrawing,  setWithdrawing]  = useState(null)
  const { showSuccess, showError }      = useUiStore()
  const navigate = useNavigate()

  const fetchApplications = async (status = '') => {
    setLoading(true)
    try {
      const params = status ? { status } : {}
      const res    = await getMyApplicationsApi(params)
      setApplications(res.data.data.applications)
    } catch {
      showError('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchApplications() }, [])

  const handleWithdraw = async (app) => {
    if (!window.confirm(`Withdraw application to ${app.driveId?.company}?`)) return
    setWithdrawing(app._id)
    try {
      await withdrawApplicationApi(app._id)
      showSuccess('Application withdrawn')
      fetchApplications(statusFilter)
    } catch (err) {
      showError(err.response?.data?.message || 'Withdraw failed')
    } finally {
      setWithdrawing(null)
    }
  }

  const toggleExpand = (id) => setExpanded(expanded === id ? null : id)

  const driveTypeColor = {
    tech:      'blue',
    'non-tech': 'purple',
    both:      'orange',
  }

  return (
    <div className="page-wrapper">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">My Applications</h1>
          <p className="text-sm text-gray-500 mt-0.5">{applications.length} application(s)</p>
        </div>
        <Select
          placeholder="All Statuses"
          options={statusOptions}
          value={statusFilter}
          className="w-44"
          onChange={(e) => {
            setStatusFilter(e.target.value)
            fetchApplications(e.target.value)
          }}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-7 w-7 rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Browse available drives and apply to get started"
          action={
            <Button onClick={() => navigate('/student/drives')}>Browse Drives</Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const drive     = app.driveId
            const isExpanded = expanded === app._id
            const canWithdraw = ['applied', 'shortlisted'].includes(app.status)

            return (
              <div
                key={app._id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                {/* Card header row */}
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 text-sm font-bold shrink-0">
                      {drive?.company?.[0]?.toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-800 truncate">
                            {drive?.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {drive?.company} · {drive?.jobRole || 'Role TBD'}
                          </p>
                        </div>
                        <ApplicationStatusBadge status={app.status} />
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        {drive?.type && (
                          <Badge variant={driveTypeColor[drive.type] || 'default'}>
                            {drive.type}
                          </Badge>
                        )}
                        {drive?.salaryLPA && (
                          <span className="text-green-600 font-medium">
                            ₹{drive.salaryLPA} LPA
                          </span>
                        )}
                        <span>Applied {formatDate(app.appliedAt)}</span>
                        {drive?.driveDate && (
                          <span>Drive: {formatDate(drive.driveDate)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => toggleExpand(app._id)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {isExpanded ? 'Hide timeline' : 'View timeline'}
                    </button>
                    <button
                      onClick={() => navigate(`/student/drives/${drive?._id}`)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      View drive
                    </button>
                    {canWithdraw && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 text-xs"
                        loading={withdrawing === app._id}
                        onClick={() => handleWithdraw(app)}
                      >
                        Withdraw
                      </Button>
                    )}
                  </div>
                </div>

                {/* Expandable timeline */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                    <p className="text-xs font-medium text-gray-500 mb-3">Application Timeline</p>
                    <StatusHistory history={app.statusHistory || []} />
                    {app.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-400">Officer note</p>
                        <p className="text-sm text-gray-600 mt-1">{app.notes}</p>
                      </div>
                    )}
                    
                    {app.driveId && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-500 mb-3">Round Tracker</p>
                        <StudentRoundStatus driveId={app.driveId._id} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default StudentApplicationsPage