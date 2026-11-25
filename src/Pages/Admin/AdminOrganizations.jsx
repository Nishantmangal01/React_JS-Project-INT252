// AdminOrganizations.jsx - add and list participating organizations
import { useState, useEffect } from 'react'
import api, { getErrorMessage } from '../../Axios.jsx'

function AdminOrganizations() {
  const [organizations, setOrganizations] = useState([])
  const [name, setName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load all organizations
  async function loadOrganizations() {
    try {
      const response = await api.get('/api/organizations')
      setOrganizations(response.data.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrganizations()
  }, [])

  // Add a new organization, then reload the list
  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    try {
      await api.post('/api/organizations', { name, contactEmail })
      setName('')
      setContactEmail('')
      await loadOrganizations()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div>
      <h2>Organizations</h2>
      {error && <div className="message message-error">{error}</div>}

      <form className="card" onSubmit={handleSubmit}>
        <h3>Add organization</h3>
        <div className="form-group">
          <label htmlFor="orgName">Name</label>
          <input id="orgName" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="orgEmail">Contact email</label>
          <input id="orgEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required />
        </div>
        <button className="btn" type="submit">Add</button>
      </form>

      {loading && <p className="message-muted">Loading...</p>}
      {!loading && organizations.length === 0 && <p className="message-muted">No organizations found</p>}

      {organizations.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact email</th>
                <th>Added</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((organization) => (
                <tr key={organization._id}>
                  <td>{organization.name}</td>
                  <td>{organization.contactEmail}</td>
                  <td>{new Date(organization.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminOrganizations
