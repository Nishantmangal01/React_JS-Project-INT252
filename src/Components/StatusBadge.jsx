// StatusBadge.jsx - coloured label for a status (the text is always shown, not just colour)
function StatusBadge({ status }) {
  // "Picked Up" becomes "badge-picked-up"
  const className = 'badge badge-' + String(status).toLowerCase().replace(/ /g, '-')
  return <span className={className}>{status}</span>
}

export default StatusBadge
