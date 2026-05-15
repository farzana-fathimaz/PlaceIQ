import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getStudentByIdApi, updateStudentApi } from '../../api/students.api'
import { useUiStore } from '../../store/uiStore'
import { formatDate, capitalize } from '../../utils/helpers'
import Button from '../../components/ui/Button'
import Card, { CardHeader } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { PageSpinner } from '../../components/ui/Spinner'

const StudentDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showSuccess, showError } = useUiStore()
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const fetchStudent = async () => {
    try {
      const res = await getStudentByIdApi(id)
      setStudent(res.data.data.student)
      setForm(res.data.data.student)
    } catch {
      showError('Student not found')
      navigate('/officer/students')
    }
  }

  useEffect(() => {
    const fetch = async () => {
      try {
        await fetchStudent()
      } finally {
        setLoading(false)
      }
    }
    fetch()

    // Poll for updates every 5 seconds
    const interval = setInterval(async () => {
      try {
        await fetchStudent()
      } catch {
        // Silent fail on polling
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [id])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await fetchStudent()
      showSuccess('Data refreshed')
    } catch {
      showError('Failed to refresh')
    } finally {
      setRefreshing(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await updateStudentApi(id, form)
      setStudent(res.data.data.student)
      setEditing(false)
      showSuccess('Student updated')
    } catch (err) {
      showError(err.response?.data?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageSpinner />

  const u = student?.userId
  const s = student

  return (
    <div className="page-wrapper max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/officer/students')} className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="section-title">{u?.name}</h1>
          <p className="text-sm text-gray-500">{u?.email}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleRefresh} loading={refreshing}>Refresh</Button>
          {editing ? (
            <>
              <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
              <Button onClick={handleSave} loading={saving}>Save Changes</Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setEditing(true)}>Edit Profile</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-blue-700">{s?.cgpa}</p>
          <p className="text-xs text-blue-500 mt-1">CGPA</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-gray-700">{s?.activeBacklogs}</p>
          <p className="text-xs text-gray-500 mt-1">Active Backlogs</p>
        </div>
        <div className={`rounded-xl p-4 text-center ${s?.placementStatus === 'placed' ? 'bg-green-50' : 'bg-yellow-50'}`}>
          <p className={`text-sm font-bold mt-1 ${s?.placementStatus === 'placed' ? 'text-green-700' : 'text-yellow-700'}`}>
            {s?.placementStatus === 'placed' ? `Placed at ${s?.placedAt}` : 'Not Placed'}
          </p>
          <p className={`text-xs mt-1 ${s?.placementStatus === 'placed' ? 'text-green-500' : 'text-yellow-500'}`}>
            Placement Status
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Academic Info" />
          <div className="space-y-3">
            {editing ? (
              <>
                <Input label="CGPA" name="cgpa" type="number" step="0.01" value={form.cgpa || ''} onChange={(e) => setForm({ ...form, cgpa: e.target.value })} />
                <Input label="Active Backlogs" name="activeBacklogs" type="number" value={form.activeBacklogs || ''} onChange={(e) => setForm({ ...form, activeBacklogs: e.target.value })} />
                <Input label="Total Backlogs" name="totalBacklogs" type="number" value={form.totalBacklogs || ''} onChange={(e) => setForm({ ...form, totalBacklogs: e.target.value })} />
                <Input label="10th %" name="tenthPercent" type="number" value={form.tenthPercent || ''} onChange={(e) => setForm({ ...form, tenthPercent: e.target.value })} />
                <Input label="12th %" name="twelfthPercent" type="number" value={form.twelfthPercent || ''} onChange={(e) => setForm({ ...form, twelfthPercent: e.target.value })} />
              </>
            ) : (
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['Roll Number', s?.rollNumber],
                    ['Branch', s?.branch],
                    ['Batch', s?.batch],
                    ['CGPA', s?.cgpa],
                    ['Active Backlogs', s?.activeBacklogs],
                    ['Total Backlogs', s?.totalBacklogs],
                    ['10th %', s?.tenthPercent || '—'],
                    ['12th %', s?.twelfthPercent || '—'],
                  ].map(([label, val]) => (
                    <tr key={label}>
                      <td className="py-2 text-gray-500 text-xs">{label}</td>
                      <td className="py-2 font-medium text-gray-800 text-right">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Personal Info" />
          <div className="space-y-3">
            {editing ? (
              <>
                <Input label="Phone" name="phone" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <Select
                  label="Placement Status"
                  name="placementStatus"
                  value={form.placementStatus || ''}
                  options={[{ label: 'Not Placed', value: 'not_placed' }, { label: 'Placed', value: 'placed' }]}
                  onChange={(e) => setForm({ ...form, placementStatus: e.target.value })}
                />
                {form.placementStatus === 'placed' && (
                  <>
                    <Input label="Placed At (Company)" name="placedAt" value={form.placedAt || ''} onChange={(e) => setForm({ ...form, placedAt: e.target.value })} />
                    <Input label="CTC (LPA)" name="placedCTC" type="number" value={form.placedCTC || ''} onChange={(e) => setForm({ ...form, placedCTC: e.target.value })} />
                  </>
                )}
              </>
            ) : (
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['Phone', s?.phone || '—'],
                    ['Gender', s?.gender || '—'],
                    ['Placement', capitalize(s?.placementStatus)],
                    ['Placed At', s?.placedAt || '—'],
                    ['CTC', s?.placedCTC ? `${s.placedCTC} LPA` : '—'],
                    ['Resume', s?.resumeUrl ? 'Uploaded' : 'Not uploaded'],
                    ['Joined', formatDate(u?.createdAt)],
                    ['Account', u?.isActive ? 'Active' : 'Inactive'],
                  ].map(([label, val]) => (
                    <tr key={label}>
                      <td className="py-2 text-gray-500 text-xs">{label}</td>
                      <td className="py-2 font-medium text-gray-800 text-right">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default StudentDetailPage