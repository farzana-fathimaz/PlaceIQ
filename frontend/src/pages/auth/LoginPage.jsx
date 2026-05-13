import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useUiStore } from '../../store/uiStore'
import { loginApi } from '../../api/auth.api'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const LoginPage = () => {
  const { login } = useAuthStore()
  const { showSuccess, showError } = useUiStore()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    console.log('FORM SUBMITTED', data)
    
    try {
      const res = await loginApi(data)
      console.log('LOGIN RESPONSE', res)
      const { user, accessToken } = res.data.data
      login(user, accessToken)
      showSuccess(`Welcome back, ${user.name}!`)
      navigate(user.role === 'officer' ? '/officer/dashboard' : '/student/dashboard', {
        replace: true,
      })
    } catch (err) {
      console.error('LOGIN ERROR', err)
      console.error('ERROR RESPONSE', err.response)
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.'
      console.error('SHOWING ERROR:', errorMessage)
      showError(errorMessage)
    }
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    handleSubmit(onSubmit)(e)
  }

  return (
    <div className="bg-white rounded-xl shadow-card p-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-1">Sign in to PlaceIQ</h2>
      <p className="text-sm text-gray-500 mb-6">Enter your credentials to continue</p>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        <Input
          label="Email address"
          name="email"
          type="email"
          placeholder="you@college.edu"
          required
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          error={errors.password?.message}
          {...register('password')}
        />

        <Button
          type="submit"
          className="w-full"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Sign in
        </Button>
      </form>

      <p className="text-sm text-center text-gray-500 mt-6">
        First time setup?{' '}
        <Link to="/register" className="text-blue-600 hover:underline font-medium">
          Register as Officer
        </Link>
      </p>
    </div>
  )
}

export default LoginPage