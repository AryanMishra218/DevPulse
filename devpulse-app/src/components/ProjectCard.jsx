import { useState } from "react";
import ProgressBar from "./ProgressBar";
import { aiSuggestTasks, createTask } from "../api";

export default function ProjectCard({ project, onEdit, onDelete, onTaskAdded }) {
  const [suggestions, setSuggestions] = useState(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [error, setError] = useState("");

  async function handleSuggestTasks() {
    setError("");
    setIsSuggesting(true);
    try {
      const { suggestions: list } = await aiSuggestTasks(project.name, project.description);
      setSuggestions(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSuggesting(false);
    }
  }

  async function handleAddSuggestion(title) {
    try {
      const task = await createTask({ title, project_id: project.id, priority: "medium" });
      onTaskAdded(task);
      setSuggestions((prev) => prev.filter((s) => s !== title));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="card project-card">
      <div className="project-card__header">
        <h3>{project.name}</h3>
        <div className="project-card__actions">
          <button className="icon-button" onClick={() => onEdit(project)} title="Edit project">✎</button>
          <button className="icon-button" onClick={() => onDelete(project)} title="Delete project">🗑</button>
        </div>
      </div>
      <p className="project-card__desc">{project.description || "No description yet."}</p>
      <ProgressBar done={project.tasksDone} total={project.tasksTotal} />

      <button
        className="btn btn--ghost btn--ai btn--small"
        onClick={handleSuggestTasks}
        disabled={isSuggesting}
      >
        {isSuggesting ? "Thinking..." : "✨ Suggest tasks with AI"}
      </button>

      {error && <p className="modal__error">{error}</p>}

      {suggestions && suggestions.length > 0 && (
        <ul className="ai-suggestions">
          {suggestions.map((s) => (
            <li key={s}>
              <span>{s}</span>
              <button className="icon-button" onClick={() => handleAddSuggestion(s)} title="Add this task">+</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
