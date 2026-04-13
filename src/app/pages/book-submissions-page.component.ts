import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs/operators';
import {
  AuthorCandidateResp,
  BookSubmissionResp,
  BookSubmissionStatus,
  GovernanceApiService,
  ReviewAuthorReq
} from '../core/governance-api.service';

type AuthorDecision = 'EXISTING' | 'NEW';

interface AuthorReviewState {
  name: string;
  decision: AuthorDecision;
  selectedPersonId: number | null;
  candidates: AuthorCandidateResp[];
  loading: boolean;
  error: string;
}

@Component({
  selector: 'app-book-submissions-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './book-submissions-page.component.html',
  styleUrl: './book-submissions-page.component.scss'
})
export class BookSubmissionsPageComponent {
  readonly statusOptions: Array<BookSubmissionStatus | ''> = ['', 'PENDING', 'APPROVED', 'REJECTED'];
  selectedStatus: BookSubmissionStatus | '' = 'PENDING';

  loading = false;
  submitting = false;
  rebuilding = false;
  error = '';
  success = '';
  items: BookSubmissionResp[] = [];
  selectedItem: BookSubmissionResp | null = null;
  total = 0;
  page = 0;
  size = 20;

  reviewNotes: Record<number, string> = {};
  reviewTranslatorTexts: Record<number, string> = {};
  reviewIsbn10: Record<number, string> = {};
  reviewIsbn13: Record<number, string> = {};
  reviewLanguages: Record<number, 'zh' | 'en'> = {};
  reviewAuthors: Record<number, AuthorReviewState[]> = {};
  rebuildEditionId = '';
  rebuildBatchSize = 500;

  constructor(
    private readonly api: GovernanceApiService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.reload();
  }

  selectItem(item: BookSubmissionResp): void {
    this.selectedItem = item;
    this.ensureAuthorStates(item);
    this.cdr.detectChanges();
  }

