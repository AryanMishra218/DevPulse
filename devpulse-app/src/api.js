// Why this file exists:
// Every fetch() call in the app goes through here instead of
// being written directly in each component. That gives us ONE
// place that: knows the backend's URL, attaches the auth token,
// and turns error responses into JavaScript errors we can catch.
// If the API's base URL ever changes, we edit exactly one line.

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const TOKEN_KEY = "devpulse-token";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

// The core function everything else calls. `path` is just the
// part after the base URL, e.g. "/api/projects".
async function request(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // 204 No Content has no body to parse (used by our DELETE routes)
  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Throwing here means every caller can just use try/catch,
    // instead of checking `.ok` after every single call.
    const error = new Error(data.error || "Something went wrong.");
    error.status = response.status;
    error.details = data.details;
    throw error;
  }

  return data;
}

// ---- Auth ----
export const registerUser = (name, email, password) =>
  request("/api/auth/register", { method: "POST", body: { name, email, password } });

export const loginUser = (email, password) =>
  request("/api/auth/login", { method: "POST", body: { email, password } });

export const getMe = () => request("/api/auth/me");

// ---- Users ----
export const listUsers = () => request("/api/users");

// ---- Projects ----
export const listProjects = () => request("/api/projects");
export const getProject = (id) => request(`/api/projects/${id}`);
export const createProject = (data) => request("/api/projects", { method: "POST", body: data });
export const updateProject = (id, data) => request(`/api/projects/${id}`, { method: "PUT", body: data });
export const deleteProject = (id) => request(`/api/projects/${id}`, { method: "DELETE" });

// ---- Tasks ----
export const listTasks = () => request("/api/tasks");
export const createTask = (data) => request("/api/tasks", { method: "POST", body: data });
export const updateTask = (id, data) => request(`/api/tasks/${id}`, { method: "PUT", body: data });
export const updateTaskStatus = (id, status) =>
  request(`/api/tasks/${id}/status`, { method: "PATCH", body: { status } });
export const deleteTask = (id) => request(`/api/tasks/${id}`, { method: "DELETE" });

// ---- AI ----
export const aiGenerateDescription = (name) =>
  request("/api/ai/generate-description", { method: "POST", body: { name } });
export const aiSuggestTasks = (name, description) =>
  request("/api/ai/suggest-tasks", { method: "POST", body: { name, description } });
