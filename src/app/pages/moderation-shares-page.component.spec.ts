import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { GovernanceApiService, ModerationShareResp, PageResp } from '../core/governance-api.service';
import { ModerationSharesPageComponent } from './moderation-shares-page.component';
import { vi } from 'vitest';

function pageOf<T>(items: T[]): PageResp<T> {
  return {
    items,
    page: { number: 0, size: 20, totalElements: items.length, totalPages: 1,
            hasNext: false, hasPrevious: false, isFirst: true, isLast: true }
  };
}

const pendingShare: ModerationShareResp = {
  id: '1', ownerUserId: 10, contentType: 'QUOTE', contentId: 100,
  visibility: 'PUBLIC', status: 'PENDING', createdAt: '2026-01-01T00:00:00'
};
const approvedShare: ModerationShareResp = { ...pendingShare, id: '2', status: 'APPROVED' };
const rejectedShare: ModerationShareResp = { ...pendingShare, id: '3', status: 'REJECTED' };

describe('ModerationSharesPageComponent', () => {
  let mockApi: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    mockApi = {
      listModerationShares: vi.fn().mockReturnValue(of(pageOf([pendingShare]))),
      approveModerationShare: vi.fn(),
      rejectModerationShare: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ModerationSharesPageComponent],
      providers: [
        provideRouter([]),
        { provide: GovernanceApiService, useValue: mockApi }
      ]
    }).compileComponents();
  });

  it('should load moderation shares on init', () => {
    const fixture = TestBed.createComponent(ModerationSharesPageComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockApi['listModerationShares']).toHaveBeenCalled();
    expect(comp.items).toEqual([pendingShare]);
    expect(comp.total).toBe(1);
    expect(comp.loading).toBe(false);
  });

  it('should show empty list when no items returned', () => {
    mockApi['listModerationShares'].mockReturnValue(of(pageOf([])));
    const fixture = TestBed.createComponent(ModerationSharesPageComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.items).toEqual([]);
    expect(fixture.componentInstance.total).toBe(0);
  });

  it('canReview() returns true only for PENDING items', () => {
    const fixture = TestBed.createComponent(ModerationSharesPageComponent);
    const comp = fixture.componentInstance;

    expect(comp.canReview(pendingShare)).toBe(true);
    expect(comp.canReview(approvedShare)).toBe(false);
    expect(comp.canReview(rejectedShare)).toBe(false);
  });

  it('approve() calls approveModerationShare and shows success message', () => {
    mockApi['approveModerationShare'].mockReturnValue(of({ ...pendingShare, status: 'APPROVED' }));

    const fixture = TestBed.createComponent(ModerationSharesPageComponent);
    const comp = fixture.componentInstance;
    // Spy on reload after initial construction to verify it's called without
    // triggering nested cdr.detectChanges() that Angular 21 disallows outside
    // an update cycle.
    const reloadSpy = vi.spyOn(comp, 'reload').mockImplementation(() => {});

    comp.approve('1');

    expect(mockApi['approveModerationShare']).toHaveBeenCalledWith('1', '');
    expect(comp.success).toContain('1');
    expect(comp.error).toBe('');
    expect(reloadSpy).toHaveBeenCalled();
  });

  it('reject() calls rejectModerationShare and shows success message', () => {
    mockApi['rejectModerationShare'].mockReturnValue(of({ ...pendingShare, status: 'REJECTED' }));

    const fixture = TestBed.createComponent(ModerationSharesPageComponent);
    const comp = fixture.componentInstance;
    const reloadSpy = vi.spyOn(comp, 'reload').mockImplementation(() => {});

    comp.reject('1');

    expect(mockApi['rejectModerationShare']).toHaveBeenCalledWith('1', '');
    expect(comp.success).toContain('1');
    expect(comp.error).toBe('');
    expect(reloadSpy).toHaveBeenCalled();
  });

  it('should show error when list load fails', () => {
    mockApi['listModerationShares'].mockReturnValue(
      throwError(() => ({ message: 'Network error' }))
    );
    const fixture = TestBed.createComponent(ModerationSharesPageComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    expect(comp.error).toBeTruthy();
    expect(comp.items).toEqual([]);
  });

  it('should show error when approve fails', () => {
    mockApi['approveModerationShare'].mockReturnValue(
      throwError(() => ({ error: { message: 'Server error' } }))
    );
    const fixture = TestBed.createComponent(ModerationSharesPageComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    comp.approve('1');
    fixture.detectChanges();

    expect(comp.error).toBe('Server error');
  });
});
