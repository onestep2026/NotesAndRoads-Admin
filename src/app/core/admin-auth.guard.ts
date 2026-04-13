import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminConfigStore } from './admin-config.store';
import { AdminRole } from './admin-roles';

export const adminAuthGuard: CanActivateFn = (route) => {
  const config = inject(AdminConfigStore);
  const router = inject(Router);
  if (!config.token()) {
    return router.parseUrl('/login');
  }

  const requiredRoles = (route.data?.['requiredRoles'] as readonly AdminRole[] | undefined) ?? [];
  if (requiredRoles.length === 0 || config.hasAnyRole(requiredRoles)) {
    return true;
  }

  return router.parseUrl('/unauthorized');
};
