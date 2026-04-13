import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AdminSettingsComponent } from './components/admin-settings.component';
import { AdminConfigStore } from './core/admin-config.store';
import { AdminNavItem } from './core/admin-roles';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AdminSettingsComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  constructor(
    private readonly router: Router,
    private readonly config: AdminConfigStore
  ) {}

  isLoginRoute(): boolean {
    return this.router.url.startsWith('/login');
  }

  navItems(): readonly AdminNavItem[] {
    return this.config.visibleNavItems();
  }
}
