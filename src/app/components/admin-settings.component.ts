import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

  constructor(private readonly config: AdminConfigStore) {
    this.baseUrl = this.config.baseUrl();
  }

  save(): void {
    this.config.setBaseUrl(this.baseUrl);
  }

  get isLoggedIn(): boolean {
    return !!this.config.token();
  }

  logout(): void {
    this.config.setToken('');
  }
}
