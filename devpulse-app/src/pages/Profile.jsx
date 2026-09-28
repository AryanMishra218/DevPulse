import { useState, useEffect } from "react";
import { listTasks } from "../api";

function getInitials(name) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export default function Profile({ user }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    listTasks().then(setTasks).catch(() => setTasks([]));
  }, []);

  const myTasks = tasks.filter((t) => t.assignee_id === user.id);
  const completed = myTasks.filter((t) => t.status === "done").length;

  return (
    <div className="page">
      <h1>Profile</h1>
      <p className="page__subtitle">Your account details and activity.</p>

      <div className="card profile-card">
        <div className="topbar__avatar" style={{ width: 64, height: 64, fontSize: "1.4rem" }}>
          {getInitials(user.name)}
        </div>
        <div>
          <h3>{user.name}</h3>
          <p className="page__subtitle">{user.email}</p>
        </div>
      </div>

      <div className="stats-row" style={{ marginTop: "1.5rem" }}>
        <div className="card stat-card">
          <span className="stat-card__value">{myTasks.length}</span>
          <span className="stat-card__label">Tasks Assigned to Me</span>
        </div>
        <div className="card stat-card">
          <span className="stat-card__value" style={{ color: "var(--success)" }}>{completed}</span>
          <span className="stat-card__label">Tasks Completed</span>
        </div>
      </div>
    </div>
  );
}
