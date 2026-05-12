import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { getMeApi } from '../api/auth.api'

export const useAuth = () => {
  const { login, logout, setLoading, isAuthenticated, user, isLoading } = useAuthStore()

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true)
      try {
        const res = await getMeApi()
        login(res.data.data.user, res.data.data.accessToken)
      } catch (_) {
        logout()
      } finally {
        setLoading(false)
      }
    }

    if (!isAuthenticated) {
      initAuth()
    } else {
      setLoading(false)
    }
  }, [])

  return { user, isAuthenticated, isLoading }
}