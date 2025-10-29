import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from './LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { admin, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!admin) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

