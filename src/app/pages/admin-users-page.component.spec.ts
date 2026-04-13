import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AdminUsersPageComponent } from './admin-users-page.component';
import { IdentityAdminApiService, OperatorResp } from '../core/identity-admin-api.service';
import { vi } from 'vitest';

const sampleOperator: OperatorResp = {
  id: 1,
  publicUserId: 'public-1',
  email: 'operator@example.com',
  displayName: 'Operator',
  homeRegion: 'CN',
  emailVerified: true,
  status: 'ACTIVE',
  roles: ['GOVERNANCE_ADMIN'],
  createdAt: '2026-04-13T18:00:00'
};

describe('AdminUsersPageComponent', () => {
  let mockApi: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    mockApi = {
      listOperators: vi.fn().mockReturnValue(of([sampleOperator])),
      createOperator: vi.fn(),
      updateRoles: vi.fn(),
      resetPassword: vi.fn(),
      disableOperator: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [AdminUsersPageComponent],
      providers: [
        { provide: IdentityAdminApiService, useValue: mockApi }
      ]
    }).compileComponents();
  });

  it('should load operators on init and select the first item', () => {
    const fixture = TestBed.createComponent(AdminUsersPageComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockApi['listOperators']).toHaveBeenCalled();
    expect(comp.operators).toEqual([sampleOperator]);
    expect(comp.selectedOperator).toEqual(sampleOperator);
    expect(comp.selectedRoles).toEqual(['GOVERNANCE_ADMIN']);
  });

  it('createOperator() should show generated temporary password from API', () => {
    mockApi['createOperator'].mockReturnValue(of({
      operator: sampleOperator,
      temporaryPassword: 'TempPass123'
    }));

    const fixture = TestBed.createComponent(AdminUsersPageComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    comp.createForm.email = 'operator@example.com';
    comp.createForm.roles = ['GOVERNANCE_ADMIN'];
    comp.createOperator();

    expect(mockApi['createOperator']).toHaveBeenCalled();
    expect(comp.revealedPassword).toBe('TempPass123');
    expect(comp.success).toContain('operator@example.com');
  });

  it('saveRoles() should persist current selected roles', () => {
    const updated = { ...sampleOperator, roles: ['CATALOG_ADMIN'] as const };
    mockApi['updateRoles'].mockReturnValue(of(updated));

    const fixture = TestBed.createComponent(AdminUsersPageComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    comp.selectedRoles = ['CATALOG_ADMIN'];
    comp.saveRoles();

    expect(mockApi['updateRoles']).toHaveBeenCalledWith(1, ['CATALOG_ADMIN']);
    expect(comp.selectedOperator?.roles).toEqual(['CATALOG_ADMIN']);
  });

  it('should surface API errors from reload()', () => {
    mockApi['listOperators'].mockReturnValue(
      throwError(() => ({ message: 'Network error' }))
    );

    const fixture = TestBed.createComponent(AdminUsersPageComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    expect(comp.error).toBeTruthy();
  });
});
