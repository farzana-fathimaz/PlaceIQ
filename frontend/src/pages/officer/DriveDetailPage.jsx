import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDriveByIdApi, getEligibleStudentsApi, updateDriveStatusApi } from '../../api/drives.api'
import { useUiStore }       from '../../store/uiStore'
import { formatDate, capitalize } from '../../utils/helpers'
import { BRANCHES }         from '../../utils/constants'
import Button               from '../../components/ui/Button'
import Card, { CardHeader } from '../../components/ui/Card'
import Badge                from '../../components/ui/Badge'
import DriveStatusBadge     from '../../features/drives/DriveStatusBadge'
import EditDriveModal       from '../../features/drives/EditDriveModal'
import { PageSpinner }      from '../../components/ui/Spinner'

const nextStatus = { draft: 'upcoming', upcoming: 'active', active: 'closed' }

const DriveDetailPage = () => {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { showSuccess, showError } = useUiStore()

  const [drive,     setDrive]     = useState(null)
  const [eligible,  setEligible]  = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [showEdit,  setShowEdit]  = useState(false)
  const [advancing, setAdvancing] = useState(false)

  const fetchDrive = async () => {
    try {
      const res = await getDriveByIdApi(id)
      setDrive(res.data.data.drive)
    } catch {
      showError('Drive not found')
      navigate('/officer/drives')
    } finally {
      setLoading(false)
    }
  }

  const fetchEligible = async () => {
    try {
      const res = await getEligibleStudentsApi(id)
      setEligible(res.data.data)
    } catch {}
  }

  useEffect(() => {
    fetchDrive()
    fetchEligible()
  }, [id])

  const handleAdvance = async () => {
    const next = nextStatus[drive.status]
    if (!next) return
    setAdvancing(true)
    try {
      await updateDriveStatusApi(id, next)
      showSuccess(`Drive moved to ${next}`)
      fetchDrive()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update status')
    } finally {
      setAdvancing(false)
    }
  }

  if (loading) return <PageSpinner />

  const e = drive?.eligibility

  return (
    <div className="page-wrapper max-w-5xl">
      {/* Back + Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/officer/drives')} className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="section-title">{drive?.title}</h1>
            <DriveStatusBadge status={drive?.status} />
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{drive?.company}</p>
        </div>
        <div className="flex gap-2">
          {drive?.status !== 'archived' && drive?.status !== 'closed' && (
            <Button variant="secondary" onClick={() => setShowEdit(true)}>Edit</Button>
          )}
          {nextStatus[drive?.status] && (
            <Button onClick={handleAdvance} loading={advancing}>
              Move to {nextStatus[drive?.status]}
            </Button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Salary',      value: drive?.salaryLPA ? `₹${drive.salaryLPA} LPA` : '—' },
          { label: 'Applicants',  value: drive?.totalApplicants ?? 0 },
          { label: 'Placed',      value: drive?.totalPlaced ?? 0 },
          { label: 'Eligible',    value: eligible?.count ?? '—' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Drive Info */}
        <Card>
          <CardHeader title="Drive Details" />
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100">
              {[
                ['Type',        capitalize(drive?.type)],
                ['Job Role',    drive?.jobRole    || '—'],
                ['Location',    drive?.jobLocation || '—'],
                ['Drive Date',  formatDate(drive?.driveDate)],
                ['Apply By',    formatDate(drive?.lastApplyDate)],
                ['Created By',  drive?.createdBy?.name || '—'],
              ].map(([label, val]) => (
                <tr key={label}>
                  <td className="py-2 text-xs text-gray-500">{label}</td>
                  <td className="py-2 text-sm font-medium text-gray-800 text-right">{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {drive?.description && (
            <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100 leading-relaxed">
              {drive.description}
            </p>
          )}
        </Card>

        {/* Eligibility */}
        <Card>
          <CardHeader title="Eligibility Criteria" />
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100">
              {[
                ['Min CGPA',        e?.minCGPA ?? 0],
                ['Max Backlogs',    e?.maxBacklogs ?? 0],
                ['Gender',          e?.genderAllowed || 'All'],
                ['Min 10th %',      e?.tenthMin || '—'],
                ['Min 12th %',      e?.twelfthMin || '—'],
                ['Allow Placed',    e?.allowPlaced ? 'Yes' : 'No'],
                ['Batches',         e?.allowedBatches?.join(', ') || 'All'],
              ].map(([label, val]) => (
                <tr key={label}>
                  <td className="py-2 text-xs text-gray-500">{label}</td>
                  <td className="py-2 text-sm font-medium text-gray-800 text-right">{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Allowed Branches</p>
            <div className="flex flex-wrap gap-1">
              {(e?.allowedBranches || []).map((b) => (
                <Badge key={b} variant="blue">{b}</Badge>
              ))}
              {(!e?.allowedBranches || e.allowedBranches.length === 0) && (
                <span className="text-xs text-gray-400">All branches</span>
              )}
            </div>
          </div>
        </Card>

        {/* Eligible Students Preview */}
        {eligible && (
          <Card className="md:col-span-2">
            <CardHeader
              title={`Eligible Students (${eligible.count})`}
              subtitle="Based on current eligibility criteria"
            />
            {eligible.students?.length === 0 ? (
              <p className="text-sm text-gray-400">No eligible students found with current criteria.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-xs text-gray-400 font-medium">Name</th>
                      <th className="text-left py-2 text-xs text-gray-400 font-medium">Roll No</th>
                      <th className="text-left py-2 text-xs text-gray-400 font-medium">Branch</th>
                      <th className="text-left py-2 text-xs text-gray-400 font-medium">CGPA</th>
                      <th className="text-left py-2 text-xs text-gray-400 font-medium">Backlogs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {eligible.students.slice(0, 10).map((s) => (
                      <tr key={s._id} className="hover:bg-gray-50">
                        <td className="py-2">
                          <p className="font-medium text-gray-800">{s.userId?.name}</p>
                          <p className="text-xs text-gray-400">{s.userId?.email}</p>
                        </td>
                        <td className="py-2 text-xs font-mono text-gray-600">{s.rollNumber}</td>
                        <td className="py-2"><Badge variant="blue">{s.branch}</Badge></td>
                        <td className="py-2 font-semibold text-green-600">{s.cgpa}</td>
                        <td className="py-2 text-gray-500">{s.activeBacklogs}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {eligible.count > 10 && (
                  <p className="text-xs text-gray-400 mt-2">
                    Showing 10 of {eligible.count} eligible students
                  </p>
                )}
              </div>
            )}
          </Card>
        )}
      </div>

      <EditDriveModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        drive={drive}
        onSuccess={fetchDrive}
      />
    </div>
  )
}

export default DriveDetailPage