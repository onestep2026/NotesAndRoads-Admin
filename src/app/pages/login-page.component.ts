import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, timeout } from 'rxjs/operators';
import { AdminConfigStore } from '../core/admin-config.store';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {
  baseUrl = '';
  email = '';
  password = '';
  loggingIn = false;
  error = '';

  constructor(
    private readonly config: AdminConfigStore,
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.baseUrl = this.config.baseUrl();
    if (this.config.token()) {
      void this.router.navigateByUrl('/reports');
    }
  }

  login(): void {
    const normalizedBaseUrl = this.baseUrl.trim().replace(/\/+$/, '');
    if (!normalizedBaseUrl || !this.email.trim() || !this.password) {
      this.error = 'Base URL, email, and password are required.';
      return;
    }

    this.loggingIn = true;
    this.error = '';
    this.config.setBaseUrl(normalizedBaseUrl);

    this.http
      .post<{ accessToken: string }>(`${normalizedBaseUrl}/api/v1/auth/login`, {
        email: this.email.trim(),
        password: this.password
      })
      .pipe(
        timeout(15000),
        finalize(() => {
          this.loggingIn = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (resp) => {
          const token = resp.accessToken || '';
          if (!token) {
            this.error = 'Login succeeded but no access token was returned.';
            return;
          }
          this.config.setToken(token);
          void this.router.navigateByUrl('/reports');
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Login failed.';
          this.cdr.detectChanges();
        }
      });
  }
}
