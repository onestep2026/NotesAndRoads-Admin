import { Injectable, signal } from '@angular/core';
import { ADMIN_NAV_ITEMS, AdminNavItem, AdminRole, extractAdminRoles, hasAnyRole, preferredAdminRoute } from './admin-roles';

const BASE_URL_KEY = 'nr_admin_base_url';
const TOKEN_KEY = 'nr_admin_token';
const EMAIL_KEY = 'nr_admin_email';

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function browserStorage(): StorageLike | null {
  const candidate = globalThis.localStorage;
  if (
    candidate &&
    typeof candidate.getItem === 'function' &&
    typeof candidate.setItem === 'function' &&
    typeof candidate.removeItem === 'function'
  ) {
    return candidate;
  }
  return null;
}

function readStoredValue(key: string): string {
  return browserStorage()?.getItem(key) || '';
}

@Injectable({ providedIn: 'root' })
export class AdminConfigStore {
  readonly baseUrl = signal<string>(readStoredValue(BASE_URL_KEY) || 'http://106.15.42.189');
  readonly token = signal<string>(readStoredValue(TOKEN_KEY));
  readonly email = signal<string>(readStoredValue(EMAIL_KEY));
  readonly roles = signal<AdminRole[]>(extractAdminRoles(readStoredValue(TOKEN_KEY)));

  setBaseUrl(value: string): void {
    const normalized = value.trim().replace(/\/+$/, '');
    this.baseUrl.set(normalized);
    browserStorage()?.setItem(BASE_URL_KEY, normalized);
  }

  setToken(value: string): void {
    const normalized = value.trim();
    this.token.set(normalized);
    this.roles.set(extractAdminRoles(normalized));
    browserStorage()?.setItem(TOKEN_KEY, normalized);
  }

  setEmail(value: string): void {
    const normalized = value.trim();
    this.email.set(normalized);
    browserStorage()?.setItem(EMAIL_KEY, normalized);
  }

  clearToken(): void {
    this.token.set('');
    this.email.set('');
    this.roles.set([]);
    browserStorage()?.removeItem(TOKEN_KEY);
    browserStorage()?.removeItem(EMAIL_KEY);
  }

  hasAnyRole(requiredRoles: readonly AdminRole[]): boolean {
    return hasAnyRole(this.roles(), requiredRoles);
  }

  preferredRoute(): string {
    return preferredAdminRoute(this.roles());
  }

  visibleNavItems(): readonly AdminNavItem[] {
    return ADMIN_NAV_ITEMS.filter((item) => this.hasAnyRole(item.requiredRoles));
  }
}
