import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { PageSpinner } from '../components/ui/Spinner'

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, isLoading, user } = useAuthStore()

  if (isLoading) return <PageSpinner />

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'officer' ? '/officer/dashboard' : '/student/dashboard'} replace />
  }

  return children
}

export default ProtectedRoute