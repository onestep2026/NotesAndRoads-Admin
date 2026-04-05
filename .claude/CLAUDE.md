# NotesAndRoads Admin — Claude Instructions

## Read First

This is the admin console for governance and moderation workflows. Before working here, understand what the backend provides:

1. `../NotesAndRoads-Microservices/docs/architecture/system-overview.md` — backend services overview
2. `../NotesAndRoads-Microservices/platform/api-contracts/openapi/governance-service.json` — governance API spec
3. `docs/api/backend-contract-map.md` — which backend endpoints this app uses (once created)

---

## Mission

Help implement and maintain the NotesAndRoads admin console — a web-based tool for content moderation, user governance, and book catalog management.

---

## Tech Stack

- **Framework:** Angular 21 (standalone components, no NgModules)
- **Language:** TypeScript 5.9 (strict mode)
- **Styling:** SCSS (component-scoped)
- **State:** Signal-based (`AdminConfigStore`)
- **HTTP:** Angular HttpClient with interceptor
- **Reactivity:** RxJS 7.8
- **Build:** Angular CLI with Vite
- **Testing:** Vitest + jsdom

---

## Code Structure

```
src/app/
├── core/                              # Shared infrastructure (5 files)
│   ├── admin-config.store.ts          # Signal-based store: baseUrl + auth token (localStorage-backed)
│   ├── governance-api.service.ts      # API client for all backend calls (~410 LOC)
│   ├── admin-auth.guard.ts            # Route guard: checks token existence
│   └── admin-auth.interceptor.ts      # HTTP interceptor: injects Bearer token, handles 401 → logout
├── components/                        # Reusable UI components
│   └── admin-settings.component.*     # Base URL and auth config UI
├── pages/                             # Page components (one per route)
│   ├── login-page.component.*         # Admin login
│   ├── feedbacks-page.component.*     # Feedback list with status filter
│   ├── feedback-detail-page.component.*  # Single feedback review
│   ├── reports-page.component.*       # Report list with status filter
│   ├── report-detail-page.component.* # Single report review
│   ├── enforcements-page.component.*  # Enforcement list + create/lift
│   ├── moderation-shares-page.component.*  # Share moderation queue (approve/reject)
│   └── book-submissions-page.component.*   # Book catalog review queue
├── app.ts                             # Root component with nav
├── app.routes.ts                      # Route definitions
└── app.config.ts                      # DI providers (HTTP, Router, Interceptors)
```

### Where to put new code

| What | Where |
|------|-------|
| New API call | `core/governance-api.service.ts` — add method + interface |
| New page | `pages/{name}-page.component.ts` + register route in `app.routes.ts` |
| Shared component | `components/` |
| New route guard or interceptor | `core/` |

---

## Key Patterns

- **All API calls go through `GovernanceApiService`** — it reads `baseUrl` and `token` from `AdminConfigStore`.
- **Auth interceptor** automatically injects `Bearer` token and redirects to `/login` on 401.
- **AdminConfigStore** uses Angular Signals and persists to `localStorage`. Base URL is configurable at runtime (not build-time).
- **Standalone components** — each page imports its dependencies directly (CommonModule, FormsModule, RouterModule, etc.).
- **List pages** follow a pattern: status filter dropdown + paginated table + status badge styling.
- **Detail pages** follow a pattern: load item by ID → display fields → action buttons (status update, review).

---

## Key Constraints

1. **Admin-only APIs** — this app uses `/api/v1/admin/governance/**` and `/api/v1/admin/book-catalog/**`. These are not the same endpoints as the mobile apps.
2. **Auth via identity-service** — login uses `POST /api/v1/auth/login` (same as mobile), but the logged-in user must be an admin.
3. **No build-time environment config** — base URL is set at runtime via the settings UI and stored in localStorage.
4. **SPA routing** — the server must route all requests to `index.html` for client-side routing to work.

---

## Backend API Dependencies

### Authentication (identity-service)
- `POST /api/v1/auth/login` — admin login

### Governance (governance-service)
- `GET/PATCH /api/v1/admin/governance/feedback/{id}` — feedback list and status updates
- `GET/PATCH /api/v1/admin/governance/reports/{id}` — report list and status updates
- `GET/POST /api/v1/admin/governance/enforcements` — enforcement CRUD
- `POST /api/v1/admin/governance/enforcements/{id}/lift` — lift enforcement
- `GET /api/v1/admin/governance/moderation/shares` — moderation queue
- `POST /api/v1/admin/governance/moderation/shares/{id}/approve|reject` — moderation actions
- `POST /api/v1/admin/governance/content/takedown|restore|delete` — content actions

### Book Catalog (content-service)
- `GET /api/v1/admin/book-catalog/submissions` — submission list
- `POST /api/v1/admin/book-catalog/submissions/{id}/review` — review submission
- `GET /api/v1/admin/book-catalog/author-candidates` — author search
- `POST /api/v1/admin/book-catalog/search-index/rebuild` — rebuild search index

---

## Feature Specs

When implementing a new feature from a cross-repo feature spec:
1. Read `../NotesAndRoads-Microservices/docs/features/{feature-name}.md` for the requirement
2. **Check that the API Contract section is filled in** — do not start if it's blank (backend hasn't finished yet)
3. Implement the Admin changes (page component, API service methods)
4. Update `docs/api/backend-contract-map.md` if new endpoints were added

See `../NotesAndRoads-Microservices/docs/features/WORKFLOW.md` for the full cross-repo workflow.

---

## Local Development

```bash
npm install
npm start          # Dev server on http://localhost:4200
npm test           # Vitest
npm run build      # Production build → dist/NotesAndRoads-Admin/
```

The backend base URL is configured at runtime via the settings page (gear icon) or login page. For local dev, typically point to `http://localhost:9999` (nginx) or directly to service ports.
