// NewRequest.jsx - form to request an e-waste pickup
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { getErrorMessage } from '../Axios.jsx'

const deviceTypes = ['Mobile', 'Laptop', 'Computer', 'Battery', 'Charger', 'Television', 'Other']

function NewRequest() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    deviceType: 'Mobile',
    quantity: 1,
    address: '',
    city: '',
    description: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // One handler updates whichever field changed
  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value })
  }

  // Send the new request to the server, then go to the list
  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/api/requests', formData)
      navigate('/requests')
    } catch (err) {
      setError(getErrorMessage(err))
      setLoading(false)
    }
  }

  return (
    <div className="card form-card">
      <h2>Request a pickup</h2>
      {error && <div className="message message-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="deviceType">Device type</label>
          <select id="deviceType" name="deviceType" value={formData.deviceType} onChange={handleChange}>
            {deviceTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="quantity">Quantity</label>
          <input id="quantity" name="quantity" type="number" min="1" value={formData.quantity} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="address">Pickup address</label>
          <input id="address" name="address" value={formData.address} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="city">City</label>
          <input id="city" name="city" value={formData.city} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description (optional)</label>
          <textarea id="description" name="description" rows="3" value={formData.description} onChange={handleChange} />
        </div>
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit request'}
        </button>
      </form>
    </div>
  )
}

export default NewRequest
