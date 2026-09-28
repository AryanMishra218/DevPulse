// Shown whenever a list (search results, tasks, etc.) is empty.
// Good UX rule: never show a blank space — always tell the
// user WHY it's empty and what to do next.
export default function EmptyState({ message }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">◇</div>
      <p>{message}</p>
    </div>
  );
}
