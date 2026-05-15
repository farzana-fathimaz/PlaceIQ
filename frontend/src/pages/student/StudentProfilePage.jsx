import { useState, useEffect, useRef } from 'react'
import { getMyProfileApi, updateMyProfileApi, uploadResumeApi } from '../../api/students.api'
import { useUiStore } from '../../store/uiStore'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Card, { CardHeader } from '../../components/ui/Card'
import { PageSpinner } from '../../components/ui/Spinner'

const StudentProfilePage = () => {
  const { showSuccess, showError } = useUiStore()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({})
  const [skillsRaw, setSkillsRaw] = useState('')
  const resumeRef = useRef()

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyProfileApi()
        setProfile(res.data.data.student)
        setForm(res.data.data.student)
        setSkillsRaw(res.data.data.student.skills?.join(', ') || '')
      } catch {
        showError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    fetch()

    // Poll for updates every 5 seconds
    const interval = setInterval(async () => {
      try {
        const res = await getMyProfileApi()
        setProfile(res.data.data.student)
        setForm(res.data.data.student)
        setSkillsRaw(res.data.data.student.skills?.join(', ') || '')
      } catch {
        // Silent fail on polling
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const {
        rollNumber, placementStatus, placedAt,
        placedCTC, userId, _id, __v, createdAt, updatedAt,
        ...editable
      } = form
      const res = await updateMyProfileApi(editable)
      setProfile(res.data.data.student)
      showSuccess('Profile updated successfully')
    } catch (err) {
      showError(err.response?.data?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.type !== 'application/pdf') return showError('Only PDF files allowed')
    const formData = new FormData()
    formData.append('resume', file)
    setUploading(true)
    try {
      const res = await uploadResumeApi(formData)
      setProfile((p) => ({ ...p, resumeUrl: res.data.data.resumeUrl }))
      showSuccess('Resume uploaded successfully')
    } catch {
      showError('Resume upload failed')
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <PageSpinner />

  return (
    <div className="page-wrapper max-w-3xl">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">My Profile</h1>
          <p className="text-sm text-gray-500 mt-0.5">{profile?.userId?.email}</p>
        </div>
        <Button onClick={handleSave} loading={saving}>Save Changes</Button>
      </div>

      <div className="space-y-4">

        <Card>
          <CardHeader title="Academic Details" subtitle="CGPA, backlogs, and percentages" />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="CGPA"
              name="cgpa"
              type="number"
              step="0.01"
              value={form.cgpa || ''}
              onChange={(e) => setForm({ ...form, cgpa: parseFloat(e.target.value) })}
            />
            <Input
              label="Active Backlogs"
              name="activeBacklogs"
              type="number"
              value={form.activeBacklogs ?? ''}
              onChange={(e) => setForm({ ...form, activeBacklogs: parseInt(e.target.value) })}
            />
            <Input
              label="10th %"
              name="tenthPercent"
              type="number"
              value={form.tenthPercent || ''}
              onChange={(e) => setForm({ ...form, tenthPercent: parseFloat(e.target.value) })}
            />
            <Input
              label="12th %"
              name="twelfthPercent"
              type="number"
              value={form.twelfthPercent || ''}
              onChange={(e) => setForm({ ...form, twelfthPercent: parseFloat(e.target.value) })}
            />
            <Input
              label="Batch"
              name="batch"
              value={form.batch || ''}
              onChange={(e) => setForm({ ...form, batch: e.target.value })}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-3">
            <div>
              <p className="text-xs text-gray-400">Roll Number</p>
              <p className="text-sm font-semibold text-gray-700">{profile?.rollNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Branch</p>
              <p className="text-sm font-semibold text-gray-700">{profile?.branch}</p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Personal Details" />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone"
              name="phone"
              value={form.phone || ''}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Select
              label="Gender"
              name="gender"
              value={form.gender || ''}
              options={[
                { label: 'Male', value: 'Male' },
                { label: 'Female', value: 'Female' },
                { label: 'Other', value: 'Other' },
              ]}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            />
          </div>
        </Card>

        <Card>
          <CardHeader title="Skills" />
          <Input
            label="Skills (comma separated)"
            name="skills"
            placeholder="React, Node.js, Python..."
            value={skillsRaw}
            onChange={(e) => {
              setSkillsRaw(e.target.value)
            }}
            onBlur={() => {
              setForm({
                ...form,
                skills: skillsRaw.split(',').map((s) => s.trim()).filter(Boolean),
              })
            }}
          />
        </Card>

        <Card>
          <CardHeader
            title="Resume"
            subtitle={profile?.resumeUrl ? 'Resume uploaded' : 'No resume uploaded yet'}
            action={
              profile?.resumeUrl && (
                <a
                  href={`http://localhost:5000${profile.resumeUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  View Resume
                </a>
              )
            }
          />
          <input
            ref={resumeRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleResumeUpload}
          />
          <Button
            variant="secondary"
            onClick={() => resumeRef.current?.click()}
            loading={uploading}
          >
            {profile?.resumeUrl ? 'Replace Resume (PDF)' : 'Upload Resume (PDF)'}
          </Button>
        </Card>

      </div>
    </div>
  )
}

export default StudentProfilePage