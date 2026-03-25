import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FeedbackResp, GovernanceApiService, PageResp } from '../core/governance-api.service';
import { FeedbacksPageComponent } from './feedbacks-page.component';
import { vi } from 'vitest';

function pageOf<T>(items: T[]): PageResp<T> {
  return {
    items,
    page: { number: 0, size: 20, totalElements: items.length, totalPages: 1,
            hasNext: false, hasPrevious: false, isFirst: true, isLast: true }
  };
}

const sampleFeedback: FeedbackResp = {
  id: '1', userId: 10, category: 'BUG_REPORT',
  content: 'Something broke', allowFollowUp: false, status: 'OPEN'
};

describe('FeedbacksPageComponent', () => {
  let mockApi: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    mockApi = {
      listFeedback: vi.fn().mockReturnValue(of(pageOf([sampleFeedback])))
    };

    await TestBed.configureTestingModule({
      imports: [FeedbacksPageComponent],
      providers: [
        provideRouter([]),
        { provide: GovernanceApiService, useValue: mockApi }
      ]
    }).compileComponents();
  });

  it('should load feedback list on init', () => {
    const fixture = TestBed.createComponent(FeedbacksPageComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockApi['listFeedback']).toHaveBeenCalledWith('', 0, 20);
    expect(comp.feedbackItems).toEqual([sampleFeedback]);
    expect(comp.total).toBe(1);
    expect(comp.loading).toBe(false);
  });

  it('should load empty list when no feedback exists', () => {
    mockApi['listFeedback'].mockReturnValue(of(pageOf([])));
    const fixture = TestBed.createComponent(FeedbacksPageComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    expect(comp.feedbackItems).toEqual([]);
    expect(comp.total).toBe(0);
  });

  it('should reload with selected status filter', () => {
    const fixture = TestBed.createComponent(FeedbacksPageComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    comp.selectedStatus = 'IN_REVIEW';
    comp.reload();

    expect(mockApi['listFeedback']).toHaveBeenCalledWith('IN_REVIEW', 0, 20);
  });

  it('should set error message when load fails', () => {
    mockApi['listFeedback'].mockReturnValue(
      throwError(() => ({ message: 'Server error' }))
    );
    const fixture = TestBed.createComponent(FeedbacksPageComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    expect(comp.error).toBeTruthy();
    expect(comp.feedbackItems).toEqual([]);
  });

  it('preview() returns content unchanged when under 80 characters', () => {
    const fixture = TestBed.createComponent(FeedbacksPageComponent);
    const comp = fixture.componentInstance;
    const short = 'short content';
    expect(comp.preview(short)).toBe(short);
  });

  it('preview() truncates content over 80 characters with ellipsis', () => {
    const fixture = TestBed.createComponent(FeedbacksPageComponent);
    const comp = fixture.componentInstance;
    const long = 'a'.repeat(100);
    const result = comp.preview(long);
    expect(result).toHaveLength(83);
    expect(result.endsWith('...')).toBe(true);
  });
});
