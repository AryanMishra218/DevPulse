import { useState } from "react";
import { registerUser } from "../api";

export default function Register({ onLoggedIn, onSwitchToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const { token, user } = await registerUser(name, email, password);
      onLoggedIn(token, user);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="sidebar__brand" style={{ marginBottom: "1.5rem", justifyContent: "center" }}>
          <span className="sidebar__brand-mark">DP</span>
          <span className="sidebar__brand-name">DevPulse</span>
        </div>
        <h1 style={{ fontSize: "1.3rem", marginBottom: "0.25rem" }}>Create your account</h1>
        <p className="page__subtitle" style={{ marginBottom: "1.5rem" }}>Start tracking your projects.</p>

        <label className="modal__field">
          Name
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        </label>
        <label className="modal__field">
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="modal__field">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </label>

        {error && <p className="modal__error">{error}</p>}

        <button type="submit" className="btn btn--primary" style={{ width: "100%" }} disabled={isLoading}>
          {isLoading ? "Creating account..." : "Sign Up"}
        </button>

        <p className="auth-switch">
          Already have an account?{" "}
          <button type="button" className="link-button" onClick={onSwitchToLogin}>
            Log in
          </button>
        </p>
      </form>
    </div>
  );
}
