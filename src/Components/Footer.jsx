// Footer.jsx - short text with the current year
function Footer() {
  return (
    <footer className="footer">
      <p>EcoCycle - E-Waste Collection and EPR Records &copy; {new Date().getFullYear()}</p>
    </footer>
  )
}

export default Footer
