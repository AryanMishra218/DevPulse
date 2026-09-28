import { useState, useEffect, useMemo, useCallback } from "react";
import ProjectCard from "../components/ProjectCard";
import TaskCard from "../components/TaskCard";
import EmptyState from "../components/EmptyState";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ActivityHeatmap from "../components/ActivityHeatmap";
import NewTaskModal from "../components/NewTaskModal";
import NewProjectModal from "../components/NewProjectModal";
import { listProjects, listTasks, updateTaskStatus, deleteProject } from "../api";

const PRIORITY_WEIGHT = { high: 0, medium: 1, low: 2 };

export default function Dashboard({ searchTerm, statusFilter }) {
  const [projects, setProjects] = useState([]);
  const [taskList, setTaskList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [sortBy, setSortBy] = useState("dueDate");

  // useCallback so this function has a stable identity across
  // re-renders — it's used inside useEffect's dependency array,
  // and without useCallback it would cause an infinite refetch loop.
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const [projectsData, tasksData] = await Promise.all([listProjects(), listTasks()]);
      setProjects(projectsData);
      setTaskList(tasksData);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleToggleStatus(taskId, newStatus) {
    // Optimistic update: change the UI immediately, then confirm
    // with the server. Feels instant; if the server call fails we
    // simply reload to correct the UI.
    setTaskList((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (err) {
      setLoadError(err.message);
      loadData();
    }
  }

  function handleTaskCreated(task) {
    setTaskList((prev) => [task, ...prev]);
  }

  function handleProjectSaved(project) {
    setProjects((prev) => {
      const exists = prev.some((p) => p.id === project.id);
      return exists ? prev.map((p) => (p.id === project.id ? { ...p, ...project } : p)) : [project, ...prev];
    });
  }

  async function handleDeleteProject(project) {
    if (!confirm(`Delete "${project.name}"? This also deletes all of its tasks.`)) return;
    try {
      await deleteProject(project.id);
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
      setTaskList((prev) => prev.filter((t) => t.project_id !== project.id));
    } catch (err) {
      setLoadError(err.message);
    }
  }

  // Attach computed progress stats to each project, derived from
  // the tasks we already have in state (avoids an extra API call
  // per project card).
  const projectsWithStats = useMemo(() => {
    return projects.map((p) => {
      const projectTasks = taskList.filter((t) => t.project_id === p.id);
      return {
        ...p,
        tasksTotal: projectTasks.length,
        tasksDone: projectTasks.filter((t) => t.status === "done").length,
      };
    });
  }, [projects, taskList]);

  const filteredProjects = useMemo(() => {
    return projectsWithStats.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [projectsWithStats, searchTerm]);

  const filteredTasks = useMemo(() => {
    const filtered = taskList.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    return [...filtered].sort((a, b) => {
      if (sortBy === "priority") return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
      return (a.due_date || "9999").localeCompare(b.due_date || "9999");
    });
  }, [taskList, searchTerm, statusFilter, sortBy]);

  const doneCount = taskList.filter((t) => t.status === "done").length;
  const inProgressCount = taskList.filter((t) => t.status === "in-progress").length;

  // Attach project name onto each task for display, since the API
  // returns project_id (a number), not the name.
  const taskCardData = (task) => ({
    ...task,
    project: projects.find((p) => p.id === task.project_id)?.name || "Unknown project",
    dueDate: task.due_date || "No due date",
  });

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1>Dashboard</h1>
          <p className="page__subtitle">Here's what's happening across your projects.</p>
        </div>
        <div style={{ display: "flex", gap: "0.6rem" }}>
          <button className="btn btn--ghost" onClick={() => setIsProjectModalOpen(true)}>
            + New Project
          </button>
          <button className="btn btn--primary" onClick={() => setIsTaskModalOpen(true)}>
            + New Task
          </button>
        </div>
      </div>

      {loadError && <p className="modal__error" style={{ marginBottom: "1rem" }}>{loadError}</p>}

      <div className="stats-row">
        <div className="card stat-card">
          <span className="stat-card__value">{projects.length}</span>
          <span className="stat-card__label">Active Projects</span>
        </div>
        <div className="card stat-card">
          <span className="stat-card__value">{taskList.length}</span>
          <span className="stat-card__label">Total Tasks</span>
        </div>
        <div className="card stat-card">
          <span className="stat-card__value" style={{ color: "var(--accent)" }}>{inProgressCount}</span>
          <span className="stat-card__label">In Progress</span>
        </div>
        <div className="card stat-card">
          <span className="stat-card__value" style={{ color: "var(--success)" }}>{doneCount}</span>
          <span className="stat-card__label">Completed</span>
        </div>
      </div>

      <section>
        <h2 className="section-title">Activity — last 12 weeks</h2>
        <div className="card"><ActivityHeatmap /></div>
      </section>

      <section>
        <h2 className="section-title">Projects</h2>
        <div className="grid grid--projects">
          {isLoading ? (
            <LoadingSkeleton count={3} height={130} />
          ) : filteredProjects.length === 0 ? (
            <EmptyState message="No projects yet — create your first one above." />
          ) : (
            filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={setEditingProject}
                onDelete={handleDeleteProject}
                onTaskAdded={handleTaskCreated}
              />
            ))
          )}
        </div>
      </section>

      <section>
        <div className="section-header">
          <h2 className="section-title">Tasks</h2>
          <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="dueDate">Sort: Due date</option>
            <option value="priority">Sort: Priority</option>
          </select>
        </div>
        <div className="grid grid--tasks">
          {isLoading ? (
            <LoadingSkeleton count={4} height={70} />
          ) : filteredTasks.length === 0 ? (
            <EmptyState message="No tasks match your search or filter." />
          ) : (
            filteredTasks.map((task) => (
              <TaskCard key={task.id} task={taskCardData(task)} onToggleStatus={handleToggleStatus} />
            ))
          )}
        </div>
      </section>

      {isTaskModalOpen && (
        <NewTaskModal
          projects={projects}
          onClose={() => setIsTaskModalOpen(false)}
          onCreate={handleTaskCreated}
        />
      )}

      {isProjectModalOpen && (
        <NewProjectModal onClose={() => setIsProjectModalOpen(false)} onSaved={handleProjectSaved} />
      )}

      {editingProject && (
        <NewProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSaved={handleProjectSaved}
        />
      )}
    </div>
  );
}
