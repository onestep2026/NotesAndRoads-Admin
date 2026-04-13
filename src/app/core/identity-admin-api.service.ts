import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminRole } from './admin-roles';
import { AdminConfigStore } from './admin-config.store';

export interface OperatorResp {
  id: number;
  publicUserId: string;
  email: string;
  displayName: string;
  homeRegion: 'CN' | 'US';
  emailVerified: boolean;
  status: 'ACTIVE' | 'DISABLED';
  roles: AdminRole[];
  createdAt?: string;
  disabledAt?: string | null;
}

export interface CreateOperatorReq {
  email: string;
  displayName?: string;
  homeRegion?: 'CN' | 'US';
  temporaryPassword?: string;
  roles: AdminRole[];
}

export interface CreateOperatorResp {
  operator: OperatorResp;
  temporaryPassword: string;
}

export interface ResetOperatorPasswordResp {
  userId: number;
  temporaryPassword: string;
}

@Injectable({ providedIn: 'root' })
export class IdentityAdminApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly config: AdminConfigStore
  ) {}

  listOperators(): Observable<OperatorResp[]> {
    return this.http.get<OperatorResp[]>(this.url('/api/v1/admin/identity/operators'), {
      headers: this.headers()
    });
  }

  createOperator(payload: CreateOperatorReq): Observable<CreateOperatorResp> {
    return this.http.post<CreateOperatorResp>(
      this.url('/api/v1/admin/identity/operators'),
      {
        email: payload.email.trim(),
        displayName: payload.displayName?.trim() || null,
        homeRegion: payload.homeRegion || 'CN',
        temporaryPassword: payload.temporaryPassword?.trim() || null,
        roles: payload.roles
      },
      { headers: this.headers() }
    );
  }

  updateRoles(userId: number, roles: AdminRole[]): Observable<OperatorResp> {
    return this.http.put<OperatorResp>(
      this.url(`/api/v1/admin/identity/operators/${userId}/roles`),
      { roles },
      { headers: this.headers() }
    );
  }

  resetPassword(userId: number): Observable<ResetOperatorPasswordResp> {
    return this.http.post<ResetOperatorPasswordResp>(
      this.url(`/api/v1/admin/identity/operators/${userId}/reset-password`),
      {},
      { headers: this.headers() }
    );
  }

  disableOperator(userId: number): Observable<OperatorResp> {
    return this.http.post<OperatorResp>(
      this.url(`/api/v1/admin/identity/operators/${userId}/disable`),
      {},
      { headers: this.headers() }
    );
  }

  private headers(): HttpHeaders {
    const token = this.config.token();
    if (!token) {
      return new HttpHeaders();
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  private url(path: string): string {
    return `${this.config.baseUrl()}${path}`;
  }
}
