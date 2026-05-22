import { useState }        from 'react'
import { addBatchApi, removeBatchApi } from '../../api/settings.api'
import { useUiStore }      from '../../store/uiStore'
import Input               from '../../components/ui/Input'
import Button              from '../../components/ui/Button'
import { BRANCHES }        from '../../utils/constants'

const AcademicTab = ({ form, setForm, settings, onSettingsUpdate }) => {
  const [newBatch,   setNewBatch]   = useState('')
  const [addingBatch, setAddingBatch] = useState(false)
  const { showSuccess, showError }  = useUiStore()

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleBranchToggle = (branch) => {
    const current = form.branches || []
    const updated = current.includes(branch)
      ? current.filter((b) => b !== branch)
      : [...current, branch]
    set('branches', updated)
  }

  const handleAddBatch = async () => {
    if (!newBatch.trim()) return showError('Batch cannot be empty')
    if (!settings?._id) return showError('Save settings first before adding batches')

    setAddingBatch(true)
    try {
      const res = await addBatchApi(newBatch.trim())
      onSettingsUpdate(res.data.data.settings)
      setNewBatch('')
      showSuccess(`Batch ${newBatch.trim()} added`)
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to add batch')
    } finally {
      setAddingBatch(false)
    }
  }

  const handleRemoveBatch = async (batch) => {
    if (!window.confirm(`Remove batch "${batch}"?`)) return
    try {
      const res = await removeBatchApi(batch)
      onSettingsUpdate(res.data.data.settings)
      showSuccess(`Batch ${batch} removed`)
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to remove batch')
    }
  }

  const currentBatches = settings?.batches || []

  return (
    <div className="space-y-6">
      {/* Active Branches */}
      <div>
        <label className="label mb-2 block">Active Branches</label>
        <p className="text-xs text-gray-400 mb-3">
          Only selected branches will be available when creating drives and importing students.
        </p>
        <div className="flex flex-wrap gap-2">
          {BRANCHES.map((branch) => {
            const isSelected = (form.branches || BRANCHES).includes(branch)
            return (
              <button
                key={branch}
                type="button"
                onClick={() => handleBranchToggle(branch)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  isSelected
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
          {(form.branches || BRANCHES).length} branch(es) selected
        </p>
      </div>

      {/* Batches */}
      <div>
        <label className="label mb-2 block">Academic Batches</label>
        <p className="text-xs text-gray-400 mb-3">
          Batches are used for eligibility filtering and student imports.
        </p>

        {/* Existing batches */}
        {currentBatches.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-4">
            {currentBatches.map((batch) => (
              <div
                key={batch}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-700 group"
              >
                <span>{batch}</span>
                <button
                  onClick={() => handleRemoveBatch(batch)}
                  className="text-gray-400 hover:text-red-500 transition-colors ml-1"
                  title="Remove batch"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200 mb-4">
            <p className="text-xs text-gray-400">
              {settings?._id
                ? 'No batches added yet. Add your first batch below.'
                : 'Save settings first, then add batches here.'}
            </p>
          </div>
        )}

        {/* Add batch */}
        <div className="flex gap-2">
          <Input
            placeholder="e.g. 2021-2025"
            value={newBatch}
            onChange={(e) => setNewBatch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddBatch()}
            className="max-w-xs"
          />
          <Button
            size="sm"
            onClick={handleAddBatch}
            loading={addingBatch}
            disabled={!newBatch.trim() || !settings?._id}
          >
            Add Batch
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Format: start_year-end_year (e.g. 2021-2025)
        </p>
      </div>
    </div>
  )
}

export default AcademicTab