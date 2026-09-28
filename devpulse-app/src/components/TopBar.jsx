import ThemeToggle from "./ThemeToggle";

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function TopBar({
  user,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  theme,
  onToggleTheme,
  onLogout,
}) {
  return (
    <header className="topbar">
      <div className="topbar__search">
        <input
          type="text"
          placeholder="Search projects or tasks..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search"
        />
      </div>

      <select
        className="topbar__filter"
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value)}
        aria-label="Filter by status"
      >
        <option value="all">All statuses</option>
        <option value="todo">To Do</option>
        <option value="in-progress">In Progress</option>
        <option value="done">Done</option>
      </select>

      <ThemeToggle theme={theme} onToggle={onToggleTheme} />

      <div className="topbar__user">
        <div className="topbar__avatar">{getInitials(user.name)}</div>
        <div>
          <p className="topbar__user-name">{user.name}</p>
          <p className="topbar__user-role">{user.email}</p>
        </div>
      </div>

      <button className="btn btn--ghost btn--small" onClick={onLogout}>
        Log out
      </button>
    </header>
  );
}
