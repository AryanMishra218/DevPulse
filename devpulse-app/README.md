# DevPulse — Frontend

The complete React frontend for **DevPulse**, an AI-powered project &
task management platform. Task 4 (capstone) of the Innovation Hacks
Full Stack Development Internship, building on Task 1.

Pairs with the backend repo: `devpulse-api` — **start that first.**

## Features

- **Authentication**: register / login screens, session persisted via JWT, auto-verified on reload, logout
- **Dashboard**: live stats, 12-week activity heatmap, search, status filter, sort by due date/priority
- **Project management**: create, edit, delete (with confirmation), each showing live progress
- **Task management**: create (assign to a project, set priority/due date), click-to-cycle status, delete via project cascade
- **Two AI features**:
  - ✨ Generate a project description from just its name
  - ✨ Suggest 5 starter tasks for a project, added with one click each
- Light/dark theme toggle (persisted)
- Fully responsive

## Tech Stack

React 19 (Vite) · Plain CSS (custom design system, no framework)

## Installation & Running Locally

**The backend must be running first** (see `devpulse-api`'s README).

```bash
git clone <your-repo-url>
cd devpulse-app
npm install
cp .env.example .env
npm run dev
```

Open the printed URL (usually `http://localhost:5173`). You'll land
on the Sign Up screen — create an account, and you're in.

## Project Structure

```
devpulse-app/
├── src/
│   ├── api.js               # ALL backend communication goes through here
│   ├── components/
│   │   ├── Sidebar.jsx, TopBar.jsx, ThemeToggle.jsx
│   │   ├── ProjectCard.jsx   # edit/delete + "Suggest tasks with AI"
│   │   ├── TaskCard.jsx      # click-to-cycle status
│   │   ├── NewProjectModal.jsx  # create AND edit (+ "Generate description with AI")
│   │   ├── NewTaskModal.jsx
│   │   ├── ActivityHeatmap.jsx, ProgressBar.jsx, StatusPill.jsx
│   │   └── EmptyState.jsx, LoadingSkeleton.jsx
│   ├── pages/
│   │   ├── Login.jsx, Register.jsx
│   │   ├── Dashboard.jsx     # fetches real data, owns all CRUD handlers
│   │   └── Profile.jsx
│   ├── App.jsx               # auth state, theme, page routing
│   ├── index.css, layout.css
│   └── main.jsx
```

## How authentication works here

1. On login/register, the backend returns a JWT — stored in `localStorage`.
2. `src/api.js` attaches it as `Authorization: Bearer <token>` on every request automatically.
3. On page reload, `App.jsx` calls `/api/auth/me` to verify the saved token is still valid before showing the dashboard (an expired token bounces you back to login).

## Environment Variables

| Variable | Purpose | Default |
|---|---|---|
| `VITE_API_URL` | Backend base URL | `http://localhost:5000` |

## Testing performed before delivery

- `npm run build` succeeds with no errors
- Every API call this app makes (register, login, create/edit/delete project, create task, toggle status, AI suggestions) was run against a **live backend** using the exact same request paths and payload shapes as `api.js` — see the backend README's testing section

## Deployment

Recommended: [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
Set `VITE_API_URL` to your deployed backend's URL in your hosting
dashboard's environment variable settings.
