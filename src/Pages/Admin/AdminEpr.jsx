// AdminEpr.jsx - create and list EPR records (only for Verified requests)
import { useState, useEffect } from 'react'
import api, { getErrorMessage } from '../../Axios.jsx'

function AdminEpr() {
  const [records, setRecords] = useState([])
  const [organizations, setOrganizations] = useState([])
  const [verifiedRequests, setVerifiedRequests] = useState([])
  const [recyclers, setRecyclers] = useState([])
  const [formData, setFormData] = useState({ organizationId: '', requestId: '', recycledBy: '', notes: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Load EPR records plus the lists needed by the form
  async function loadData() {
    try {
      const [eprResponse, orgResponse, requestResponse, partnerResponse] = await Promise.all([
        api.get('/api/epr'),
        api.get('/api/organizations'),
        api.get('/api/requests'),
        api.get('/api/partners'),
      ])
      setRecords(eprResponse.data.data)
      setOrganizations(orgResponse.data.data)
      // only Verified requests can get an EPR record
      setVerifiedRequests(requestResponse.data.data.filter((request) => request.status === 'Verified'))
      // only approved recyclers can be chosen
      setRecyclers(
        partnerResponse.data.data.filter(
          (partner) => partner.partnerType === 'recycler' && partner.approvalStatus === 'Approved'
        )
      )
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // One handler updates whichever field changed
  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value })
  }

  // Create the EPR record, then reload
  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    try {
      await api.post('/api/epr', formData)
      setMessage('EPR record created')
      setFormData({ organizationId: '', requestId: '', recycledBy: '', notes: '' })
      await loadData()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div>
      <h2>EPR Records</h2>
      {error && <div className="message message-error">{error}</div>}
      {message && <div className="message message-success">{message}</div>}

      <form className="card" onSubmit={handleSubmit}>
        <h3>Create EPR record</h3>
        <div className="form-group">
          <label htmlFor="organizationId">Organization</label>
          <select id="organizationId" name="organizationId" value={formData.organizationId} onChange={handleChange} required>
            <option value="">Select organization</option>
            {organizations.map((organization) => (
              <option key={organization._id} value={organization._id}>{organization.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="requestId">Verified request</label>
          <select id="requestId" name="requestId" value={formData.requestId} onChange={handleChange} required>
            <option value="">Select verified request</option>
            {verifiedRequests.map((request) => (
              <option key={request._id} value={request._id}>
                {request.deviceType} x{request.quantity} - {request.city} - {request.verifiedWeightKg} kg
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="recycledBy">Recycled by</label>
          <select id="recycledBy" name="recycledBy" value={formData.recycledBy} onChange={handleChange} required>
            <option value="">Select recycler</option>
            {recyclers.map((recycler) => (
              <option key={recycler._id} value={recycler._id}>
                {recycler.username}{recycler.organizationName ? ' - ' + recycler.organizationName : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="notes">Notes (optional)</label>
          <textarea id="notes" name="notes" rows="2" value={formData.notes} onChange={handleChange} />
        </div>
        <button className="btn" type="submit">Create record</button>
      </form>

      {loading && <p className="message-muted">Loading...</p>}
      {!loading && records.length === 0 && <p className="message-muted">No EPR records found</p>}

      {records.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Organization</th>
                <th>Request</th>
                <th>Weight</th>
                <th>Recycled by</th>
                <th>Notes</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record._id}>
                  <td>{record.organizationId ? record.organizationId.name : '-'}</td>
                  <td>
                    {record.requestId ? `${record.requestId.deviceType} x${record.requestId.quantity} (${record.requestId.city})` : '-'}
                  </td>
                  <td>{record.weightKg} kg</td>
                  <td>{record.recycledBy ? record.recycledBy.username : '-'}</td>
                  <td>{record.notes || '-'}</td>
                  <td>{new Date(record.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminEpr
