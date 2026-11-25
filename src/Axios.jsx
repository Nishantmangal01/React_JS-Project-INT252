// Axios.jsx - one Axios instance used by every page. It adds the x-user-id header automatically.
import axios from 'axios'

// In development the Vite proxy sends /api to Express. For deployment set VITE_API_URL.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
})

// Reads the logged-in user (id, username, role) saved in localStorage. Never contains a password.
export function getStoredUser() {
  try {
    const savedUser = localStorage.getItem('ecoUser')
    return savedUser ? JSON.parse(savedUser) : null
  } catch {
    return null
  }
}

// Before every request, attach the user id so the server knows who is asking
api.interceptors.request.use((config) => {
  const user = getStoredUser()
  if (user && user.id) {
    config.headers['x-user-id'] = user.id
  }
  return config
})

// Turns an Axios error into a readable message for the page
export function getErrorMessage(error) {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message
  }
  return 'Could not reach the server. Is it running?'
}

export default api
