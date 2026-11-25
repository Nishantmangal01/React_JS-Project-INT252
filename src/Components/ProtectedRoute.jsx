// ProtectedRoute.jsx - redirects to /login if not logged in or the role is wrong.
// This is only for a better user experience. The real protection is on the server.
import { Navigate } from 'react-router-dom'
import { getStoredUser } from '../Axios.jsx'

function ProtectedRoute({ allowedRoles, children }) {
  const user = getStoredUser()

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default ProtectedRoute
