// A small colored label like "DONE" or "IN PROGRESS".
// We centralize the color logic here so every place
// that shows a status looks consistent.
const STYLES = {
  done: { bg: "var(--success-soft)", color: "var(--success)", label: "Done" },
  completed: { bg: "var(--success-soft)", color: "var(--success)", label: "Completed" },
  "in-progress": { bg: "var(--accent-soft)", color: "var(--accent)", label: "In Progress" },
  active: { bg: "var(--accent-soft)", color: "var(--accent)", label: "Active" },
  todo: { bg: "var(--surface-alt)", color: "var(--text-muted)", label: "To Do" },
  high: { bg: "var(--danger-soft)", color: "var(--danger)", label: "High" },
  medium: { bg: "var(--accent-soft)", color: "var(--accent)", label: "Medium" },
  low: { bg: "var(--surface-alt)", color: "var(--text-muted)", label: "Low" },
};

export default function StatusPill({ value }) {
  const style = STYLES[value] || STYLES.todo;
  return (
    <span
      className="status-pill"
      style={{ background: style.bg, color: style.color }}
    >
      {style.label}
    </span>
  );
}
