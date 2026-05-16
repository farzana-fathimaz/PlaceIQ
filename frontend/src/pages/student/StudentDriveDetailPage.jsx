import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDriveByIdApi }       from '../../api/drives.api'
import { applyToDriveApi, checkIfAppliedApi, withdrawApplicationApi } from '../../api/applications.api'
import { useUiStore }            from '../../store/uiStore'
import { formatDate, capitalize } from '../../utils/helpers'
import Button                    from '../../components/ui/Button'
import Card, { CardHeader }      from '../../components/ui/Card'
import Badge                     from '../../components/ui/Badge'
import ApplicationStatusBadge    from '../../features/applications/ApplicationStatusBadge'
import StatusHistory             from '../../features/applications/StatusHistory'
import { PageSpinner }           from '../../components/ui/Spinner'
import StudentRoundStatus        from '../../features/rounds/StudentRoundStatus'

const StudentDriveDetailPage = () => {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { showSuccess, showError } = useUiStore()

  const [drive,       setDrive]       = useState(null)
  const [application, setApplication] = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [applying,    setApplying]    = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)

  const fetchData = async () => {
    try {
      const [driveRes, checkRes] = await Promise.all([
        getDriveByIdApi(id),
        checkIfAppliedApi(id),
      ])
      setDrive(driveRes.data.data.drive)
      setApplication(checkRes.data.data.application)
    } catch {
      showError('Drive not found')
      navigate('/student/drives')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [id])

  const handleApply = async () => {
    setApplying(true)
    try {
      const res = await applyToDriveApi(id)
      setApplication(res.data.data.application)
      showSuccess('Application submitted successfully!')
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to apply')
    } finally {
      setApplying(false)
    }
  }

  const handleWithdraw = async () => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return
    setWithdrawing(true)
    try {
      await withdrawApplicationApi(application._id)
      showSuccess('Application withdrawn')
      fetchData()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to withdraw')
    } finally {
      setWithdrawing(false)
    }
  }

  if (loading) return <PageSpinner />

  const e           = drive?.eligibility
  const isApplied   = !!application
  const canWithdraw = ['applied', 'shortlisted'].includes(application?.status)
  const isPastDeadline = drive?.lastApplyDate && new Date() > new Date(drive.lastApplyDate)

  return (
    <div className="page-wrapper max-w-3xl">
      <button
        onClick={() => navigate('/student/drives')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-5"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Drives
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 text-xl font-bold shrink-0">
            {drive?.company?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{drive?.title}</h1>
            <p className="text-gray-500 mt-0.5">{drive?.company}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="green">Active</Badge>
              <Badge variant="blue">{capitalize(drive?.type)}</Badge>
            </div>
          </div>
        </div>

        {/* Apply / Status button */}
        <div className="shrink-0">
          {isApplied ? (
            <div className="text-right space-y-2">
              <ApplicationStatusBadge status={application.status} />
              {canWithdraw && (
                <div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500"
                    loading={withdrawing}
                    onClick={handleWithdraw}
                  >
                    Withdraw
                  </Button>
                </div>
              )}
            </div>
          ) : isPastDeadline ? (
            <Button disabled variant="secondary">Deadline Passed</Button>
          ) : (
            <Button onClick={handleApply} loading={applying}>Apply Now</Button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Salary',   value: drive?.salaryLPA ? `₹${drive.salaryLPA} LPA` : '—' },
          { label: 'Location', value: drive?.jobLocation || '—' },
          { label: 'Apply By', value: formatDate(drive?.lastApplyDate) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-sm font-semibold text-blue-800">{value}</p>
            <p className="text-xs text-blue-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {/* Application status history */}
        {isApplied && (
          <Card>
            <CardHeader title="Your Application Status" />
            <StatusHistory history={application.statusHistory || []} />
            {application.notes && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">Officer note</p>
                <p className="text-sm text-gray-600 mt-1">{application.notes}</p>
              </div>
            )}
          </Card>
        )}

        {isApplied && application?.status === 'in_rounds' && (
          <Card>
            <CardHeader title="Round Tracker" subtitle="Your progress through interview rounds" />
            <StudentRoundStatus driveId={id} />
          </Card>
        )}

        {/* Description */}
        {drive?.description && (
          <Card>
            <CardHeader title="About this Drive" />
            <p className="text-sm text-gray-600 leading-relaxed">{drive.description}</p>
          </Card>
        )}

        {/* Eligibility */}
        <Card>
          <CardHeader title="Eligibility Criteria" />
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Min CGPA',     e?.minCGPA ?? 0],
              ['Max Backlogs', e?.maxBacklogs ?? 0],
              ['Gender',       e?.genderAllowed || 'All'],
              ['Min 10th %',   e?.tenthMin    || 'None'],
              ['Min 12th %',   e?.twelfthMin  || 'None'],
              ['Batches',      e?.allowedBatches?.join(', ') || 'All'],
            ].map(([label, val]) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{val}</p>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <p className="text-xs text-gray-400 mb-2">Allowed Branches</p>
            <div className="flex flex-wrap gap-1">
              {(e?.allowedBranches || []).map((b) => (
                <Badge key={b} variant="blue">{b}</Badge>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default StudentDriveDetailPage