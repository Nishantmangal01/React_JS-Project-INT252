// AdminLayout.jsx - nested routes: side links on the left, the chosen admin page in <Outlet />
import { NavLink, Outlet } from 'react-router-dom'

function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <NavLink to="/admin" end>Home</NavLink>
        <NavLink to="/admin/partners">Partners</NavLink>
        <NavLink to="/admin/requests">Requests</NavLink>
        <NavLink to="/admin/organizations">Organizations</NavLink>
        <NavLink to="/admin/epr">EPR Records</NavLink>
        <NavLink to="/admin/audit">Audit Log</NavLink>
      </aside>

      <section>
        <Outlet />
      </section>
    </div>
  )
}

export default AdminLayout
