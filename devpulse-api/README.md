# DevPulse API — Backend

The complete backend for **DevPulse**, an AI-powered project & task
management platform. Task 4 (capstone) of the Innovation Hacks
Full Stack Development Internship, building on Tasks 2 and 3.

Pairs with the frontend repo: `devpulse-app`.

## Features

- **Authentication**: register, login (JWT tokens), protected routes, ownership-based authorization (only a project's owner can edit/delete it)
- **Projects**: full CRUD
- **Tasks**: full CRUD, dedicated status-change endpoint, filtering by status/project
- **AI features** (via Groq's Llama 3.3 70B):
  - `POST /api/ai/generate-description` — writes a project description from just a name
  - `POST /api/ai/suggest-tasks` — suggests a 5-task starter breakdown for a project
- **Real database** (SQLite by default, PostgreSQL-ready) via SQLAlchemy
- Centralized error handling, environment-variable configuration, CORS

## Tech Stack

Python 3 · Flask · SQLAlchemy · PyJWT · Flask-CORS · Groq API

## Installation & Running Locally

```bash
git clone <your-repo-url>
cd devpulse-api
python3 -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python run.py
```

Server runs at `http://127.0.0.1:5000`.

To enable the AI features, get a free key at
[console.groq.com](https://console.groq.com) and set `GROQ_API_KEY`
in your `.env`. Without a key, those two endpoints return a clear
`503` error instead of crashing — everything else works normally.

## API Reference

### Auth

| Method | Endpoint | Auth? | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | `{name, email, password}` → `{token, user}` |
| POST | `/api/auth/login` | No | `{email, password}` → `{token, user}` |
| GET | `/api/auth/me` | Yes | Returns the logged-in user |

All other routes below require `Authorization: Bearer <token>`.

### Projects

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/projects` | Create (owner = you, automatically) |
| GET | `/api/projects` | List all |
| GET | `/api/projects/<id>` | One project + task_count/tasks_done |
| PUT | `/api/projects/<id>` | Edit (owner only — 403 otherwise) |
| DELETE | `/api/projects/<id>` | Delete + cascades its tasks (owner only) |

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/tasks` | Create (`title`, `project_id` required) |
| GET | `/api/tasks` | List, supports `?status=` and `?project_id=` |
| GET/PUT/DELETE | `/api/tasks/<id>` | Get / edit / delete |
| PATCH | `/api/tasks/<id>/status` | Change only the status |

### AI

| Method | Endpoint | Body | Returns |
|---|---|---|---|
| POST | `/api/ai/generate-description` | `{name}` | `{description}` |
| POST | `/api/ai/suggest-tasks` | `{name, description}` | `{suggestions: [...]}` |

### Users

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | List (used to populate assignee pickers) |

## Environment Variables

| Variable | Purpose |
|---|---|
| `SECRET_KEY` | Flask secret key |
| `JWT_SECRET` | Signs authentication tokens — must be secret and random in production |
| `GROQ_API_KEY` | Enables the AI endpoints |
| `ALLOWED_ORIGIN` | Which frontend URL may call this API from a browser (CORS) |
| `DATABASE_URL` | Optional — unset uses local SQLite |
| `PORT` | Server port |

## Testing performed before delivery

- Full auth flow: register, login (correct + wrong password), expired/garbage token rejection
- Ownership authorization: a second user was blocked (403) from deleting another user's project
- Cascade delete: deleting a project removed its tasks (confirmed via 404 on the task afterward)
- AI endpoints tested with a mocked Groq response (payload shape, auth header, response parsing) since this environment can't reach the public internet
- Ran the **exact fetch calls** the React frontend makes (same paths, same payload shapes) against a live server to confirm the contract matches

## Deployment

Recommended: [Render](https://render.com) or [Railway](https://railway.app).
Set the environment variables above in your hosting dashboard — never
commit `.env` to GitHub (it's already git-ignored).
