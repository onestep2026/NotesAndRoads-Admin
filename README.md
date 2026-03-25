# Notes & Roads Admin

Angular 21 admin console for moderation and governance workflows.

## What It Covers

- Feedback queue and feedback detail review
- Report queue and report detail review
- Moderation share review
- Enforcement creation, filtering, and lifting
- Book submission review
- Book catalog search index rebuild

## Tech Stack

- Angular 21
- TypeScript 5.9
- RxJS 7.8
- SCSS
- Angular standalone components and router

## Requirements

- Node.js 22+ recommended
- npm 10+
- A Notes & Roads backend that exposes the admin APIs used by this UI

## Install And Run

```bash
npm install
npm start
```

Open the app at `http://localhost:4200`.

## Login Flow

1. Open `/login`
2. Set the backend base URL
3. Enter the admin email and password
4. Click `Login`

The app calls `POST /api/v1/auth/login`, stores the returned access token in `localStorage`, and reuses it for subsequent requests.

If the token is invalid or expired, the app clears it and redirects back to `/login`.

## Default Backend Base URL

The login page defaults to:

```text
http://106.15.42.189
```

You can change it in the UI before logging in. The chosen base URL and token are persisted in browser `localStorage`.

## Routes

- `/login`: admin sign-in
- `/feedback`: feedback list
- `/feedback/:id`: feedback detail and status update
- `/reports`: report list
- `/reports/:id`: report detail and status update
- `/moderation-shares`: moderation share review
- `/enforcements`: enforcement list and lift action
- `/book-submissions`: book submission review and search index rebuild

The root path redirects to `/feedback`.

## Backend Contract

This UI expects these admin endpoints to be available:

- `POST /api/v1/auth/login`
- `GET /api/v1/admin/governance/feedback`
- `GET /api/v1/admin/governance/feedback/:id`
- `PATCH /api/v1/admin/governance/feedback/:id/status`
- `GET /api/v1/admin/governance/reports`
- `GET /api/v1/admin/governance/reports/:id`
- `PATCH /api/v1/admin/governance/reports/:id/status`
- `GET /api/v1/admin/governance/enforcements`
- `POST /api/v1/admin/governance/enforcements`
- `POST /api/v1/admin/governance/enforcements/:id/lift`
- `GET /api/v1/admin/governance/moderation/shares`
- `POST /api/v1/admin/governance/moderation/shares/:id/approve`
- `POST /api/v1/admin/governance/moderation/shares/:id/reject`
- `GET /api/v1/admin/book-catalog/submissions`
- `POST /api/v1/admin/book-catalog/submissions/:id/review`
- `GET /api/v1/admin/book-catalog/author-candidates`
- `POST /api/v1/admin/book-catalog/search-index/rebuild`
- `POST /api/v1/admin/governance/content/takedown`
- `POST /api/v1/admin/governance/content/restore`
- `POST /api/v1/admin/governance/content/delete`

## API Overview

### Authentication

- `POST /api/v1/auth/login` returns an `accessToken`
- The token is stored in browser `localStorage`
- The token is attached to requests as `Authorization: Bearer <token>`

### Governance And Moderation

- Feedback endpoints list and update feedback review status
- Report endpoints list and update report review status
- Enforcement endpoints list, create, and lift user enforcement actions
- Moderation share endpoints list items and approve or reject them
- Content endpoints perform takedown, restore, and delete actions

### Book Catalog

- Book submission endpoints list submissions and submit review decisions
- Author candidate search helps map a submission to an existing author
- Search index rebuild runs a backend rebuild job for catalog search

## Environment Notes

- The backend base URL is configurable from the login page.
- Access tokens are sent as `Authorization: Bearer <token>`.
- `401` responses clear the current token and return the user to the login page.

## Build

```bash
npm run build
```

Production output is written to `dist/NotesAndRoads-Admin`.

## Test

```bash
npm test
```

## Developer Guide

This project uses Angular standalone components and the Angular router.

### Common Commands

```bash
npm install
npm start
npm run watch
npm test
npm run build
```

### Local Development Notes

- The app does not use build-time environment files.
- The backend base URL is configured in the login UI and stored in browser `localStorage`.
- Tokens are attached automatically through the HTTP interceptor.
- A `401` response clears the token and sends the user back to `/login`.

### Code Structure

- `src/app/pages/`: page-level screens
- `src/app/components/`: reusable UI components
- `src/app/core/`: authentication, config, and API service logic
- `src/styles.scss`: global styles

## Deployment

This app is built as a static Angular frontend.

### Build For Production

```bash
npm run build
```

The production bundle is written to `dist/NotesAndRoads-Admin`.

### Hosting

- Deploy the contents of `dist/NotesAndRoads-Admin` to any static hosting provider, CDN, or web server.
- Configure the hosting layer to serve `index.html` for client-side routes such as `/feedback`, `/reports`, and `/book-submissions`.
- Make sure the backend allows requests from the deployed admin origin if the API is hosted on a different domain.

### Post-Deploy Checklist

- Open `/login` and verify the backend base URL.
- Confirm `POST /api/v1/auth/login` works against the deployed backend.
- Verify at least one protected route, such as `/reports` or `/feedback`, loads after login.

## Troubleshooting

- If login fails immediately, confirm the backend base URL is correct and reachable from the browser.
- If requests are redirected back to `/login`, the stored token is missing, expired, or rejected by the backend.
- If a route shows a blank page after refresh, make sure the hosting server is configured for SPA fallback to `index.html`.
- If CORS errors appear in the browser console, update backend CORS settings to allow the admin origin.
- If build output is missing, rerun `npm run build` and check `dist/NotesAndRoads-Admin`.
