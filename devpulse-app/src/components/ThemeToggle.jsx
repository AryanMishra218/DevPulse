// A single button that flips between "light" and "dark".
// It doesn't decide WHAT the current theme is — App.jsx owns
// that state. This component just displays the current value
// and reports clicks back up, via props. This is the same
// "lifted state" pattern used by TopBar's search box.
export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? "☀" : "☾"}
    </button>
  );
}
