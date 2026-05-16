import { useState } from 'react'
import Modal   from '../../components/ui/Modal'
import Input   from '../../components/ui/Input'
import Select  from '../../components/ui/Select'
import Button  from '../../components/ui/Button'
import { createRoundApi } from '../../api/rounds.api'
import { useUiStore }     from '../../store/uiStore'
import { ROUND_TYPE_LABELS } from './roundHelpers'

const typeOptions = Object.entries(ROUND_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}))

const modeOptions = [
  { label: 'Offline', value: 'offline' },
  { label: 'Online',  value: 'online'  },
  { label: 'Hybrid',  value: 'hybrid'  },
]

const defaultForm = {
  name:         '',
  type:         'aptitude',
  scheduledAt:  '',
  venue:        '',
  mode:         'offline',
  duration:     '',
  instructions: '',
}

const CreateRoundModal = ({ isOpen, onClose, driveId, onSuccess }) => {
  const [form,    setForm]    = useState(defaultForm)
  const [loading, setLoading] = useState(false)
  const { showSuccess, showError } = useUiStore()

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = async () => {
    if (!form.name || !form.type) return showError('Name and type are required')
    setLoading(true)
    try {
      await createRoundApi({ ...form, driveId })
      showSuccess('Round created successfully')
      setForm(defaultForm)
      onSuccess()
      onClose()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create round')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Recruitment Round" size="md">
      <div className="space-y-4">
        <Input
          label="Round Name"
          required
          placeholder="e.g. Aptitude Test, Technical Interview"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Round Type"
            required
            options={typeOptions}
            value={form.type}
            onChange={(e) => set('type', e.target.value)}
          />
          <Select
            label="Mode"
            options={modeOptions}
            value={form.mode}
            onChange={(e) => set('mode', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Scheduled Date & Time"
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => set('scheduledAt', e.target.value)}
          />
          <Input
            label="Duration"
            placeholder="e.g. 1 hour 30 minutes"
            value={form.duration}
            onChange={(e) => set('duration', e.target.value)}
          />
        </div>

        <Input
          label="Venue"
          placeholder="e.g. Examination Hall A, Google Meet link"
          value={form.venue}
          onChange={(e) => set('venue', e.target.value)}
        />

        <div>
          <label className="label">Instructions for Students</label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="What should students bring or prepare?"
            value={form.instructions}
            onChange={(e) => set('instructions', e.target.value)}
          />
        </div>

        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-blue-600">
            Students currently in <strong>in_rounds</strong> or <strong>shortlisted</strong> status for this drive will be automatically added to this round.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={loading}>Create Round</Button>
        </div>
      </div>
    </Modal>
  )
}

export default CreateRoundModal