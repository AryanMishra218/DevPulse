// NAV_ITEMS is an array of objects, so if we want to add a
// new nav link later, we just add one line here — nothing
// else in this file needs to change. This is what "clean,
// reusable" component design means in practice.
const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "▤" },
  { key: "projects", label: "Projects", icon: "◧" },
  { key: "tasks", label: "Tasks", icon: "☑" },
  { key: "profile", label: "Profile", icon: "◐" },
];

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__brand-mark">DP</span>
        <span className="sidebar__brand-name">DevPulse</span>
      </div>

      <nav aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            className={
              "sidebar__link" +
              (activePage === item.key ? " sidebar__link--active" : "")
            }
            onClick={() => onNavigate(item.key)}
            aria-current={activePage === item.key ? "page" : undefined}
          >
            <span className="sidebar__link-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
