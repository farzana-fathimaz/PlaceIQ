import Input    from '../../components/ui/Input'
import Select   from '../../components/ui/Select'
import { BRANCHES } from '../../utils/constants'

const genderOptions = [
  { label: 'All Genders', value: 'All'    },
  { label: 'Male Only',   value: 'Male'   },
  { label: 'Female Only', value: 'Female' },
]

const DefaultEligibilityTab = ({ form, setForm }) => {
  const e   = form.defaultEligibility || {}
  const setE = (key, val) =>
    setForm((f) => ({
      ...f,
      defaultEligibility: { ...f.defaultEligibility, [key]: val },
    }))

  const handleBranchToggle = (branch) => {
    const current = e.allowedBranches || []
    const updated = current.includes(branch)
      ? current.filter((b) => b !== branch)
      : [...current, branch]
    setE('allowedBranches', updated)
  }

  return (
    <div className="space-y-5">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-xs text-yellow-700">
          <span className="font-medium">Default Eligibility Template:</span> These values are
          pre-filled when creating a new drive. Officers can override them per drive.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Min CGPA"
          type="number"
          step="0.1"
          min="0"
          max="10"
          value={e.minCGPA ?? ''}
          onChange={(ev) => setE('minCGPA', parseFloat(ev.target.value))}
        />
        <Input
          label="Max Active Backlogs"
          type="number"
          min="0"
          value={e.maxBacklogs ?? ''}
          onChange={(ev) => setE('maxBacklogs', parseInt(ev.target.value))}
        />
        <Select
          label="Gender Allowed"
          options={genderOptions}
          value={e.genderAllowed || 'All'}
          onChange={(ev) => setE('genderAllowed', ev.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Min 10th Percentage"
          type="number"
          min="0"
          max="100"
          value={e.tenthMin ?? ''}
          onChange={(ev) => setE('tenthMin', parseFloat(ev.target.value))}
        />
        <Input
          label="Min 12th Percentage"
          type="number"
          min="0"
          max="100"
          value={e.twelfthMin ?? ''}
          onChange={(ev) => setE('twelfthMin', parseFloat(ev.target.value))}
        />
      </div>

      {/* Allowed branches */}
      <div>
        <label className="label mb-2 block">Default Allowed Branches</label>
        <div className="flex flex-wrap gap-2">
          {BRANCHES.map((branch) => {
            const selected = (e.allowedBranches || []).includes(branch)
            return (
              <button
                key={branch}
                type="button"
                onClick={() => handleBranchToggle(branch)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  selected
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300'
                }`}
              >
                {branch}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {(e.allowedBranches || []).length === 0
            ? 'No branches selected — all will be allowed by default'
            : `${(e.allowedBranches || []).length} branch(es) selected as default`}
        </p>
      </div>

      {/* Allow placed toggle */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <input
          type="checkbox"
          id="allowPlacedDefault"
          checked={e.allowPlaced || false}
          onChange={(ev) => setE('allowPlaced', ev.target.checked)}
          className="w-4 h-4 accent-blue-600"
        />
        <label htmlFor="allowPlacedDefault" className="text-sm text-gray-700 cursor-pointer">
          Allow already placed students to apply by default
        </label>
      </div>

      {/* Preview */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-blue-800 mb-2">Default Template Preview</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
          <span>Min CGPA: <strong>{e.minCGPA ?? '—'}</strong></span>
          <span>Max Backlogs: <strong>{e.maxBacklogs ?? '—'}</strong></span>
          <span>Min 10th: <strong>{e.tenthMin ?? '—'}%</strong></span>
          <span>Min 12th: <strong>{e.twelfthMin ?? '—'}%</strong></span>
          <span>Gender: <strong>{e.genderAllowed || 'All'}</strong></span>
          <span>Allow Placed: <strong>{e.allowPlaced ? 'Yes' : 'No'}</strong></span>
        </div>
        {(e.allowedBranches || []).length > 0 && (
          <p className="text-xs text-blue-600 mt-2">
            Branches: <strong>{(e.allowedBranches || []).join(', ')}</strong>
          </p>
        )}
      </div>
    </div>
  )
}

export default DefaultEligibilityTab