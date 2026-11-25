// Navbar.jsx - logo, links based on the logged-in role, and Logout
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { getStoredUser } from '../Axios.jsx'

function Navbar() {
  const navigate = useNavigate()
  useLocation() // makes the navbar refresh whenever the page changes (for example after login)
  const user = getStoredUser()

  // Remove the saved user and go to the home page
  function handleLogout() {
    localStorage.removeItem('ecoUser')
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo">EcoCycle</Link>

        <nav className="nav-links">
          {!user && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}

          {user && user.role === 'citizen' && (
            <>
              <Link to="/requests">My Requests</Link>
              <Link to="/requests/new">New Request</Link>
            </>
          )}

          {user && user.role === 'partner' && <Link to="/partner">Dashboard</Link>}

          {user && user.role === 'admin' && <Link to="/admin">Admin</Link>}

          {user && (
            <>
              <span className="nav-user">{user.username} ({user.role})</span>
              <button className="btn btn-outline btn-small" onClick={handleLogout}>Logout</button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
