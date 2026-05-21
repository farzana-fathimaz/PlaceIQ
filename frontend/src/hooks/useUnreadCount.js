import { useEffect, useRef } from 'react'
import { useNotificationStore } from '../store/notificationStore'
import { useAuthStore }         from '../store/authStore'
import { getUnreadCountApi }    from '../api/notifications.api'

export const useUnreadCount = (pollInterval = 30000) => {
  const { isAuthenticated }  = useAuthStore()
  const { setUnreadCount }   = useNotificationStore()
  const intervalRef          = useRef(null)

  const fetchCount = async () => {
    if (!isAuthenticated) return
    try {
      const res = await getUnreadCountApi()
      setUnreadCount(res.data.data.count)
    } catch {}
  }

  useEffect(() => {
    if (!isAuthenticated) return

    fetchCount()

    intervalRef.current = setInterval(fetchCount, pollInterval)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isAuthenticated])

  return { fetchCount }
}