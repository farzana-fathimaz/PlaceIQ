import { useState, useEffect } from 'react'
import Input    from '../../components/ui/Input'
import Select   from '../../components/ui/Select'
import { BRANCHES, DRIVE_TYPES } from '../../utils/constants'

const branchOptions  = BRANCHES.map((b) => ({ label: b, value: b }))
const typeOptions    = DRIVE_TYPES.map((t) => ({ label: t.charAt(0).toUpperCase() + t.slice(1), value: t }))
const genderOptions  = [
  { label: 'All',    value: 'All'    },
  { label: 'Male',   value: 'Male'   },
  { label: 'Female', value: 'Female' },
]

const DriveForm = ({ form, setForm }) => {
  const [allowedBatchesRaw, setAllowedBatchesRaw] = useState('')
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))
  const setE = (key, val) =>
    setForm((f) => ({ ...f, eligibility: { ...f.eligibility, [key]: val } }))

  useEffect(() => {
    setAllowedBatchesRaw(form.eligibility?.allowedBatches?.join(', ') || '')
  }, [form.eligibility?.allowedBatches])

  const handleBranchToggle = (branch) => {
    const current = form.eligibility?.allowedBranches || []
    const updated = current.includes(branch)
      ? current.filter((b) => b !== branch)
      : [...current, branch]
    setE('allowedBranches', updated)
  }

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Basic Information</p>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Drive Title"
            required
            value={form.title || ''}
            onChange={(e) => set('title', e.target.value)}
          />
          <Input
            label="Company Name"
            required
            value={form.company || ''}
            onChange={(e) => set('company', e.target.value)}
          />
          <Select
            label="Drive Type"
            required
            options={typeOptions}
            value={form.type || ''}
            onChange={(e) => set('type', e.target.value)}
          />
          <Input
            label="Job Role"
            value={form.jobRole || ''}
            onChange={(e) => set('jobRole', e.target.value)}
          />
          <Input
            label="Job Location"
            value={form.jobLocation || ''}
            onChange={(e) => set('jobLocation', e.target.value)}
          />
          <Input
            label="Salary (LPA)"
            placeholder="4-5 LPA, CTC, etc."
            value={form.salaryLPA || ''}
            onChange={(e) => set('salaryLPA', e.target.value)}
          />
          <Input
            label="Drive Date"
            type="datetime-local"
            value={form.driveDate ? form.driveDate.slice(0, 16) : ''}
            onChange={(e) => set('driveDate', e.target.value)}
          />
          <Input
            label="Last Apply Date"
            type="datetime-local"
            value={form.lastApplyDate ? form.lastApplyDate.slice(0, 16) : ''}
            onChange={(e) => set('lastApplyDate', e.target.value)}
          />
        </div>
        <div className="mt-4">
          <label className="label">Description</label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            value={form.description || ''}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Describe the drive, company, job details..."
          />
        </div>
      </div>

      {/* Eligibility */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Eligibility Criteria</p>
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Min CGPA"
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={form.eligibility?.minCGPA ?? ''}
            onChange={(e) => setE('minCGPA', parseFloat(e.target.value))}
          />
          <Input
            label="Max Active Backlogs"
            type="number"
            min="0"
            value={form.eligibility?.maxBacklogs ?? ''}
            onChange={(e) => setE('maxBacklogs', parseInt(e.target.value))}
          />
          <Select
            label="Gender Allowed"
            options={genderOptions}
            value={form.eligibility?.genderAllowed || 'All'}
            onChange={(e) => setE('genderAllowed', e.target.value)}
          />
          <Input
            label="Min 10th %"
            type="number"
            min="0"
            max="100"
            value={form.eligibility?.tenthMin ?? ''}
            onChange={(e) => setE('tenthMin', parseFloat(e.target.value))}
          />
          <Input
            label="Min 12th %"
            type="number"
            min="0"
            max="100"
            value={form.eligibility?.twelfthMin ?? ''}
            onChange={(e) => setE('twelfthMin', parseFloat(e.target.value))}
          />
          <Input
            label="Allowed Batches (comma separated)"
            placeholder="2021-2025, 2022-2026"
            value={allowedBatchesRaw}
            onChange={(e) => setAllowedBatchesRaw(e.target.value)}
            onBlur={() =>
              setE(
                'allowedBatches',
                allowedBatchesRaw.split(',').map((s) => s.trim()).filter(Boolean)
              )
            }
          />
        </div>

        <div className="mt-4">
          <label className="label">Allowed Branches</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {BRANCHES.map((b) => {
              const selected = (form.eligibility?.allowedBranches || []).includes(b)
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => handleBranchToggle(b)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    selected
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {b}
                </button>
              )
            })}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {(form.eligibility?.allowedBranches || []).length === 0
              ? 'No branches selected — all will be allowed'
              : `${(form.eligibility?.allowedBranches || []).length} branch(es) selected`}
          </p>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <input
            type="checkbox"
            id="allowPlaced"
            checked={form.eligibility?.allowPlaced || false}
            onChange={(e) => setE('allowPlaced', e.target.checked)}
            className="w-4 h-4 accent-blue-600"
          />
          <label htmlFor="allowPlaced" className="text-sm text-gray-700">
            Allow already placed students to apply
          </label>
        </div>
      </div>
    </div>
  )
}

export default DriveForm