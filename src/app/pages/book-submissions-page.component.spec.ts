import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BookSubmissionResp, GovernanceApiService, PageResp } from '../core/governance-api.service';
import { BookSubmissionsPageComponent } from './book-submissions-page.component';
import { vi } from 'vitest';

function pageOf<T>(items: T[]): PageResp<T> {
  return {
    items,
    page: { number: 0, size: 20, totalElements: items.length, totalPages: 1,
            hasNext: false, hasPrevious: false, isFirst: true, isLast: true }
  };
}

const pendingSubmission: BookSubmissionResp = {
  id: 1, submitterUserId: 5, reviewStatus: 'PENDING',
  title: 'Test Book', authorText: 'Author A'
};

const noAuthorSubmission: BookSubmissionResp = {
  id: 2, submitterUserId: 5, reviewStatus: 'PENDING',
  title: 'Another Book'
};

describe('BookSubmissionsPageComponent', () => {
  let mockApi: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    mockApi = {
      listBookSubmissions: vi.fn().mockReturnValue(of(pageOf([pendingSubmission]))),
      reviewBookSubmission: vi.fn(),
      searchAuthorCandidates: vi.fn().mockReturnValue(of([])),
      rebuildBookCatalogSearchIndex: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [BookSubmissionsPageComponent],
      providers: [
        provideRouter([]),
        { provide: GovernanceApiService, useValue: mockApi }
      ]
    }).compileComponents();
  });

  it('should load PENDING submissions on init', () => {
    const fixture = TestBed.createComponent(BookSubmissionsPageComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockApi['listBookSubmissions']).toHaveBeenCalledWith('PENDING', 0, 20);
    expect(comp.items).toEqual([pendingSubmission]);
    expect(comp.total).toBe(1);
    expect(comp.loading).toBe(false);
  });

  it('should initialize review state for each loaded item', () => {
    const fixture = TestBed.createComponent(BookSubmissionsPageComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    expect(comp.reviewAuthors[1]).toBeDefined();
    expect(comp.reviewLanguages[1]).toBeDefined();
    expect(comp.reviewIsbn10[1]).toBeDefined();
    expect(comp.reviewIsbn13[1]).toBeDefined();
  });

  it('should search author candidates for items with authorText', () => {
    TestBed.createComponent(BookSubmissionsPageComponent);
    expect(mockApi['searchAuthorCandidates']).toHaveBeenCalledWith('Author A', 10);
  });

  it('should not search author candidates for items without authorText', () => {
    mockApi['listBookSubmissions'].mockReturnValue(of(pageOf([noAuthorSubmission])));
    TestBed.createComponent(BookSubmissionsPageComponent);
    expect(mockApi['searchAuthorCandidates']).not.toHaveBeenCalled();
  });

  it('approve() calls reviewBookSubmission with approve=true', () => {
    const approved: BookSubmissionResp = { ...pendingSubmission, reviewStatus: 'APPROVED' };
    mockApi['reviewBookSubmission'].mockReturnValue(of(approved));

    const fixture = TestBed.createComponent(BookSubmissionsPageComponent);
    const comp = fixture.componentInstance;
    // Spy on reload after initial construction to avoid nested cdr.detectChanges()
    // calls that Angular 21 disallows outside an update cycle.
    const reloadSpy = vi.spyOn(comp, 'reload').mockImplementation(() => {});

    comp.approve(pendingSubmission);

    const [id, approveFlag] = mockApi['reviewBookSubmission'].mock.calls[0];
    expect(id).toBe(1);
    expect(approveFlag).toBe(true);
    expect(comp.success).toContain('approved');
    expect(reloadSpy).toHaveBeenCalled();
  });

  it('reject() calls reviewBookSubmission with approve=false', () => {
    const rejected: BookSubmissionResp = { ...pendingSubmission, reviewStatus: 'REJECTED' };
    mockApi['reviewBookSubmission'].mockReturnValue(of(rejected));

    const fixture = TestBed.createComponent(BookSubmissionsPageComponent);
    const comp = fixture.componentInstance;
    const reloadSpy = vi.spyOn(comp, 'reload').mockImplementation(() => {});

    comp.reject(pendingSubmission);

    const [id, approveFlag] = mockApi['reviewBookSubmission'].mock.calls[0];
    expect(id).toBe(1);
    expect(approveFlag).toBe(false);
    expect(comp.success).toContain('rejected');
    expect(reloadSpy).toHaveBeenCalled();
  });

  it('should show error when load fails', () => {
    mockApi['listBookSubmissions'].mockReturnValue(
      throwError(() => ({ message: 'Server error' }))
    );
    const fixture = TestBed.createComponent(BookSubmissionsPageComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    expect(comp.error).toBeTruthy();
    expect(comp.items).toEqual([]);
  });

  it('should show error when review fails', () => {
    mockApi['reviewBookSubmission'].mockReturnValue(
      throwError(() => ({ error: { message: 'Review failed' } }))
    );

    const fixture = TestBed.createComponent(BookSubmissionsPageComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    comp.approve(pendingSubmission);
    fixture.detectChanges();

    expect(comp.error).toBe('Review failed');
  });
});
