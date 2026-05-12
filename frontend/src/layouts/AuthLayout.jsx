import { Outlet } from 'react-router-dom'

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700">PlaceIQ</h1>
          <p className="text-gray-500 text-sm mt-1">Placement ERP System</p>
        </div>
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout