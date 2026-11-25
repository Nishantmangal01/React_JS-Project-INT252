// Home.jsx - short intro, 3 steps, and Login/Register buttons
import { Link } from 'react-router-dom'
import { getStoredUser } from '../Axios.jsx'

function Home() {
  const user = getStoredUser()

  return (
    <div>
      <section className="hero">
        <h1>Recycle your e-waste the right way</h1>
        <p>
          EcoCycle connects citizens, collection centers, recyclers and participating organizations,
          and keeps an auditable record of every pickup and every kilogram recycled.
        </p>
        {!user && (
          <div className="hero-buttons">
            <Link to="/login" className="btn">Login</Link>
            <Link to="/register" className="btn btn-outline">Register</Link>
          </div>
        )}
      </section>

      <section className="steps">
        <div className="card">
          <div className="step-number">1</div>
          <h3>Request</h3>
          <p>Citizens request a pickup for old phones, laptops, batteries and other electronics.</p>
        </div>
        <div className="card">
          <div className="step-number">2</div>
          <h3>Collect</h3>
          <p>Approved collection partners pick up the items and update the status.</p>
        </div>
        <div className="card">
          <div className="step-number">3</div>
          <h3>Verify</h3>
          <p>The verified weight is recorded and the admin creates an auditable EPR record.</p>
        </div>
      </section>
    </div>
  )
}

export default Home
