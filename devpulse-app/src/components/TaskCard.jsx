import StatusPill from "./StatusPill";

// Clicking the checkbox cycles the task through statuses:
// todo -> in-progress -> done -> todo. This is a common
// real-world UI pattern (Linear, Trello all do this).
const NEXT_STATUS = {
  todo: "in-progress",
  "in-progress": "done",
  done: "todo",
};

export default function TaskCard({ task, onToggleStatus }) {
  return (
    <div className="card task-card">
      <div className="task-card__main">
        <button
          className={`task-card__checkbox task-card__checkbox--${task.status}`}
          onClick={() => onToggleStatus(task.id, NEXT_STATUS[task.status])}
          aria-label={`Change status of "${task.title}" (currently ${task.status})`}
          title="Click to change status"
        >
          {task.status === "done" ? "✓" : ""}
        </button>
        <div>
          <p
            className={
              "task-card__title" +
              (task.status === "done" ? " task-card__title--done" : "")
            }
          >
            {task.title}
          </p>
          <p className="task-card__meta">
            {task.project} · Due {task.dueDate}
          </p>
        </div>
      </div>
      <div className="task-card__badges">
        <StatusPill value={task.priority} />
        <StatusPill value={task.status} />
      </div>
    </div>
  );
}
