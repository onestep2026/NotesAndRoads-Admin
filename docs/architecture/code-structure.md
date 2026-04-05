# Admin Code Structure

Last updated: 2026-04-05

## Purpose

Guide for where code lives and where new code should go in the admin console.

---

## Top-Level Layout

```
src/app/
├── core/           # Shared infrastructure (auth, config, API)
├── components/     # Reusable UI components
├── pages/          # Page components (one per route)
├── app.ts          # Root component with navigation
├── app.routes.ts   # Route definitions with auth guards
└── app.config.ts   # DI providers (HTTP, Router, Interceptors)
```

---

## Core Layer (`core/`)

Contains all shared infrastructure. Currently 4 files:

| File | Role |
|------|------|
| `admin-config.store.ts` | Signal-based injectable store. Manages `baseUrl` and `token` with localStorage persistence. All API calls read config from here. |
| `governance-api.service.ts` | Single API client for all backend calls (~410 LOC). Contains typed interfaces for all request/response models. |
| `admin-auth.guard.ts` | Route guard that checks `token` existence. Redirects to `/login` if no token. |
| `admin-auth.interceptor.ts` | HTTP interceptor that injects `Authorization: Bearer <token>` header. On 401 response, clears token and redirects to `/login`. |

### Key Types (defined in `governance-api.service.ts`)

- `FeedbackResp`, `FeedbackStatus` (OPEN, IN_REVIEW, CLOSED)
- `ReportResp`, `ReportStatus` (OPEN, IN_REVIEW, RESOLVED_REJECTED, RESOLVED_CONFIRMED)
- `EnforcementResp`, `EnforcementType` (SHARE_BANNED, LOGIN_BANNED, PERMANENT_BANNED)
- `ModerationShareResp`, `ModerationStatus` (PENDING, APPROVED, REJECTED)
- `BookSubmissionResp`, `BookSubmissionStatus` (PENDING, APPROVED, REJECTED)
- `PageResp<T>` — paginated response wrapper
- `AdminContentActionResp` — content action result (takedown/restore/delete)

---

## Pages Layer (`pages/`)

One standalone component per route. Each page imports its own dependencies.

| Page | Route | Purpose |
|------|-------|---------|
| `login-page` | `/login` | Admin login with base URL config |
| `feedbacks-page` | `/feedback` | Feedback list with status filter |
| `feedback-detail-page` | `/feedback/:id` | Single feedback review and status update |
| `reports-page` | `/reports` | Report list with status filter |
| `report-detail-page` | `/reports/:id` | Single report review and status update |
| `enforcements-page` | `/enforcements` | Enforcement list + create + lift |
| `moderation-shares-page` | `/moderation-shares` | Share moderation queue (approve/reject) |
| `book-submissions-page` | `/book-submissions` | Book catalog review + search index rebuild |

### Common Page Patterns

**List pages** follow this structure:
1. Status filter dropdown at top
2. Paginated table/list of items
3. Status badge with color coding
4. Click row to navigate to detail (if detail page exists)

**Detail pages** follow this structure:
1. Load item by ID from route param
2. Display all fields in a read-only layout
3. Action buttons for status transitions
4. Review note input for status changes

---

## Components Layer (`components/`)

Reusable UI components shared across pages.

Currently: `admin-settings.component` — base URL and auth config UI.

---

## Routes (`app.routes.ts`)

- `/login` — no guard (public)
- All other routes — protected by `adminAuthGuard`
- Root `/` redirects to `/feedback`

---

## Adding New Features

### New admin page

1. Create `pages/{name}-page.component.ts` (+ `.html`, `.scss`)
2. Use standalone component pattern (import CommonModule, FormsModule, RouterModule as needed)
3. Inject `GovernanceApiService` for API calls
4. Add route in `app.routes.ts` with `canActivate: [adminAuthGuard]`
5. Add nav link in `app.ts` template

### New API endpoint

1. Add TypeScript interface for request/response in `governance-api.service.ts`
2. Add method to `GovernanceApiService` class
3. Use `this.url(path)` for URL construction and `this.headers()` for auth headers

### New reusable component

1. Create in `components/`
2. Use standalone component pattern
3. Import in consuming pages
