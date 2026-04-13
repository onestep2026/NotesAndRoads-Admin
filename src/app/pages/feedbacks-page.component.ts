import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs/operators';
import { FeedbackResp, FeedbackStatus, GovernanceApiService } from '../core/governance-api.service';

@Component({
  selector: 'app-feedbacks-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feedbacks-page.component.html',
  styleUrl: './feedbacks-page.component.scss'
})
export class FeedbacksPageComponent {
  readonly statusOptions: Array<FeedbackStatus | ''> = ['', 'OPEN', 'IN_REVIEW', 'CLOSED'];
  selectedStatus: FeedbackStatus | '' = 'OPEN';
  loading = false;
  submitting = false;
  error = '';
  success = '';
  feedbacks: FeedbackResp[] = [];
  selectedFeedback: FeedbackResp | null = null;
  total = 0;
  page = 0;
  size = 20;

  reviewNote = '';

  constructor(
    private readonly api: GovernanceApiService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.reload();
  }

  selectFeedback(feedback: FeedbackResp): void {
    this.selectedFeedback = feedback;
    this.reviewNote = feedback.reviewNote || '';
    this.cdr.detectChanges();
  }

  updateStatus(status: FeedbackStatus): void {
    if (!this.selectedFeedback) return;
    this.submitting = true;
    this.error = '';
    this.success = '';
    this.api
      .updateFeedbackStatus(this.selectedFeedback.id, status, this.reviewNote)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.submitting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          this.success = `Feedback #${res.id} updated to ${status}.`;
          this.reload();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Failed to update feedback.';
          this.cdr.detectChanges();
        }
      });
  }

  reload(): void {
    const previousSelectedId = this.selectedFeedback?.id ?? null;
    this.loading = true;
    this.error = '';
    this.api
      .listFeedback(this.selectedStatus, this.page, this.size)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          this.feedbacks = res.items;
          this.total = res.page.totalElements;
          if (this.feedbacks.length === 0) {
            this.selectedFeedback = null;
            this.reviewNote = '';
          } else {
            const matched = previousSelectedId
              ? this.feedbacks.find((item) => item.id === previousSelectedId)
              : null;
            this.selectFeedback(matched ?? this.feedbacks[0]);
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Failed to load feedbacks.';
          this.cdr.detectChanges();
        }
      });
  }
}
