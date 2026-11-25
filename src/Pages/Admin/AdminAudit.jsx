// AdminAudit.jsx - audit log table (who did what, and when)
import { useState, useEffect } from 'react'
import api, { getErrorMessage } from '../../Axios.jsx'

function AdminAudit() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load the audit log once
  useEffect(() => {
    async function loadLogs() {
      try {
        const response = await api.get('/api/audit')
        setLogs(response.data.data)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    loadLogs()
  }, [])

  return (
    <div>
      <h2>Audit Log</h2>
      {loading && <p className="message-muted">Loading...</p>}
      {error && <div className="message message-error">{error}</div>}
      {!loading && !error && logs.length === 0 && <p className="message-muted">No audit entries found</p>}

      {logs.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>When</th>
                <th>Action</th>
                <th>By</th>
                <th>Target</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                  <td>{log.action}</td>
                  <td>{log.performedBy ? `${log.performedBy.username} (${log.performedBy.role})` : 'unknown'}</td>
                  <td>{log.targetType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminAudit
