// PartnerDashboard.jsx - table of requests, status buttons and verified-weight input
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api, { getErrorMessage } from '../Axios.jsx'
import StatusBadge from '../Components/StatusBadge.jsx'

// The status buttons a partner can press
const statusButtons = ['Scheduled', 'Picked Up', 'Delivered to Recycler', 'Rejected']

function PartnerDashboard() {
  const [requests, setRequests] = useState([])
  const [weights, setWeights] = useState({}) // weight typed for each request id
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Load the requests this partner can see
  async function loadRequests() {
    try {
      const response = await api.get('/api/requests')
      setRequests(response.data.data)
      setError('')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  // Send a PATCH to the server, then reload the list
  async function updateRequest(requestId, changes) {
    setMessage('')
    setError('')
    try {
      await api.patch('/api/requests/' + requestId, changes)
      setMessage('Request updated')
      await loadRequests()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  // Save the typed weight and mark the request Verified
  function handleVerify(request) {
    const weight = Number(weights[request._id])
    if (!(weight > 0)) {
      setError('Enter a positive verified weight in kg first')
      return
    }
    updateRequest(request._id, { verifiedWeightKg: weight, status: 'Verified' })
  }

  return (
    <div>
      <h2>Partner Dashboard</h2>

      {loading && <p className="message-muted">Loading...</p>}
      {error && <div className="message message-error">{error}</div>}
      {message && <div className="message message-success">{message}</div>}
      {!loading && !error && requests.length === 0 && <p className="message-muted">No requests found</p>}

      {requests.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Device</th>
                <th>Qty</th>
                <th>City</th>
                <th>Status</th>
                <th>Verified weight</th>
                <th>Update status</th>
                <th>Verify</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id}>
                  <td><Link to={'/requests/' + request._id}>{request.deviceType}</Link></td>
                  <td>{request.quantity}</td>
                  <td>{request.city}</td>
                  <td><StatusBadge status={request.status} /></td>
                  <td>{request.verifiedWeightKg ? request.verifiedWeightKg + ' kg' : '-'}</td>
                  <td>
                    <div className="row-actions">
                      {statusButtons.map((status) => (
                        <button
                          key={status}
                          className="btn btn-outline btn-small"
                          disabled={request.status === status || request.status === 'Verified'}
                          onClick={() => updateRequest(request._id, { status })}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td>
                    {request.status === 'Verified' ? (
                      'Done'
                    ) : (
                      <div className="row-actions">
                        <input
                          className="inline-input"
                          type="number"
                          min="0.01"
                          step="0.01"
                          placeholder="Weight kg"
                          value={weights[request._id] || ''}
                          onChange={(e) => setWeights({ ...weights, [request._id]: e.target.value })}
                        />
                        <button className="btn btn-small" onClick={() => handleVerify(request)}>Verify</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default PartnerDashboard
