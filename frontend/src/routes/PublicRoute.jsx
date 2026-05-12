import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { PageSpinner } from '../components/ui/Spinner'

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuthStore()

  if (isLoading) return <PageSpinner />

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'officer' ? '/officer/dashboard' : '/student/dashboard'} replace />
  }

  return children
}

export default PublicRoute