  reload(): void {
    const previousSelectedId = this.selectedItem?.id ?? null;
    this.loading = true;
    this.error = '';
    this.success = '';
    this.api
      .listBookSubmissions(this.selectedStatus, this.page, this.size)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          this.items = res.items;
          this.total = res.page.totalElements;
          if (this.items.length === 0) {
            this.selectedItem = null;
          } else {
            const matched = previousSelectedId
              ? this.items.find((item) => item.id === previousSelectedId)
              : null;
            this.selectItem(matched ?? this.items[0]);
          }
          for (const item of res.items) {
            if (!(item.id in this.reviewTranslatorTexts)) {
              this.reviewTranslatorTexts[item.id] = item.translatorText ?? '';
            }
            if (!(item.id in this.reviewIsbn10)) {
              this.reviewIsbn10[item.id] = item.isbn10 ?? '';
            }
            if (!(item.id in this.reviewIsbn13)) {
              this.reviewIsbn13[item.id] = item.isbn13 ?? '';
            }
            if (!(item.id in this.reviewLanguages)) {
              const lang = (item.language || '').toLowerCase();
              this.reviewLanguages[item.id] = lang === 'en' ? 'en' : 'zh';
            }
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Failed to load book submissions.';
          this.cdr.detectChanges();
        }
      });
  }

  approve(item: BookSubmissionResp): void {
    this.review(item, true);
  }

  reject(item: BookSubmissionResp): void {
    this.review(item, false);
  }

  private review(item: BookSubmissionResp, approve: boolean): void {
    this.submitting = true;
    this.error = '';
    this.success = '';
    const note = this.reviewNotes[item.id] || '';
    const translatorText = this.reviewTranslatorTexts[item.id] ?? item.translatorText ?? null;
    const isbn10 = this.reviewIsbn10[item.id] ?? item.isbn10 ?? null;
    const isbn13 = this.reviewIsbn13[item.id] ?? item.isbn13 ?? null;
    const language = this.reviewLanguages[item.id] ?? ((item.language || '').toLowerCase() === 'en' ? 'en' : 'zh');
    const authors = this.buildReviewAuthors(item.id);
    this.api
      .reviewBookSubmission(item.id, approve, note, translatorText, language, isbn10, isbn13, authors)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.submitting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          this.success = `Submission #${res.id} ${approve ? 'approved' : 'rejected'}.`;
          this.reload();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Failed to review submission.';
          this.cdr.detectChanges();
        }
      });
  }

  rebuildSearchIndex(): void {
    this.rebuilding = true;
    this.error = '';
    this.success = '';
    const editionId = this.parseEditionId(this.rebuildEditionId);
    const batchSize = this.normalizeBatchSize(this.rebuildBatchSize);
    this.api
      .rebuildBookCatalogSearchIndex(editionId, batchSize)
      .pipe(
        timeout(30000),
        finalize(() => {
          this.rebuilding = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          this.success = editionId === null
            ? `Rebuild finished. Rebuilt ${res.rebuiltCount} editions.`
            : `Edition ${editionId} rebuild finished.`;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Failed to rebuild search index.';
          this.cdr.detectChanges();
        }
      });
  }

  private parseEditionId(raw: string): number | null {
    const trimmed = raw?.trim();
    if (!trimmed) {
      return null;
    }
    const parsed = Number(trimmed);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return null;
    }
    return parsed;
  }

  private normalizeBatchSize(raw: number): number {
    if (!Number.isFinite(raw) || raw <= 0) {
      return 500;
    }
    return Math.min(1000, Math.floor(raw));
  }

  hasAuthorCandidates(author: AuthorReviewState): boolean {
    return author.candidates.length > 0;
  }

  onAuthorDecisionChange(author: AuthorReviewState): void {
    if (author.decision === 'EXISTING') {
      if (!author.selectedPersonId && author.candidates.length > 0) {
        author.selectedPersonId = author.candidates[0].personId;
      }
      return;
    }
    author.selectedPersonId = null;
  }

  refreshAuthorCandidates(itemId: number, author: AuthorReviewState): void {
    author.loading = true;
    author.error = '';
    this.api
      .searchAuthorCandidates(author.name, 10)
      .pipe(
        timeout(15000),
        finalize(() => {
          author.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (rows) => {
          author.candidates = rows;
          if (rows.length === 0) {
            author.decision = 'NEW';
            author.selectedPersonId = null;
          } else if (author.decision === 'EXISTING') {
            const stillExists = rows.some((row) => row.personId === author.selectedPersonId);
            if (!stillExists) {
              author.selectedPersonId = rows[0].personId;
            }
          }
          this.reviewAuthors[itemId] = [...(this.reviewAuthors[itemId] ?? [])];
          this.cdr.detectChanges();
        },
        error: (err) => {
          author.error = err?.error?.message || err?.message || 'Failed to load author candidates.';
          this.cdr.detectChanges();
        }
      });
  }

  private ensureAuthorStates(item: BookSubmissionResp): void {
    if (item.id in this.reviewAuthors) {
      return;
    }
    const authorNames = this.parseAuthorNames(item.authorText);
    if (authorNames.length === 0) {
      this.reviewAuthors[item.id] = [];
      return;
    }
    const states: AuthorReviewState[] = authorNames.map((name) => ({
      name,
      decision: 'NEW',
      selectedPersonId: null,
      candidates: [],
      loading: false,
      error: ''
    }));
    this.reviewAuthors[item.id] = states;
    for (const state of states) {
      this.refreshAuthorCandidates(item.id, state);
    }
  }

  private parseAuthorNames(authorText?: string): string[] {
    const text = (authorText || '').trim();
    if (!text) {
      return [];
    }
    const parts = text
      .split(/[,;/，、]+/g)
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
    const deduped: string[] = [];
    const seen = new Set<string>();
    for (const part of parts) {
      const key = part.toLowerCase();
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      deduped.push(part);
    }
    return deduped;
  }

  private buildReviewAuthors(itemId: number): ReviewAuthorReq[] {
    const states = this.reviewAuthors[itemId] ?? [];
    const payload: ReviewAuthorReq[] = [];
    for (const state of states) {
      if (state.decision === 'EXISTING' && state.selectedPersonId) {
        payload.push({
          name: state.name,
          decision: 'EXISTING',
          personId: state.selectedPersonId
        });
        continue;
      }
      payload.push({
        name: state.name,
        decision: 'NEW',
        personId: null
      });
    }
    return payload;
  }
}
