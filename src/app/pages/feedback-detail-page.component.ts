import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs/operators';
import { FeedbackResp, FeedbackStatus, GovernanceApiService } from '../core/governance-api.service';

@Component({
  selector: 'app-feedback-detail-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './feedback-detail-page.component.html',
  styleUrl: './feedback-detail-page.component.scss'
})
export class FeedbackDetailPageComponent {
  feedbackId = '';
  loading = false;
  saving = false;
  error = '';
  success = '';
  feedback?: FeedbackResp;

  feedbackStatus: FeedbackStatus = 'IN_REVIEW';
  reviewNote = '';

  constructor(
    route: ActivatedRoute,
    private readonly api: GovernanceApiService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.feedbackId = route.snapshot.paramMap.get('id') || '';
    this.load();
  }

  load(): void {
    if (!this.feedbackId) {
      this.error = 'Missing feedback id.';
      return;
    }
    this.loading = true;
    this.error = '';
    this.success = '';
    this.api.getFeedback(this.feedbackId)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (feedback) => {
          this.feedback = feedback;
          this.feedbackStatus = feedback.status === 'OPEN' ? 'IN_REVIEW' : feedback.status;
          this.reviewNote = feedback.reviewNote || '';
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Failed to load feedback detail.';
          this.cdr.detectChanges();
        }
      });
  }

  saveStatus(): void {
    if (!this.feedbackId) {
      return;
    }
    this.saving = true;
    this.error = '';
    this.success = '';
    this.api.updateFeedbackStatus(this.feedbackId, this.feedbackStatus, this.reviewNote)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.saving = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (feedback) => {
          this.feedback = feedback;
          this.success = 'Feedback status updated.';
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Failed to update feedback status.';
          this.cdr.detectChanges();
        }
      });
  }
}
