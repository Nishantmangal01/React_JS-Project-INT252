// Register.jsx - registration form for citizens and partners (admin is not selectable)
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { getErrorMessage } from '../Axios.jsx'

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'citizen',
    partnerType: 'center',
    organizationName: '',
    city: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // One handler updates whichever field changed
  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value })
  }

  // Send the registration to the server
  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const response = await api.post('/api/auth/register', formData)
      setSuccess(response.data.message + '. Redirecting to login...')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card form-card">
      <h2>Register</h2>
      {error && <div className="message message-error">{error}</div>}
      {success && <div className="message message-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Name</label>
          <input id="username" name="username" value={formData.username} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password (at least 6 characters)</label>
          <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="city">City</label>
          <input id="city" name="city" value={formData.city} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="role">I am a</label>
          <select id="role" name="role" value={formData.role} onChange={handleChange}>
            <option value="citizen">Citizen</option>
            <option value="partner">Collection partner</option>
          </select>
        </div>

        {/* Extra fields only for partners */}
        {formData.role === 'partner' && (
          <>
            <div className="form-group">
              <label htmlFor="partnerType">Partner type</label>
              <select id="partnerType" name="partnerType" value={formData.partnerType} onChange={handleChange}>
                <option value="center">Collection center</option>
                <option value="recycler">Recycler</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="organizationName">Organization name (optional)</label>
              <input id="organizationName" name="organizationName" value={formData.organizationName} onChange={handleChange} />
            </div>
          </>
        )}

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <p className="message-muted" style={{ marginTop: 16 }}>
        Already registered? <Link to="/login">Login</Link>
      </p>
    </div>
  )
}

export default Register
