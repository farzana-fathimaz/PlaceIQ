import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import { BRANCHES, GENDERS } from '../../utils/constants'
import { createStudentApi } from '../../api/students.api'
import { useUiStore } from '../../store/uiStore'

const schema = z.object({
  name:           z.string().min(2, 'Name required'),
  email:          z.string().email('Valid email required'),
  rollNumber:     z.string().min(1, 'Roll number required'),
  branch:         z.string().min(1, 'Branch required'),
  batch:          z.string().min(1, 'Batch required'),
  cgpa:           z.coerce.number().min(0).max(10),
  activeBacklogs: z.coerce.number().min(0).default(0),
  totalBacklogs:  z.coerce.number().min(0).default(0),
  phone:          z.string().optional(),
  gender:         z.string().optional(),
  tenthPercent:   z.coerce.number().min(0).max(100).optional(),
  twelfthPercent: z.coerce.number().min(0).max(100).optional(),
})

const branchOptions = BRANCHES.map((b) => ({ label: b, value: b }))
const genderOptions = GENDERS.map((g) => ({ label: g, value: g }))

const AddStudentModal = ({ isOpen, onClose, onSuccess }) => {
  const { showSuccess, showError } = useUiStore()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    try {
      await createStudentApi(data)
      showSuccess('Student created successfully')
      reset()
      onSuccess()
      onClose()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create student')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Student"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Full Name" name="name" required error={errors.name?.message} {...register('name')} />
          <Input label="Email" name="email" type="email" required error={errors.email?.message} {...register('email')} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Roll Number" name="rollNumber" required error={errors.rollNumber?.message} {...register('rollNumber')} />
          <Input label="Batch (e.g. 2021-2025)" name="batch" required error={errors.batch?.message} {...register('batch')} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select label="Branch" name="branch" required options={branchOptions} error={errors.branch?.message} {...register('branch')} />
          <Select label="Gender" name="gender" options={genderOptions} error={errors.gender?.message} {...register('gender')} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input label="CGPA" name="cgpa" type="number" step="0.01" required error={errors.cgpa?.message} {...register('cgpa')} />
          <Input label="Active Backlogs" name="activeBacklogs" type="number" error={errors.activeBacklogs?.message} {...register('activeBacklogs')} />
          <Input label="Total Backlogs" name="totalBacklogs" type="number" error={errors.totalBacklogs?.message} {...register('totalBacklogs')} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input label="Phone" name="phone" error={errors.phone?.message} {...register('phone')} />
          <Input label="10th %" name="tenthPercent" type="number" step="0.01" error={errors.tenthPercent?.message} {...register('tenthPercent')} />
          <Input label="12th %" name="twelfthPercent" type="number" step="0.01" error={errors.twelfthPercent?.message} {...register('twelfthPercent')} />
        </div>

        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-blue-600">Default password will be <strong>Student@123</strong>. Student can change it after login.</p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isSubmitting}>Add Student</Button>
        </div>
      </form>
    </Modal>
  )
}

export default AddStudentModal