import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { adminAuthGuard } from './admin-auth.guard';
import { AdminConfigStore } from './admin-config.store';
import { CATALOG_ROLES, GOVERNANCE_ROLES } from './admin-roles';

describe('adminAuthGuard', () => {
  function setup(token: string, hasAnyRole = () => true) {
    const mockConfig = { token: () => token, hasAnyRole };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AdminConfigStore, useValue: mockConfig }
      ]
    });
  }

  it('should allow navigation when token is present', () => {
    setup('valid-token');
    const result = TestBed.runInInjectionContext(() =>
      adminAuthGuard({ data: { requiredRoles: GOVERNANCE_ROLES } } as any, {} as any)
    );
    expect(result).toBe(true);
  });

  it('should redirect to /login when token is absent', () => {
    setup('');
    const router = TestBed.inject(Router);
    const result = TestBed.runInInjectionContext(() =>
      adminAuthGuard({} as any, {} as any)
    );
    expect(result).toEqual(router.parseUrl('/login'));
  });

  it('should redirect to /unauthorized when token is present but required role is missing', () => {
    setup('valid-token', () => false);
    const router = TestBed.inject(Router);
    const result = TestBed.runInInjectionContext(() =>
      adminAuthGuard({ data: { requiredRoles: CATALOG_ROLES } } as any, {} as any)
    );
    expect(result).toEqual(router.parseUrl('/unauthorized'));
  });
});
