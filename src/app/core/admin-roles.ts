export type AdminRole = 'SUPER_ADMIN' | 'GOVERNANCE_ADMIN' | 'CATALOG_ADMIN';

export interface AdminNavItem {
  label: string;
  path: string;
  requiredRoles: readonly AdminRole[];
}

export const ADMIN_ROLE_OPTIONS: readonly AdminRole[] = ['SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'CATALOG_ADMIN'] as const;
export const GOVERNANCE_ROLES = ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'] as const;
export const CATALOG_ROLES = ['SUPER_ADMIN', 'CATALOG_ADMIN'] as const;
export const SUPER_ADMIN_ROLES = ['SUPER_ADMIN'] as const;

export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
  { label: 'Admin Users', path: '/admin-users', requiredRoles: SUPER_ADMIN_ROLES },
  { label: 'Feedback', path: '/feedback', requiredRoles: GOVERNANCE_ROLES },
  { label: 'Reports', path: '/reports', requiredRoles: GOVERNANCE_ROLES },
  { label: 'Moderation Shares', path: '/moderation-shares', requiredRoles: GOVERNANCE_ROLES },
  { label: 'Enforcements', path: '/enforcements', requiredRoles: GOVERNANCE_ROLES },
  { label: 'Book Submissions', path: '/book-submissions', requiredRoles: CATALOG_ROLES }
];

const KNOWN_ROLES = new Set<AdminRole>(['SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'CATALOG_ADMIN']);

export function extractAdminRoles(token: string): AdminRole[] {
  const payload = decodeJwtPayload(token);
  const rawRoles = payload?.['roles'];
  if (!Array.isArray(rawRoles)) {
    return [];
  }
  return rawRoles.filter((value): value is AdminRole => typeof value === 'string' && KNOWN_ROLES.has(value as AdminRole));
}

export function preferredAdminRoute(roles: readonly AdminRole[]): string {
  if (hasAnyRole(roles, GOVERNANCE_ROLES)) {
    return '/feedback';
  }
  if (hasAnyRole(roles, CATALOG_ROLES)) {
    return '/book-submissions';
  }
  return '/unauthorized';
}

export function hasAnyRole(currentRoles: readonly AdminRole[], requiredRoles: readonly AdminRole[]): boolean {
  return requiredRoles.some((role) => currentRoles.includes(role));
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  if (!token) {
    return null;
  }

  const parts = token.split('.');
  if (parts.length < 2 || !parts[1]) {
    return null;
  }

  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}
