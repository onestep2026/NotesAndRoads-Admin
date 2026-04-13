import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { EnforcementResp, GovernanceApiService, PageResp, ReportResp } from '../core/governance-api.service';
import { ReportsPageComponent } from './reports-page.component';
import { vi } from 'vitest';

function pageOf<T>(items: T[]): PageResp<T> {
  return {
    items,
    page: { number: 0, size: 20, totalElements: items.length, totalPages: 1,
            hasNext: false, hasPrevious: false, isFirst: true, isLast: true }
  };
}

const sampleReport: ReportResp = {
  id: '101', reporterUserId: 1, targetUserId: 2,
  targetContentType: 'QUOTE', targetContentId: 500,
  reasonCode: 'SPAM', status: 'OPEN', createdAt: '2026-01-01T00:00:00'
};
const userHistory: EnforcementResp = {
  id: 'E1', targetUserId: 2, type: 'SHARE_BANNED',
  status: 'ACTIVE', reasonCode: 'POLICY_VIOLATION',
  effectiveFrom: '2026-01-01T00:00:00', operatorId: 1
};

describe('ReportsPageComponent', () => {
  let mockApi: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    mockApi = {
      listReports: vi.fn().mockReturnValue(of(pageOf([sampleReport]))),
      listEnforcements: vi.fn().mockReturnValue(of(pageOf([userHistory])))
    };

    await TestBed.configureTestingModule({
      imports: [ReportsPageComponent],
      providers: [
        provideRouter([]),
        { provide: GovernanceApiService, useValue: mockApi }
      ]
    }).compileComponents();
  });

  it('should load reports on init', () => {
    const fixture = TestBed.createComponent(ReportsPageComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockApi['listReports']).toHaveBeenCalledWith('OPEN', 0, 20);
    expect(mockApi['listEnforcements']).toHaveBeenCalledWith('', 2);
    expect(comp.reports).toEqual([sampleReport]);
    expect(comp.selectedReport).toEqual(sampleReport);
    expect(comp.targetUserHistory).toEqual([userHistory]);
    expect(comp.total).toBe(1);
    expect(comp.loading).toBe(false);
  });

  it('should load empty list when no reports exist', () => {
    mockApi['listReports'].mockReturnValue(of(pageOf([])));
    const fixture = TestBed.createComponent(ReportsPageComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    expect(comp.reports).toEqual([]);
    expect(comp.total).toBe(0);
  });

  it('should reload with selected status filter', () => {
    const fixture = TestBed.createComponent(ReportsPageComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    comp.selectedStatus = 'IN_REVIEW';
    comp.reload();

    expect(mockApi['listReports']).toHaveBeenCalledWith('IN_REVIEW', 0, 20);
  });

  it('should set error message when load fails', () => {
    mockApi['listReports'].mockReturnValue(
      throwError(() => ({ message: 'Server error' }))
    );
    const fixture = TestBed.createComponent(ReportsPageComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    expect(comp.error).toBeTruthy();
    expect(comp.reports).toEqual([]);
  });
});
