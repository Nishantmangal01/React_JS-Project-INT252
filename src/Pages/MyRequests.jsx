// MyRequests.jsx - list of the logged-in citizen's own requests
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api, { getErrorMessage } from '../Axios.jsx'
import StatusBadge from '../Components/StatusBadge.jsx'

function MyRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load my requests once when the page opens
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
      <h2>My Requests</h2>
      <p><Link to="/requests/new" className="btn">New pickup request</Link></p>

      {loading && <p className="message-muted">Loading...</p>}
      {error && <div className="message message-error">{error}</div>}
      {!loading && !error && requests.length === 0 && <p className="message-muted">No requests found</p>}

      {requests.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Device</th>
                <th>Quantity</th>
                <th>City</th>
                <th>Status</th>
                <th>Verified weight</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id}>
                  <td>{request.deviceType}</td>
                  <td>{request.quantity}</td>
                  <td>{request.city}</td>
                  <td><StatusBadge status={request.status} /></td>
                  <td>{request.verifiedWeightKg ? request.verifiedWeightKg + ' kg' : '-'}</td>
                  <td>{new Date(request.createdAt).toLocaleDateString()}</td>
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

export default MyRequests
