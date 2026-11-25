// EcoCycle.jsx - defines all the routes of the project
import { Routes, Route } from 'react-router-dom'
import './EcoCycle.css'

import Navbar from './Components/Navbar.jsx'
import Footer from './Components/Footer.jsx'
import ProtectedRoute from './Components/ProtectedRoute.jsx'

import Home from './Pages/Home.jsx'
import Login from './Pages/Login.jsx'
import Register from './Pages/Register.jsx'
import MyRequests from './Pages/MyRequests.jsx'
import NewRequest from './Pages/NewRequest.jsx'
import RequestDetails from './Pages/RequestDetails.jsx'
import PartnerDashboard from './Pages/PartnerDashboard.jsx'

import AdminLayout from './Pages/Admin/AdminLayout.jsx'
import AdminHome from './Pages/Admin/AdminHome.jsx'
import AdminPartners from './Pages/Admin/AdminPartners.jsx'
import AdminRequests from './Pages/Admin/AdminRequests.jsx'
import AdminOrganizations from './Pages/Admin/AdminOrganizations.jsx'
import AdminEpr from './Pages/Admin/AdminEpr.jsx'
import AdminAudit from './Pages/Admin/AdminAudit.jsx'

function EcoCycle() {
  return (
    <div className="eco-app">
      <Navbar />
      <main className="eco-main">
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Citizen pages */}
          <Route
            path="/requests"
            element={<ProtectedRoute allowedRoles={['citizen']}><MyRequests /></ProtectedRoute>}
          />
          <Route
            path="/requests/new"
            element={<ProtectedRoute allowedRoles={['citizen']}><NewRequest /></ProtectedRoute>}
          />

          {/* Dynamic route: one request, any logged-in role */}
          <Route
            path="/requests/:id"
            element={<ProtectedRoute allowedRoles={['citizen', 'partner', 'admin']}><RequestDetails /></ProtectedRoute>}
          />

          {/* Partner page */}
          <Route
            path="/partner"
            element={<ProtectedRoute allowedRoles={['partner']}><PartnerDashboard /></ProtectedRoute>}
          />

          {/* Nested routes: AdminLayout shows the side links and an <Outlet /> */}
          <Route
            path="/admin"
            element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}
          >
            <Route index element={<AdminHome />} />
            <Route path="partners" element={<AdminPartners />} />
            <Route path="requests" element={<AdminRequests />} />
            <Route path="organizations" element={<AdminOrganizations />} />
            <Route path="epr" element={<AdminEpr />} />
            <Route path="audit" element={<AdminAudit />} />
          </Route>

          <Route path="*" element={<p className="message message-muted">Page not found.</p>} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default EcoCycle
