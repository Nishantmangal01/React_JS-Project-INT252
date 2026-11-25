// AdminHome.jsx - simple counts shown with StatCard
import { useState, useEffect } from 'react'
import api, { getErrorMessage } from '../../Axios.jsx'
import StatCard from '../../Components/StatCard.jsx'

function AdminHome() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load the counts once
  useEffect(() => {
    async function loadStats() {
      try {
        const response = await api.get('/api/stats')
        setStats(response.data.data)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  return (
    <div>
      <h2>Admin Home</h2>
      {loading && <p className="message-muted">Loading...</p>}
      {error && <div className="message message-error">{error}</div>}

      {stats && (
        <>
          <div className="stat-grid">
            <StatCard title="Total requests" value={stats.totalRequests} />
            <StatCard title="Verified weight (kg)" value={stats.totalVerifiedWeightKg} />
            <StatCard title="Partners" value={stats.partnerCount} />
            <StatCard title="EPR records" value={stats.eprRecordCount} />
          </div>

          <h3>Requests by status</h3>
          <div className="stat-grid">
            {Object.keys(stats.requestsByStatus).map((status) => (
              <StatCard key={status} title={status} value={stats.requestsByStatus[status]} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default AdminHome
