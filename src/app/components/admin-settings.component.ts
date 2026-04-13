import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminConfigStore } from '../core/admin-config.store';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-settings.component.html',
  styleUrl: './admin-settings.component.scss'
})
export class AdminSettingsComponent {
  baseUrl = '';
  isOpen = false;

  constructor(
    private readonly config: AdminConfigStore,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.baseUrl = this.config.baseUrl();
  }

  get isLoggedIn(): boolean {
    return !!this.config.token();
  }

  get currentEmail(): string {
    return this.config.email() || 'Unknown';
  }

  get currentEnvironment(): string {
    const raw = this.config.baseUrl();
    if (!raw) return 'Unknown';
    try {
      return new URL(raw).host;
    } catch {
      return raw;
    }
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
    this.cdr.detectChanges();
  }

  save(): void {
    this.config.setBaseUrl(this.baseUrl);
    this.isOpen = false;
    window.location.reload();
  }

  logout(): void {
    this.config.clearToken();
    void this.router.navigateByUrl('/login');
    this.isOpen = false;
    this.cdr.detectChanges();
  }
}
