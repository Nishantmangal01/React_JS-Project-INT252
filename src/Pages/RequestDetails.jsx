// RequestDetails.jsx - dynamic route /requests/:id. Shows one request and its status history.
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api, { getErrorMessage, getStoredUser } from '../Axios.jsx'
import StatusBadge from '../Components/StatusBadge.jsx'

function RequestDetails() {
  const { id } = useParams() // the :id from the URL
  const user = getStoredUser()
  const [request, setRequest] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load this request whenever the id in the URL changes
  useEffect(() => {
    async function loadRequest() {
      try {
        const response = await api.get('/api/requests/' + id)
        setRequest(response.data.data.request)
        setHistory(response.data.data.history)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    loadRequest()
  }, [id])

  // Where the Back link goes depends on the role
  let backLink = '/requests'
  if (user && user.role === 'partner') backLink = '/partner'
  if (user && user.role === 'admin') backLink = '/admin/requests'

  return (
    <div>
      <p><Link to={backLink}>&larr; Back</Link></p>
      <h2>Request details</h2>

      {loading && <p className="message-muted">Loading...</p>}
      {error && <div className="message message-error">{error}</div>}

      {request && (
        <>
          <div className="card">
            <div className="detail-grid">
              <div className="detail-label">Status</div>
              <div><StatusBadge status={request.status} /></div>
              <div className="detail-label">Device</div>
              <div>{request.deviceType}</div>
              <div className="detail-label">Quantity</div>
              <div>{request.quantity}</div>
              <div className="detail-label">Address</div>
              <div>{request.address}, {request.city}</div>
              <div className="detail-label">Description</div>
              <div>{request.description || '-'}</div>
              <div className="detail-label">Citizen</div>
              <div>{request.citizenId ? request.citizenId.username : '-'}</div>
              <div className="detail-label">Partner</div>
              <div>{request.partnerId ? `${request.partnerId.username} (${request.partnerId.partnerType})` : 'Not assigned yet'}</div>
              <div className="detail-label">Verified weight</div>
              <div>{request.verifiedWeightKg ? request.verifiedWeightKg + ' kg' : '-'}</div>
              <div className="detail-label">Created</div>
              <div>{new Date(request.createdAt).toLocaleString()}</div>
            </div>
          </div>

          <div className="card">
            <h3>Status history</h3>
            {history.length === 0 && <p className="message-muted">No history yet</p>}
            <ul className="history-list">
              {history.map((entry) => (
                <li key={entry._id}>
                  <div>{entry.action}</div>
                  <div className="history-meta">
                    by {entry.performedBy ? `${entry.performedBy.username} (${entry.performedBy.role})` : 'unknown'}
                    {' '}on {new Date(entry.createdAt).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

export default RequestDetails
