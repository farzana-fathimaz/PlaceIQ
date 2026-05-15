import { useState, useEffect } from 'react'
import { useNavigate }    from 'react-router-dom'
import { getDrivesApi }   from '../../api/drives.api'
import { useUiStore }     from '../../store/uiStore'
import { formatDate }     from '../../utils/helpers'
import Card               from '../../components/ui/Card'
import Badge              from '../../components/ui/Badge'
import Input              from '../../components/ui/Input'
import EmptyState         from '../../components/ui/EmptyState'

const StudentDrivesPage = () => {
  const [drives,  setDrives]  = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const { showError } = useUiStore()
  const navigate = useNavigate()

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getDrivesApi({ status: 'active' })
        setDrives(res.data.data.drives)
      } catch {
        showError('Failed to load drives')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const filtered = drives.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.company.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-wrapper">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Available Drives</h1>
          <p className="text-sm text-gray-500 mt-0.5">Drives you are eligible for</p>
        </div>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search by company or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-7 w-7 rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No eligible drives"
          description="You will see active drives you are eligible for here. Make sure your profile is complete."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((drive) => (
            <div
              key={drive._id}
              onClick={() => navigate(`/student/drives/${drive._id}`)}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-card transition-all cursor-pointer hover:border-blue-200"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 text-sm font-bold shrink-0">
                  {drive.company?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">{drive.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{drive.company} · {drive.jobRole || 'Role TBD'}</p>
                    </div>
                    <Badge variant="green">Active</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="uppercase">{drive.type}</span>
                    {drive.salaryLPA && <span className="text-green-600 font-semibold">₹{drive.salaryLPA} LPA</span>}
                    {drive.jobLocation && <span>{drive.jobLocation}</span>}
                    {drive.lastApplyDate && (
                      <span className="text-red-500 font-medium">
                        Apply by {formatDate(drive.lastApplyDate)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span className="text-gray-400">Min CGPA: <strong className="text-gray-700">{drive.eligibility?.minCGPA}</strong></span>
                    <span className="text-gray-400">Max Backlogs: <strong className="text-gray-700">{drive.eligibility?.maxBacklogs}</strong></span>
                    <span className="text-gray-400">Branches: <strong className="text-gray-700">{drive.eligibility?.allowedBranches?.join(', ')}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default StudentDrivesPage