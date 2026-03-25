import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FeedbackResp, GovernanceApiService } from '../core/governance-api.service';
import { FeedbackDetailPageComponent } from './feedback-detail-page.component';
import { vi } from 'vitest';

const openFeedback: FeedbackResp = {
  id: '5', userId: 10, category: 'GENERAL',
  content: 'Great app!', allowFollowUp: false, status: 'OPEN'
};

const closedFeedback: FeedbackResp = {
  ...openFeedback, status: 'CLOSED', reviewNote: 'Resolved'
};

describe('FeedbackDetailPageComponent', () => {
  let mockApi: Record<string, ReturnType<typeof vi.fn>>;

  function setup(feedbackId: string) {
    return TestBed.configureTestingModule({
      imports: [FeedbackDetailPageComponent],
      providers: [
        provideRouter([]),
        { provide: GovernanceApiService, useValue: mockApi },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => feedbackId } } } }
      ]
    }).compileComponents();
  }

  beforeEach(() => {
    mockApi = {
      getFeedback: vi.fn().mockReturnValue(of(openFeedback)),
      updateFeedbackStatus: vi.fn()
    };
  });

  it('should load feedback detail on init', async () => {
    await setup('5');
    const fixture = TestBed.createComponent(FeedbackDetailPageComponent);
    fixture.detectChanges();

    expect(mockApi['getFeedback']).toHaveBeenCalledWith('5');
    expect(fixture.componentInstance.feedback).toEqual(openFeedback);
    expect(fixture.componentInstance.loading).toBe(false);
  });

  it('OPEN status defaults feedbackStatus to IN_REVIEW', async () => {
    await setup('5');
    const fixture = TestBed.createComponent(FeedbackDetailPageComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.feedbackStatus).toBe('IN_REVIEW');
  });

  it('non-OPEN status keeps original status and review note', async () => {
    mockApi['getFeedback'].mockReturnValue(of(closedFeedback));
    await setup('5');
    const fixture = TestBed.createComponent(FeedbackDetailPageComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.feedbackStatus).toBe('CLOSED');
    expect(fixture.componentInstance.reviewNote).toBe('Resolved');
  });

  it('should set error when feedbackId is missing', async () => {
    await setup('');
    const fixture = TestBed.createComponent(FeedbackDetailPageComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.error).toBeTruthy();
    expect(mockApi['getFeedback']).not.toHaveBeenCalled();
  });

  it('should set error when load fails', async () => {
    mockApi['getFeedback'].mockReturnValue(throwError(() => ({ message: 'Not found' })));
    await setup('5');
    const fixture = TestBed.createComponent(FeedbackDetailPageComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.error).toBeTruthy();
  });

  it('saveStatus() calls updateFeedbackStatus and shows success', async () => {
    mockApi['updateFeedbackStatus'].mockReturnValue(of(closedFeedback));
    await setup('5');

    const fixture = TestBed.createComponent(FeedbackDetailPageComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    comp.feedbackStatus = 'CLOSED';
    comp.reviewNote = 'All done';
    comp.saveStatus();
    fixture.detectChanges();

    expect(mockApi['updateFeedbackStatus']).toHaveBeenCalledWith('5', 'CLOSED', 'All done');
    expect(comp.success).toBeTruthy();
    expect(comp.feedback).toEqual(closedFeedback);
  });

  it('saveStatus() sets error on failure', async () => {
    mockApi['updateFeedbackStatus'].mockReturnValue(
      throwError(() => ({ error: { message: 'Server error' } }))
    );
    await setup('5');

    const fixture = TestBed.createComponent(FeedbackDetailPageComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    comp.saveStatus();
    fixture.detectChanges();

    expect(comp.error).toBe('Server error');
  });
});
