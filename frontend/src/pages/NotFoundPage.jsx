import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'

const NotFoundPage = () => {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300">404</h1>
        <p className="text-xl font-semibold text-gray-700 mt-4">Page not found</p>
        <p className="text-gray-400 text-sm mt-2">The page you are looking for does not exist.</p>
        <Button className="mt-6" onClick={() => navigate(-1)}>Go back</Button>
      </div>
    </div>
  )
}
export default NotFoundPage