import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdminConfigStore } from './admin-config.store';

export type ReportStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED_REJECTED' | 'RESOLVED_CONFIRMED';
export type FeedbackStatus = 'OPEN' | 'IN_REVIEW' | 'CLOSED';
export type FeedbackCategory = 'BUG_REPORT' | 'FEATURE_REQUEST' | 'GENERAL';
export type EnforcementType = 'SHARE_BANNED' | 'LOGIN_BANNED' | 'PERMANENT_BANNED';
export type EnforcementReasonCode = 'POLICY_VIOLATION' | 'REPEAT_OFFENSE' | 'MALICIOUS_BEHAVIOR' | 'OTHER';
export type EnforcementStatus = 'ACTIVE' | 'LIFTED' | 'EXPIRED';
export type BookSubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ModerationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface FeedbackResp {
  id: string;
  userId: number;
  category: FeedbackCategory;
  content: string;
  contactEmail?: string;
  allowFollowUp: boolean;
  status: FeedbackStatus;
  reviewedBy?: number;
  reviewNote?: string;
  reviewedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReportResp {
  id: string;
  reporterUserId: number;
  targetUserId: number;
  targetContentType: string;
  targetContentId: number;
  reasonCode: string;
  reasonText?: string;
  status: ReportStatus;
  reviewedBy?: number;
  reviewNote?: string;
  reviewedAt?: string;
  createdAt?: string;
}

export interface PageResp<T> {
  items: T[];
  page: {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    isFirst: boolean;
    isLast: boolean;
  };
}

export interface EnforcementResp {
  id: string;
  targetUserId: number;
  type: EnforcementType;
  status: EnforcementStatus;
  reasonCode: EnforcementReasonCode;
  reasonText?: string;
  effectiveFrom: string;
  effectiveUntil?: string;
  liftedAt?: string;
  operatorId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookSubmissionResp {
  id: number;
  submitterUserId: number;
  submitterEmail?: string;
  reviewStatus: BookSubmissionStatus;
  reviewNote?: string;
  reviewedBy?: number;
  reviewedAt?: string;
  suggestedWorkId?: number;
  title: string;
  authorText?: string;
  translatorText?: string;
  language?: string;
  publisherName?: string;
  coverUrl?: string;
  publishedYear?: number;
  isbn10?: string;
  isbn13?: string;
  source?: string;
  sourceRecordId?: string;
  fingerprint?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ReviewAuthorDecision = 'EXISTING' | 'NEW';

export interface ReviewAuthorReq {
  name: string;
  decision: ReviewAuthorDecision;
  personId?: number | null;
}

export interface AuthorCandidateResp {
  personId: number;
  displayName: string;
  aliasNames?: string[];
  workCount?: number;
  matchedWorks?: string[];
}

export interface RebuildSearchIndexResp {
  rebuiltCount: number;
}

export interface AdminContentActionResp {
  action: 'TAKEDOWN' | 'RESTORE' | 'DELETE';
  targetContentType: string;
  targetContentId: number;
  affectedShareCount: number;
  updatedAt?: string;
}

export interface ModerationShareResp {
  id: string;
  ownerUserId?: number;
  contentType: string;
  contentId: number;
  visibility?: string;
  status: ModerationStatus;
  moderationRiskLevel?: string;
  moderationLabel?: string;
  moderationMessage?: string;
  moderatedAt?: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class GovernanceApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly config: AdminConfigStore
  ) {}

  listFeedback(status: FeedbackStatus | '', page = 0, size = 20): Observable<PageResp<FeedbackResp>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) {
      params = params.set('status', status);
    }
    return this.http
      .get<FeedbackResp[]>(this.url('/api/v1/admin/governance/feedback'), {
        headers: this.headers(),
        params
      })
      .pipe(map((items) => this.asPage(items, page, size)));
  }

  getFeedback(id: string): Observable<FeedbackResp> {
    return this.http.get<FeedbackResp>(this.url(`/api/v1/admin/governance/feedback/${id}`), {
      headers: this.headers()
    });
  }

  updateFeedbackStatus(id: string, status: FeedbackStatus, reviewNote: string): Observable<FeedbackResp> {
    return this.http.patch<FeedbackResp>(
      this.url(`/api/v1/admin/governance/feedback/${id}/status`),
      { status, reviewNote: reviewNote.trim() || null },
      { headers: this.headers() }
    );
  }

  listReports(status: ReportStatus | '', page = 0, size = 20): Observable<PageResp<ReportResp>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) {
      params = params.set('status', status);
    }
    return this.http
      .get<ReportResp[]>(this.url('/api/v1/admin/governance/reports'), {
        headers: this.headers(),
        params
      })
      .pipe(map((items) => this.asPage(items, page, size)));
  }

  getReport(id: string): Observable<ReportResp> {
    return this.http.get<ReportResp>(this.url(`/api/v1/admin/governance/reports/${id}`), {
      headers: this.headers()
    });
  }

  updateReportStatus(id: string, status: ReportStatus, reviewNote: string): Observable<ReportResp> {
    return this.http.patch<ReportResp>(
      this.url(`/api/v1/admin/governance/reports/${id}/status`),
      { status, reviewNote: reviewNote.trim() || null },
      { headers: this.headers() }
    );
  }

  createEnforcement(payload: {
    targetUserId: number;
    type: EnforcementType;
    reasonCode: EnforcementReasonCode;
    reasonText: string;
    effectiveFrom: string;
    effectiveUntil: string | null;
  }): Observable<EnforcementResp> {
    return this.http.post<EnforcementResp>(this.url('/api/v1/admin/governance/enforcements'), payload, {
      headers: this.headers()
    });
  }

  listEnforcements(
    status: EnforcementStatus | '',
    targetUserId: number | null,
    page = 0,
    size = 20
  ): Observable<PageResp<EnforcementResp>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) {
      params = params.set('status', status);
    }
    if (targetUserId !== null) {
      params = params.set('targetUserId', targetUserId);
    }
    return this.http
      .get<EnforcementResp[]>(this.url('/api/v1/admin/governance/enforcements'), {
        headers: this.headers(),
        params
      })
      .pipe(map((items) => this.asPage(items, page, size)));
  }

  listBookSubmissions(
    status: BookSubmissionStatus | '',
    page = 0,
    size = 20
  ): Observable<PageResp<BookSubmissionResp>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<PageResp<BookSubmissionResp>>(this.url('/api/v1/admin/book-catalog/submissions'), {
      headers: this.headers(),
      params
    });
  }

  listModerationShares(
    status: ModerationStatus | '',
    page = 0,
    size = 20
  ): Observable<PageResp<ModerationShareResp>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) {
      params = params.set('status', status);
    }
    return this.http
      .get<ModerationShareResp[]>(this.url('/api/v1/admin/governance/moderation/shares'), {
        headers: this.headers(),
        params
      })
      .pipe(
        map((items) => this.asPage(items, page, size))
      );
  }

  approveModerationShare(id: string, reviewNote: string): Observable<ModerationShareResp> {
    return this.http.post<ModerationShareResp>(
      this.url(`/api/v1/admin/governance/moderation/shares/${id}/approve`),
      { reviewNote: reviewNote.trim() || null },
      { headers: this.headers() }
    );
  }

  rejectModerationShare(id: string, reviewNote: string): Observable<ModerationShareResp> {
    return this.http.post<ModerationShareResp>(
      this.url(`/api/v1/admin/governance/moderation/shares/${id}/reject`),
      { reviewNote: reviewNote.trim() || null },
      { headers: this.headers() }
    );
  }

  reviewBookSubmission(
    id: number,
    approve: boolean,
    reviewNote: string,
    translatorText: string | null = null,
    language: 'zh' | 'en' | null = null,
    isbn10: string | null = null,
    isbn13: string | null = null,
    authors: ReviewAuthorReq[] = []
  ): Observable<BookSubmissionResp> {
    return this.http.post<BookSubmissionResp>(
      this.url(`/api/v1/admin/book-catalog/submissions/${id}/review`),
      {
        approve,
        reviewNote: reviewNote.trim() || null,
        translatorText: translatorText === null ? null : translatorText.trim() || null,
        language,
        isbn10: isbn10 === null ? null : isbn10.trim() || null,
        isbn13: isbn13 === null ? null : isbn13.trim() || null,
        authors: authors.map((author) => ({
          name: author.name.trim(),
          decision: author.decision,
          personId: author.personId ?? null
        }))
      },
      { headers: this.headers() }
    );
  }

  searchAuthorCandidates(name: string, limit = 10): Observable<AuthorCandidateResp[]> {
    const params = new HttpParams()
      .set('name', name.trim())
      .set('limit', limit);
    return this.http.get<AuthorCandidateResp[]>(this.url('/api/v1/admin/book-catalog/author-candidates'), {
      headers: this.headers(),
      params
    });
  }

  rebuildBookCatalogSearchIndex(
    editionId: number | null,
    batchSize = 500
  ): Observable<RebuildSearchIndexResp> {
    let params = new HttpParams().set('batchSize', batchSize);
    if (editionId !== null) {
      params = params.set('editionId', editionId);
    }
    return this.http.post<RebuildSearchIndexResp>(
      this.url('/api/v1/admin/book-catalog/search-index/rebuild'),
      {},
      {
        headers: this.headers(),
        params
      }
    );
  }

  liftEnforcement(id: string, liftReason: string): Observable<EnforcementResp> {
    return this.http.post<EnforcementResp>(
      this.url(`/api/v1/admin/governance/enforcements/${id}/lift`),
      { liftReason: liftReason.trim() || null },
      { headers: this.headers() }
    );
  }

  takeDownContent(payload: {
    targetContentType: string;
    targetContentId: number;
    reasonText: string;
  }): Observable<AdminContentActionResp> {
    return this.http.post<AdminContentActionResp>(this.url('/api/v1/admin/governance/content/takedown'), payload, {
      headers: this.headers()
    });
  }

  restoreContent(payload: {
    targetContentType: string;
    targetContentId: number;
    reasonText: string;
  }): Observable<AdminContentActionResp> {
    return this.http.post<AdminContentActionResp>(this.url('/api/v1/admin/governance/content/restore'), payload, {
      headers: this.headers()
    });
  }

  deleteContent(payload: {
    targetContentType: string;
    targetContentId: number;
    reasonText: string;
  }): Observable<AdminContentActionResp> {
    return this.http.post<AdminContentActionResp>(this.url('/api/v1/admin/governance/content/delete'), payload, {
      headers: this.headers()
    });
  }

  private headers(): HttpHeaders {
    const token = this.config.token();
    if (!token) {
      return new HttpHeaders();
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  private url(path: string): string {
    const base = this.config.baseUrl();
    return `${base}${path}`;
  }

  private asPage<T>(items: T[], page: number, size: number): PageResp<T> {
    return {
      items,
      page: {
        number: page,
        size,
        totalElements: items.length,
        totalPages: items.length === 0 ? 0 : 1,
        hasNext: false,
        hasPrevious: page > 0,
        isFirst: page === 0,
        isLast: true
      }
    };
  }
}
