export default function Panel({ title, children, className = "" }) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-title">{title}</div>
      {children}
    </section>
  );
}