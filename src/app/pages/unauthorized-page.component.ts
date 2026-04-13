import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="unauthorized-card">
      <span class="eyebrow">403</span>
      <h1>Access denied</h1>
      <p>Your account is authenticated, but it does not have the required admin role for this area.</p>
      <a routerLink="/" class="primary-link">Go to available workspace</a>
    </div>
  `,
  styles: [`
    .unauthorized-card {
      max-width: 520px;
      margin: 48px auto;
      padding: 32px;
      border-radius: 24px;
      background: #fff;
      box-shadow: 0 16px 48px rgba(15, 23, 42, 0.08);
    }

    .eyebrow {
      display: inline-block;
      margin-bottom: 12px;
      color: #b45309;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    h1 {
      margin: 0 0 12px;
      font-size: 28px;
      line-height: 1.1;
    }

    p {
      margin: 0 0 20px;
      color: #475569;
      line-height: 1.6;
    }

    .primary-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 40px;
      padding: 0 16px;
      border-radius: 999px;
      background: #111827;
      color: #fff;
      text-decoration: none;
      font-weight: 600;
    }
  `]
})
export class UnauthorizedPageComponent {}
