import { useState, useEffect } from 'react'
import Modal   from '../../components/ui/Modal'
import Input   from '../../components/ui/Input'
import Select  from '../../components/ui/Select'
import Button  from '../../components/ui/Button'
import { updateRoundApi } from '../../api/rounds.api'
import { useUiStore }     from '../../store/uiStore'
import { ROUND_TYPE_LABELS } from './roundHelpers'

const typeOptions = Object.entries(ROUND_TYPE_LABELS).map(([value, label]) => ({ value, label }))
const modeOptions = [
  { label: 'Offline', value: 'offline' },
  { label: 'Online',  value: 'online'  },
  { label: 'Hybrid',  value: 'hybrid'  },
]

const EditRoundModal = ({ isOpen, onClose, round, onSuccess }) => {
  const [form,    setForm]    = useState({})
  const [loading, setLoading] = useState(false)
  const { showSuccess, showError } = useUiStore()

  useEffect(() => {
    if (round) {
      setForm({
        name:         round.name         || '',
        type:         round.type         || 'aptitude',
        scheduledAt:  round.scheduledAt  ? round.scheduledAt.slice(0, 16) : '',
        venue:        round.venue        || '',
        mode:         round.mode         || 'offline',
        duration:     round.duration     || '',
        instructions: round.instructions || '',
      })
    }
  }, [round])

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await updateRoundApi(round._id, form)
      showSuccess('Round updated')
      onSuccess()
      onClose()
    } catch (err) {
      showError(err.response?.data?.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Round" size="md">
      <div className="space-y-4">
        <Input label="Round Name" required value={form.name || ''} onChange={(e) => set('name', e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Round Type" required options={typeOptions} value={form.type || ''} onChange={(e) => set('type', e.target.value)} />
          <Select label="Mode" options={modeOptions} value={form.mode || ''} onChange={(e) => set('mode', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Scheduled Date & Time" type="datetime-local" value={form.scheduledAt || ''} onChange={(e) => set('scheduledAt', e.target.value)} />
          <Input label="Duration" placeholder="e.g. 1 hour" value={form.duration || ''} onChange={(e) => set('duration', e.target.value)} />
        </div>
        <Input label="Venue" value={form.venue || ''} onChange={(e) => set('venue', e.target.value)} />
        <div>
          <label className="label">Instructions</label>
          <textarea rows={3} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" value={form.instructions || ''} onChange={(e) => set('instructions', e.target.value)} />
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={loading}>Save Changes</Button>
        </div>
      </div>
    </Modal>
  )
}

export default EditRoundModal