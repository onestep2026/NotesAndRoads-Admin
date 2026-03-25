import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { adminAuthGuard } from './admin-auth.guard';
import { AdminConfigStore } from './admin-config.store';

describe('adminAuthGuard', () => {
  function setup(token: string) {
    const mockConfig = { token: () => token };
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
      adminAuthGuard({} as any, {} as any)
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
});
