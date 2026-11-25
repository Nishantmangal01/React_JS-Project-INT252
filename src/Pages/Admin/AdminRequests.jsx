// AdminRequests.jsx - view all requests
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api, { getErrorMessage } from '../../Axios.jsx'
import StatusBadge from '../../Components/StatusBadge.jsx'

function AdminRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load all requests once
  useEffect(() => {
    async function loadRequests() {
      try {
        const response = await api.get('/api/requests')
        setRequests(response.data.data)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    loadRequests()
  }, [])

  return (
    <div>
      <h2>All Requests</h2>
      {loading && <p className="message-muted">Loading...</p>}
      {error && <div className="message message-error">{error}</div>}
      {!loading && !error && requests.length === 0 && <p className="message-muted">No requests found</p>}

      {requests.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Citizen</th>
                <th>Device</th>
                <th>Qty</th>
                <th>City</th>
                <th>Status</th>
                <th>Partner</th>
                <th>Weight</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id}>
                  <td>{request.citizenId ? request.citizenId.username : '-'}</td>
                  <td>{request.deviceType}</td>
                  <td>{request.quantity}</td>
                  <td>{request.city}</td>
                  <td><StatusBadge status={request.status} /></td>
                  <td>{request.partnerId ? request.partnerId.username : '-'}</td>
                  <td>{request.verifiedWeightKg ? request.verifiedWeightKg + ' kg' : '-'}</td>
                  <td><Link to={'/requests/' + request._id}>Details</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminRequests
