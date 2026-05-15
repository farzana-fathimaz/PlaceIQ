import { useState, useEffect } from 'react'
import Modal     from '../../components/ui/Modal'
import Button    from '../../components/ui/Button'
import DriveForm from './DriveForm'
import { updateDriveApi } from '../../api/drives.api'
import { useUiStore }     from '../../store/uiStore'

const EditDriveModal = ({ isOpen, onClose, drive, onSuccess }) => {
  const [form, setForm]       = useState({})
  const [loading, setLoading] = useState(false)
  const { showSuccess, showError } = useUiStore()

  useEffect(() => {
    if (drive) setForm({ ...drive })
  }, [drive])

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await updateDriveApi(drive._id, form)
      showSuccess('Drive updated successfully')
      onSuccess()
      onClose()
    } catch (err) {
      showError(err.response?.data?.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Drive" size="xl">
      <DriveForm form={form} setForm={setForm} />
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} loading={loading}>Save Changes</Button>
      </div>
    </Modal>
  )
}

export default EditDriveModal