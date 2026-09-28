import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { getToken, setToken, clearToken, getMe } from "./api";
import "./layout.css";

const THEME_KEY = "devpulse-theme";

function getInitialTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || "dark";
  } catch {
    return "dark";
  }
}

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [theme, setTheme] = useState(getInitialTheme);

  // `null` = we haven't checked yet, `false` = definitely logged
  // out, an object = the logged-in user. Three distinct states,
  // so we can show a blank screen (not a login flash) while we
  // check for an existing token on first load.
  const [currentUser, setCurrentUser] = useState(null);
  const [authView, setAuthView] = useState("login"); // "login" | "register"

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  // On first load: if a token is already saved from a previous
  // visit, verify it's still valid by calling /api/auth/me instead
  // of trusting it blindly (it may have expired).
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setCurrentUser(false);
      return;
    }
    getMe()
      .then((user) => setCurrentUser(user))
      .catch(() => {
        clearToken();
        setCurrentUser(false);
      });
  }, []);

  function handleLoggedIn(token, user) {
    setToken(token);
    setCurrentUser(user);
  }

  function handleLogout() {
    clearToken();
    setCurrentUser(false);
    setAuthView("login");
  }

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  // Still checking for an existing session — render nothing rather
  // than briefly flashing the login screen.
  if (currentUser === null) return null;

  if (!currentUser) {
    return authView === "login" ? (
      <Login onLoggedIn={handleLoggedIn} onSwitchToRegister={() => setAuthView("register")} />
    ) : (
      <Register onLoggedIn={handleLoggedIn} onSwitchToLogin={() => setAuthView("login")} />
    );
  }

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <div className="app-main">
        <TopBar
          user={currentUser}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogout={handleLogout}
        />

        {activePage === "profile" ? (
          <Profile user={currentUser} />
        ) : (
          <Dashboard searchTerm={searchTerm} statusFilter={statusFilter} />
        )}
      </div>
    </div>
  );
}
