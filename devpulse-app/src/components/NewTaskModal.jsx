import { useState } from "react";
import { createTask } from "../api";

const EMPTY_FORM = { title: "", project_id: "", priority: "medium", due_date: "" };

export default function NewTaskModal({ projects, onClose, onCreate }) {
  const [formData, setFormData] = useState({
    ...EMPTY_FORM,
    project_id: projects[0]?.id || "",
  });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Task title is required.");
      return;
    }
    if (!formData.project_id) {
      setError("Create a project first, then add tasks to it.");
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      const task = await createTask({
        title: formData.title.trim(),
        project_id: Number(formData.project_id),
        priority: formData.priority,
        due_date: formData.due_date || null,
      });
      onCreate(task);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>New Task</h2>
        <form onSubmit={handleSubmit}>
          <label className="modal__field">
            Title
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g. Fix navbar overflow on mobile"
              autoFocus
            />
          </label>

          <label className="modal__field">
            Project
            <select value={formData.project_id} onChange={(e) => handleChange("project_id", e.target.value)}>
              {projects.length === 0 && <option value="">No projects yet</option>}
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>

          <div className="modal__row">
            <label className="modal__field">
              Priority
              <select value={formData.priority} onChange={(e) => handleChange("priority", e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>

            <label className="modal__field">
              Due date
              <input type="date" value={formData.due_date} onChange={(e) => handleChange("due_date", e.target.value)} />
            </label>
          </div>

          {error && <p className="modal__error">{error}</p>}

          <div className="modal__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={isSaving}>
              {isSaving ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
