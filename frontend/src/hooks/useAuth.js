import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { getMeApi, refreshApi } from '../api/auth.api'

export const useInitializeAuth = () => {
  const { login, logout, setLoading, setAccessToken } = useAuthStore()

  useEffect(() => {
    const initAuth = async () => {
      try {
        const refreshRes = await refreshApi()
        const newToken = refreshRes.data.data.accessToken
        setAccessToken(newToken)

        const meRes = await getMeApi()
        const fetchedUser = meRes.data.data.user

        login(fetchedUser, newToken)
      } catch (_) {
        logout()
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])
}

export const useAuth = () => {
  return useAuthStore()
}