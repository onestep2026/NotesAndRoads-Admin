# Admin Backend Contract Map

Last updated: 2026-04-05

## Purpose

This file lists all backend API endpoints the admin console depends on.

Use it before changing:
- API service methods
- backend endpoint paths or payloads
- admin permission requirements

## Core Rule

The admin console uses **admin-only** endpoints. These are separate from the public app-facing APIs used by the mobile apps.

The only shared endpoint is login (`POST /api/v1/auth/login`).

## Primary API Sources

- [governance-service.json](../../NotesAndRoads-Microservices/platform/api-contracts/openapi/governance-service.json)
- [content-service.json](../../NotesAndRoads-Microservices/platform/api-contracts/openapi/content-service.json) (for book catalog admin APIs)
- [identity-service.json](../../NotesAndRoads-Microservices/platform/api-contracts/openapi/identity-service.json) (for auth login)

## Endpoint Inventory

### Authentication (identity-service)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/v1/auth/login` | Admin login (returns accessToken) |

### Feedback (governance-service)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/admin/governance/feedback` | List feedback (filterable by status) |
| GET | `/api/v1/admin/governance/feedback/:id` | Get single feedback |
| PATCH | `/api/v1/admin/governance/feedback/:id/status` | Update feedback status + review note |

Statuses: OPEN → IN_REVIEW → CLOSED

### Reports (governance-service)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/admin/governance/reports` | List reports (filterable by status) |
| GET | `/api/v1/admin/governance/reports/:id` | Get single report |
| PATCH | `/api/v1/admin/governance/reports/:id/status` | Update report status + review note |

Statuses: OPEN → IN_REVIEW → RESOLVED_REJECTED / RESOLVED_CONFIRMED

### Enforcements (governance-service)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/admin/governance/enforcements` | List enforcements (filterable by status, targetUserId) |
| POST | `/api/v1/admin/governance/enforcements` | Create enforcement |
| POST | `/api/v1/admin/governance/enforcements/:id/lift` | Lift enforcement |

Types: SHARE_BANNED, LOGIN_BANNED, PERMANENT_BANNED
Statuses: ACTIVE, LIFTED, EXPIRED

### Moderation Shares (governance-service)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/admin/governance/moderation/shares` | List shares pending moderation |
| POST | `/api/v1/admin/governance/moderation/shares/:id/approve` | Approve share |
| POST | `/api/v1/admin/governance/moderation/shares/:id/reject` | Reject share |

### Content Actions (governance-service)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/v1/admin/governance/content/takedown` | Take down content |
| POST | `/api/v1/admin/governance/content/restore` | Restore taken-down content |
| POST | `/api/v1/admin/governance/content/delete` | Permanently delete content |

### Book Catalog (content-service)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/admin/book-catalog/submissions` | List book submissions |
| POST | `/api/v1/admin/book-catalog/submissions/:id/review` | Review submission (approve/reject + author mapping) |
| GET | `/api/v1/admin/book-catalog/author-candidates` | Search for existing authors |
| POST | `/api/v1/admin/book-catalog/search-index/rebuild` | Rebuild book catalog search index |

## Service Ownership

| Endpoint Group | Backend Service | Port |
|---------------|----------------|------|
| Auth login | identity-service | 8084 |
| Feedback, Reports, Enforcements, Moderation, Content Actions | governance-service | 8083 |
| Book Catalog | content-service | 8085 |

## What This App Does Not Use

- Public app-facing content APIs (`/api/v1/books/**`, `/api/v1/quotes/**`, etc.)
- Internal APIs (`/internal/**`)
- Social APIs (`/api/v1/friends/**`, `/api/v1/gallery/**`)
