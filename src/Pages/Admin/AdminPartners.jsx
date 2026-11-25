// AdminPartners.jsx - list partners and approve or reject them
import { useState, useEffect } from 'react'
import api, { getErrorMessage } from '../../Axios.jsx'
import StatusBadge from '../../Components/StatusBadge.jsx'

function AdminPartners() {
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load all partners
  async function loadPartners() {
    try {
      const response = await api.get('/api/partners')
      setPartners(response.data.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPartners()
  }, [])

  // Approve or reject one partner, then reload
  async function updatePartner(partnerId, approvalStatus) {
    setError('')
    try {
      await api.patch('/api/partners/' + partnerId, { approvalStatus })
      await loadPartners()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div>
      <h2>Partners</h2>
      {loading && <p className="message-muted">Loading...</p>}
      {error && <div className="message message-error">{error}</div>}
      {!loading && !error && partners.length === 0 && <p className="message-muted">No partners found</p>}

      {partners.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Type</th>
                <th>Organization</th>
                <th>City</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((partner) => (
                <tr key={partner._id}>
                  <td>{partner.username}</td>
                  <td>{partner.email}</td>
                  <td>{partner.partnerType}</td>
                  <td>{partner.organizationName || '-'}</td>
                  <td>{partner.city}</td>
                  <td><StatusBadge status={partner.approvalStatus} /></td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn btn-small"
                        disabled={partner.approvalStatus === 'Approved'}
                        onClick={() => updatePartner(partner._id, 'Approved')}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-danger btn-small"
                        disabled={partner.approvalStatus === 'Rejected'}
                        onClick={() => updatePartner(partner._id, 'Rejected')}
                      >
                        Reject
                      </button>
                    </div>
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

export default AdminPartners
