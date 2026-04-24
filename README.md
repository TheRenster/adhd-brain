# ADHD Brain

ADHD-friendly planning workspace with inbox capture, calendar link, notes export, kanban, and persistent state.

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:3000`.

## Deploy (Render)

1. Push this repo to GitHub.
2. In Render, click **New +** -> **Blueprint**.
3. Select this repository.
4. Render reads `render.yaml` and deploys automatically.

## Data persistence

- App state syncs to `/api/state`.
- Server stores state in `.nte-data/state.json`.
- For production-grade persistence, swap this file store for Postgres/Supabase.
