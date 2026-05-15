import { useState } from 'react'
import Modal    from '../../components/ui/Modal'
import Button   from '../../components/ui/Button'
import DriveForm from './DriveForm'
import { createDriveApi } from '../../api/drives.api'
import { useUiStore } from '../../store/uiStore'
import { BRANCHES }   from '../../utils/constants'

const defaultForm = {
  title:        '',
  company:      '',
  type:         'tech',
  jobRole:      '',
  jobLocation:  '',
  salaryLPA:    '',
  description:  '',
  driveDate:    '',
  lastApplyDate: '',
  eligibility: {
    minCGPA:         0,
    maxBacklogs:     0,
    allowedBranches: [...BRANCHES],
    allowedBatches:  [],
    genderAllowed:   'All',
    tenthMin:        0,
    twelfthMin:      0,
    allowPlaced:     false,
  },
}

const CreateDriveModal = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm]       = useState(defaultForm)
  const [loading, setLoading] = useState(false)
  const { showSuccess, showError } = useUiStore()

  const handleSubmit = async () => {
    if (!form.title || !form.company || !form.type) {
      return showError('Title, company, and type are required')
    }
    setLoading(true)
    try {
      await createDriveApi(form)
      showSuccess('Drive created successfully')
      setForm(defaultForm)
      onSuccess()
      onClose()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create drive')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Placement Drive" size="xl">
      <DriveForm form={form} setForm={setForm} />
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} loading={loading}>Create Drive</Button>
      </div>
    </Modal>
  )
}

export default CreateDriveModal