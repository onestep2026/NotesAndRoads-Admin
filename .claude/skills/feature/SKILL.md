---
description: "Implement a feature from a feature spec (Admin Phase 2): verify API contract is ready, then implement admin console changes."
argument-hint: "[feature-name]"
---

# Skill: feature

Implement a cross-repo feature from a feature spec. This is the **Admin (Phase 2)** version — it consumes the API contract defined by the backend and implements the admin console changes.

## Usage

```
/feature {feature-name}
```

The argument is the filename (without `.md`) in `../NotesAndRoads-Microservices/docs/features/`.

## Steps

### 1. Read the feature spec

Read `../NotesAndRoads-Microservices/docs/features/{feature-name}.md`.

If it doesn't exist, tell the user and stop.

### 2. Check if Admin is impacted

Look at the **Impacted Repos** table and **Per-Repo Admin notes**.

**If Admin is listed as N/A:** Tell the user this feature has no Admin impact. Stop.

**Otherwise:** Proceed to step 3.

### 3. Verify API Contract is ready

Check the **API Contract** section of the feature spec.

**If it is blank or incomplete:** Tell the user that backend (Phase 1) has not finished yet. Do not proceed.

**If it is filled in:** Proceed to step 4.

### 4. Read Admin context

Read these before implementing:
- `.claude/CLAUDE.md` — code structure and patterns
- `docs/architecture/code-structure.md` — where code goes
- `docs/api/backend-contract-map.md` — current endpoint inventory
- `src/app/core/governance-api.service.ts` — existing API methods and types
- The Per-Repo Admin notes in the feature spec

### 5. Plan the implementation

Before writing code, outline:
- **API types** — new interfaces/types needed in `governance-api.service.ts`
- **API methods** — new methods in `GovernanceApiService`
- **Page** — new page component or changes to existing page
- **Route** — new route in `app.routes.ts`
- **Nav** — new nav link in `app.ts`

Present this plan to the user and **wait for approval** before implementing.

### 6. Implement

After approval:
1. Add TypeScript interfaces to `core/governance-api.service.ts`
2. Add API methods to `GovernanceApiService`
3. Create page component in `pages/` (standalone component pattern)
4. Add route in `app.routes.ts` with `canActivate: [adminAuthGuard]`
5. Add nav link in `app.ts` template
6. Add component-level SCSS styling
7. Write tests if applicable

### 7. Update documentation

- Update `docs/api/backend-contract-map.md` with new endpoints
- Check the Phase 2 Admin box in the feature spec's Status section

## Rules

- Do not start if the API Contract section is blank
- Do not modify files outside `NotesAndRoads-Admin/` (except checking the status box in the feature spec)
- All API calls go through `GovernanceApiService`
- Use standalone component pattern (no NgModules)
- Follow list/detail page patterns established by existing pages
- Protect new routes with `adminAuthGuard`
