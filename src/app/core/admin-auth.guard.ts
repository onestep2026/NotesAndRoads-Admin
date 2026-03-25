import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminConfigStore } from './admin-config.store';

export const adminAuthGuard: CanActivateFn = () => {
  const config = inject(AdminConfigStore);
  const router = inject(Router);
  return config.token() ? true : router.parseUrl('/login');
};
