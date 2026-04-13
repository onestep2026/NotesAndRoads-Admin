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

    expect(mockApi['listFeedback']).toHaveBeenCalledWith('OPEN', 0, 20);
    expect(comp.feedbacks).toEqual([sampleFeedback]);
    expect(comp.selectedFeedback).toEqual(sampleFeedback);
    expect(comp.total).toBe(1);
    expect(comp.loading).toBe(false);
  });

  it('should load empty list when no feedback exists', () => {
    mockApi['listFeedback'].mockReturnValue(of(pageOf([])));
    const fixture = TestBed.createComponent(FeedbacksPageComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    expect(comp.feedbacks).toEqual([]);
    expect(comp.selectedFeedback).toBeNull();
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
    expect(comp.feedbacks).toEqual([]);
  });

  it('selectFeedback() should set selected feedback and hydrate review note', () => {
    const fixture = TestBed.createComponent(FeedbacksPageComponent);
    const comp = fixture.componentInstance;
    const reviewNote = 'Already reviewed';
    const feedback = { ...sampleFeedback, reviewNote };

    comp.selectFeedback(feedback);

    expect(comp.selectedFeedback).toEqual(feedback);
    expect(comp.reviewNote).toBe(reviewNote);
  });

  it('reload() should keep current selection when item still exists', () => {
    const secondFeedback = { ...sampleFeedback, id: '2', content: 'Follow-up' };
    mockApi['listFeedback'].mockReturnValue(of(pageOf([sampleFeedback, secondFeedback])));
    const fixture = TestBed.createComponent(FeedbacksPageComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    comp.selectFeedback(secondFeedback);
    comp.reload();

    expect(comp.selectedFeedback?.id).toBe('2');
  });
});
