# Notes & Roads Admin

Angular 21 admin console for governance operations:
- report queue and report detail review
- user enforcement creation and lifting

## Prerequisites

- Node.js LTS recommended (`22.12+` or `24+`)
- Backend running on `http://localhost:9999` (default)

## Run

```bash
npm install
npm start
```

Open `http://localhost:4200`.

## First-time setup in UI

Open `/login`:
1. Set `Backend Base URL` (e.g. `http://localhost:9999`)
2. Enter admin email/password
3. Click `Login`

After login, access token is fetched from `/api/v1/auth/login` and stored in browser `localStorage`.
No manual access-token input is required.

## Backend requirements

- Admin endpoints are protected by `app.admin.user-ids`.
- Set env var before backend start, e.g.:

```bash
APP_ADMIN_USER_IDS=1,2
```

- Login with one of these user IDs in the admin UI.

## Auth Contract Alignment

- Admin login depends on backend `POST /api/v1/auth/login`.
- Backend auth verification is code-based for registration/change-email.
- Deprecated endpoints `POST /api/v1/auth/resend-verification` and `GET /api/v1/auth/verify-email` are removed.

## Available pages

- `/login`: admin sign-in page
- `/reports`: report queue list + filter
- `/reports/:id`: report detail, status update, enforcement apply
- `/enforcements`: enforcement list + filter + lift action

## Build

```bash
npm run build
```

Output folder:
`dist/NotesAndRoads-Admin`
