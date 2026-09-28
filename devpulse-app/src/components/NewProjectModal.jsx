import { useState } from "react";
import { createProject, updateProject, aiGenerateDescription } from "../api";

// If `project` is passed in, this modal edits it instead of
// creating a new one. Same form, same validation, less code
// to maintain than a separate EditProjectModal file.
export default function NewProjectModal({ project, onClose, onSaved }) {
  const isEditing = Boolean(project);
  const [name, setName] = useState(project?.name || "");
  const [description, setDescription] = useState(project?.description || "");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerateDescription() {
    if (!name.trim()) {
      setError("Enter a project name first, so the AI has something to work with.");
      return;
    }
    setError("");
    setIsGenerating(true);
    try {
      const { description: generated } = await aiGenerateDescription(name.trim());
      setDescription(generated);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      const saved = isEditing
        ? await updateProject(project.id, { name: name.trim(), description })
        : await createProject({ name: name.trim(), description });
      onSaved(saved);
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
        <h2>{isEditing ? "Edit Project" : "New Project"}</h2>
        <form onSubmit={handleSubmit}>
          <label className="modal__field">
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Inventory Tracker"
              autoFocus
            />
          </label>

          <label className="modal__field">
            Description
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this project do?"
            />
          </label>

          <button
            type="button"
            className="btn btn--ghost btn--ai"
            onClick={handleGenerateDescription}
            disabled={isGenerating}
          >
            {isGenerating ? "Thinking..." : "✨ Generate description with AI"}
          </button>

          {error && <p className="modal__error">{error}</p>}

          <div className="modal__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={isSaving}>
              {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
