import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useUiStore } from '../../store/uiStore'
import { registerApi } from '../../api/auth.api'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

const RegisterPage = () => {
  const { login } = useAuthStore()
  const { showSuccess, showError } = useUiStore()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    try {
      const res = await registerApi({
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'officer',
      })
      const { user, accessToken } = res.data.data
      login(user, accessToken)
      showSuccess(`Welcome, ${user.name}! Officer account created.`)
      navigate('/officer/dashboard', { replace: true })
    } catch (err) {
      showError(err.response?.data?.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-card p-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-1">Create Officer Account</h2>
      <p className="text-sm text-gray-500 mb-6">
        One-time setup for placement officer access
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full name"
          name="name"
          type="text"
          placeholder="Dr. Placement Officer"
          required
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Email address"
          name="email"
          type="email"
          placeholder="officer@college.edu"
          required
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Min 8 characters"
          required
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirm password"
          name="confirmPassword"
          type="password"
          placeholder="Repeat password"
          required
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-700">
            Only one officer account can be created per system. This cannot be undone.
          </p>
        </div>

        <Button
          type="submit"
          className="w-full"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Create Officer Account
        </Button>
      </form>

      <p className="text-sm text-center text-gray-500 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  )
}

export default RegisterPage