export default function StatCard({ title, value, hint }) {
  return (
    <div className="stat-card">
      <div className="stat-pill">{title}</div>
      <div className="stat-value">{value}</div>
      {hint ? <div className="stat-hint">{hint}</div> : null}
    </div>
  );
}