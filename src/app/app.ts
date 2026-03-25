import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AdminSettingsComponent } from './components/admin-settings.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, AdminSettingsComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  constructor(private readonly router: Router) {}

  isLoginRoute(): boolean {
    return this.router.url.startsWith('/login');
  }
}
