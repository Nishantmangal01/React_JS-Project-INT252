// Login.jsx - login form. Saves id, username and role in localStorage (never the password).
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { getErrorMessage } from '../Axios.jsx'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Send the login request and go to the page for the user's role
  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await api.post('/api/auth/login', { email, password })
      const user = response.data.data
      localStorage.setItem('ecoUser', JSON.stringify({ id: user.id, username: user.username, role: user.role }))

      if (user.role === 'admin') navigate('/admin')
      else if (user.role === 'partner') navigate('/partner')
      else navigate('/requests')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card form-card">
      <h2>Login</h2>
      {error && <div className="message message-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="message-muted" style={{ marginTop: 16 }}>
        New here? <Link to="/register">Create an account</Link>
      </p>
    </div>
  )
}

export default Login
