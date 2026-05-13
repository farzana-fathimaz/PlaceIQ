import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth, useInitializeAuth } from './hooks/useAuth'
import { PageSpinner } from './components/ui/Spinner'
import Toast from './components/common/Toast'

import AuthLayout from './layouts/AuthLayout'
import OfficerLayout from './layouts/OfficerLayout'
import StudentLayout from './layouts/StudentLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicRoute from './routes/PublicRoute'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import NotFoundPage from './pages/NotFoundPage'
import GoogleSuccessPage from './pages/auth/GoogleSuccessPage'

import DashboardPage from './pages/officer/DashboardPage'
import StudentsPage from './pages/officer/StudentsPage'
import DrivesPage from './pages/officer/DrivesPage'
import NotificationsPage from './pages/officer/NotificationsPage'
import ReportsPage from './pages/officer/ReportsPage'
import SettingsPage from './pages/officer/SettingsPage'

import StudentDashboardPage from './pages/student/StudentDashboardPage'
import StudentProfilePage from './pages/student/StudentProfilePage'
import StudentDrivesPage from './pages/student/StudentDrivesPage'
import StudentApplicationsPage from './pages/student/StudentApplicationsPage'
import StudentNotificationsPage from './pages/student/StudentNotificationsPage'

const AppRoutes = () => {
  useInitializeAuth()

const { isLoading } = useAuth()

  if (isLoading) return <PageSpinner />

  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Auth routes */}
      <Route element={<AuthLayout />}>
  <Route
    path="/login"
    element={
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    }
  />

  <Route
    path="/register"
    element={
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    }
  />

  <Route
    path="/auth/google/success"
    element={<GoogleSuccessPage />}
  />
</Route>

      {/* Officer routes */}
      <Route path="/officer" element={
        <ProtectedRoute role="officer">
          <OfficerLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/officer/dashboard" replace />} />
        <Route path="dashboard"     element={<DashboardPage />} />
        <Route path="students"      element={<StudentsPage />} />
        <Route path="drives"        element={<DrivesPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="reports"       element={<ReportsPage />} />
        <Route path="settings"      element={<SettingsPage />} />
      </Route>

      {/* Student routes */}
      <Route path="/student" element={
        <ProtectedRoute role="student">
          <StudentLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard"     element={<StudentDashboardPage />} />
        <Route path="profile"       element={<StudentProfilePage />} />
        <Route path="drives"        element={<StudentDrivesPage />} />
        <Route path="applications"  element={<StudentApplicationsPage />} />
        <Route path="notifications" element={<StudentNotificationsPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toast />
    </BrowserRouter>
  )
}

export default App