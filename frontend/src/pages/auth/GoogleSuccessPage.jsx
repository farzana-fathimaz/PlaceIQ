import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { getMeApi } from '../../api/auth.api'
import { useUiStore } from '../../store/uiStore'
import { PageSpinner } from '../../components/ui/Spinner'

const GoogleSuccessPage = () => {
  const [params] = useSearchParams()
  const { login } = useAuthStore()
  const { showSuccess, showError } = useUiStore()
  const navigate = useNavigate()

  useEffect(() => {
    const token = params.get('token')
    const role = params.get('role')

    if (!token) {
      showError('Google login failed.')
      navigate('/login')
      return
    }

    const finalize = async () => {
      try {
        const res = await getMeApi()
        const user = res.data.data.user
        login(user, token)
        showSuccess(`Welcome, ${user.name}!`)
        navigate(role === 'officer' ? '/officer/dashboard' : '/student/dashboard', {
          replace: true,
        })
      } catch (_) {
        showError('Could not complete Google login.')
        navigate('/login')
      }
    }

    finalize()
  }, [])

  return <PageSpinner />
}

export default GoogleSuccessPage