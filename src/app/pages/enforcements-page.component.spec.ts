import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { EnforcementResp, GovernanceApiService, PageResp } from '../core/governance-api.service';
import { EnforcementsPageComponent } from './enforcements-page.component';
import { vi } from 'vitest';

function pageOf<T>(items: T[]): PageResp<T> {
  return {
    items,
    page: { number: 0, size: 20, totalElements: items.length, totalPages: 1,
            hasNext: false, hasPrevious: false, isFirst: true, isLast: true }
  };
}

const activeEnforcement: EnforcementResp = {
  id: 'E1', targetUserId: 2, type: 'SHARE_BANNED',
  status: 'ACTIVE', reasonCode: 'POLICY_VIOLATION',
  effectiveFrom: '2026-01-01T00:00:00', operatorId: 1
};

describe('EnforcementsPageComponent', () => {
  let mockApi: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    mockApi = {
      listEnforcements: vi.fn().mockReturnValue(of(pageOf([activeEnforcement]))),
      liftEnforcement: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [EnforcementsPageComponent],
      providers: [
        provideRouter([]),
        { provide: GovernanceApiService, useValue: mockApi }
      ]
    }).compileComponents();
  });

  it('should load enforcements on init', () => {
    const fixture = TestBed.createComponent(EnforcementsPageComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockApi['listEnforcements']).toHaveBeenCalledWith('', null, 0, 20);
    expect(comp.items).toEqual([activeEnforcement]);
    expect(comp.total).toBe(1);
    expect(comp.loading).toBe(false);
  });

  it('should load empty list when no enforcements', () => {
    mockApi['listEnforcements'].mockReturnValue(of(pageOf([])));
    const fixture = TestBed.createComponent(EnforcementsPageComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    expect(comp.items).toEqual([]);
    expect(comp.total).toBe(0);
  });

  it('should reload with status and targetUserId filters', () => {
    const fixture = TestBed.createComponent(EnforcementsPageComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    comp.selectedStatus = 'ACTIVE';
    comp.targetUserIdInput = '42';
    comp.reload();

    expect(mockApi['listEnforcements']).toHaveBeenCalledWith('ACTIVE', 42, 0, 20);
  });

  it('should ignore invalid targetUserId input', () => {
    const fixture = TestBed.createComponent(EnforcementsPageComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    comp.targetUserIdInput = 'not-a-number';
    comp.reload();

    expect(mockApi['listEnforcements']).toHaveBeenCalledWith('', null, 0, 20);
  });

  it('lift() calls liftEnforcement and shows success message', () => {
    const lifted: EnforcementResp = { ...activeEnforcement, status: 'LIFTED' };
    mockApi['liftEnforcement'].mockReturnValue(of(lifted));

    const fixture = TestBed.createComponent(EnforcementsPageComponent);
    const comp = fixture.componentInstance;
    // Spy on reload after initial construction to avoid nested cdr.detectChanges()
    // calls that Angular 21 disallows outside an update cycle.
    const reloadSpy = vi.spyOn(comp, 'reload').mockImplementation(() => {});

    comp.liftReason = 'Served duration';
    comp.lift('E1');

    expect(mockApi['liftEnforcement']).toHaveBeenCalledWith('E1', 'Served duration');
    expect(comp.success).toContain('E1');
    expect(comp.error).toBe('');
    expect(reloadSpy).toHaveBeenCalled();
  });

  it('lift() sets error on failure', () => {
    mockApi['liftEnforcement'].mockReturnValue(
      throwError(() => ({ error: { message: 'Enforcement not found' } }))
    );

    const fixture = TestBed.createComponent(EnforcementsPageComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    comp.lift('E1');
    fixture.detectChanges();

    expect(comp.error).toBe('Enforcement not found');
  });

  it('should set error when load fails', () => {
    mockApi['listEnforcements'].mockReturnValue(
      throwError(() => ({ message: 'Server error' }))
    );
    const fixture = TestBed.createComponent(EnforcementsPageComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    expect(comp.error).toBeTruthy();
  });
});
