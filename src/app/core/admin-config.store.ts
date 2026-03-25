import { Injectable, signal } from '@angular/core';

const BASE_URL_KEY = 'nr_admin_base_url';
const TOKEN_KEY = 'nr_admin_token';

@Injectable({ providedIn: 'root' })
export class AdminConfigStore {
  readonly baseUrl = signal<string>(localStorage.getItem(BASE_URL_KEY) || 'http://106.15.42.189');
  readonly token = signal<string>(localStorage.getItem(TOKEN_KEY) || '');

  setBaseUrl(value: string): void {
    const normalized = value.trim().replace(/\/+$/, '');
    this.baseUrl.set(normalized);
    localStorage.setItem(BASE_URL_KEY, normalized);
  }

  setToken(value: string): void {
    const normalized = value.trim();
    this.token.set(normalized);
    localStorage.setItem(TOKEN_KEY, normalized);
  }

  clearToken(): void {
    this.token.set('');
    localStorage.removeItem(TOKEN_KEY);
  }
}
