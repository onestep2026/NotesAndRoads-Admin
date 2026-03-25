import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { EnforcementResp, GovernanceApiService, ReportResp } from '../core/governance-api.service';
import { ReportDetailPageComponent } from './report-detail-page.component';
import { vi } from 'vitest';

const sampleReport: ReportResp = {
  id: '101', reporterUserId: 1, targetUserId: 2,
  targetContentType: 'QUOTE', targetContentId: 500,
  reasonCode: 'SPAM', status: 'OPEN', createdAt: '2026-01-01T00:00:00'
};

const sampleEnforcement: EnforcementResp = {
  id: 'E1', targetUserId: 2, type: 'SHARE_BANNED',
  status: 'ACTIVE', reasonCode: 'POLICY_VIOLATION',
  effectiveFrom: '2026-01-01T00:00:00', operatorId: 1
};

describe('ReportDetailPageComponent', () => {
  let mockApi: Record<string, ReturnType<typeof vi.fn>>;

  function setup(reportId: string) {
    return TestBed.configureTestingModule({
      imports: [ReportDetailPageComponent],
      providers: [
        provideRouter([]),
        { provide: GovernanceApiService, useValue: mockApi },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => reportId } } } }
      ]
    }).compileComponents();
  }

  beforeEach(() => {
    mockApi = {
      getReport: vi.fn().mockReturnValue(of(sampleReport)),
      updateReportStatus: vi.fn(),
      createEnforcement: vi.fn(),
      takeDownContent: vi.fn(),
      restoreContent: vi.fn(),
      deleteContent: vi.fn()
    };
  });

  it('should load report on init using route param', async () => {
    await setup('101');
    const fixture = TestBed.createComponent(ReportDetailPageComponent);
    fixture.detectChanges();

    expect(mockApi['getReport']).toHaveBeenCalledWith('101');
    expect(fixture.componentInstance.report).toEqual(sampleReport);
  });

  it('OPEN status defaults reportStatus to IN_REVIEW', async () => {
    await setup('101');
    const fixture = TestBed.createComponent(ReportDetailPageComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.reportStatus).toBe('IN_REVIEW');
  });

  it('non-OPEN status keeps original value', async () => {
    mockApi['getReport'].mockReturnValue(of({ ...sampleReport, status: 'IN_REVIEW', reviewNote: 'Checking' }));
    await setup('101');
    const fixture = TestBed.createComponent(ReportDetailPageComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.reportStatus).toBe('IN_REVIEW');
    expect(fixture.componentInstance.reviewNote).toBe('Checking');
  });

  it('should set error when report id is missing', async () => {
    await setup('');
    const fixture = TestBed.createComponent(ReportDetailPageComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.error).toBeTruthy();
    expect(mockApi['getReport']).not.toHaveBeenCalled();
  });

  it('should set error when load fails', async () => {
    mockApi['getReport'].mockReturnValue(throwError(() => ({ message: 'Not found' })));
    await setup('101');
    const fixture = TestBed.createComponent(ReportDetailPageComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.error).toBeTruthy();
  });

  it('saveReportStatus() calls updateReportStatus and shows success', async () => {
    const updated: ReportResp = { ...sampleReport, status: 'IN_REVIEW' };
    mockApi['updateReportStatus'].mockReturnValue(of(updated));
    await setup('101');

    const fixture = TestBed.createComponent(ReportDetailPageComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    comp.reportStatus = 'IN_REVIEW';
    comp.reviewNote = 'Under investigation';
    comp.saveReportStatus();
    fixture.detectChanges();

    expect(mockApi['updateReportStatus']).toHaveBeenCalledWith('101', 'IN_REVIEW', 'Under investigation');
    expect(comp.success).toBeTruthy();
    expect(comp.report).toEqual(updated);
  });

  it('applyEnforcement() calls createEnforcement and stores result', async () => {
    mockApi['createEnforcement'].mockReturnValue(of(sampleEnforcement));
    await setup('101');

    const fixture = TestBed.createComponent(ReportDetailPageComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    comp.applyEnforcement();
    fixture.detectChanges();

    expect(mockApi['createEnforcement']).toHaveBeenCalled();
    expect(comp.latestEnforcement).toEqual(sampleEnforcement);
    expect(comp.success).toContain('SHARE_BANNED');
  });

  it('requiresEffectiveUntil() returns true only for LOGIN_BANNED', async () => {
    await setup('101');
    const fixture = TestBed.createComponent(ReportDetailPageComponent);
    const comp = fixture.componentInstance;

    comp.enforcementType = 'LOGIN_BANNED';
    expect(comp.requiresEffectiveUntil()).toBe(true);

    comp.enforcementType = 'SHARE_BANNED';
    expect(comp.requiresEffectiveUntil()).toBe(false);

    comp.enforcementType = 'PERMANENT_BANNED';
    expect(comp.requiresEffectiveUntil()).toBe(false);
  });
});
