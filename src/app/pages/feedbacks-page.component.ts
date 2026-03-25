import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs/operators';
import { FeedbackResp, FeedbackStatus, GovernanceApiService } from '../core/governance-api.service';

@Component({
  selector: 'app-feedbacks-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './feedbacks-page.component.html',
  styleUrl: './feedbacks-page.component.scss'
})
export class FeedbacksPageComponent {
  readonly statusOptions: Array<FeedbackStatus | ''> = ['', 'OPEN', 'IN_REVIEW', 'CLOSED'];
  selectedStatus: FeedbackStatus | '' = '';
  loading = false;
  error = '';
  feedbackItems: FeedbackResp[] = [];
  page = 0;
  size = 20;
  total = 0;

  constructor(
    private readonly api: GovernanceApiService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.reload();
  }

  reload(): void {
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
          this.feedbackItems = res.items;
          this.total = res.page.totalElements;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Failed to load feedback.';
          this.cdr.detectChanges();
        }
      });
  }

  preview(content: string): string {
    return content.length > 80 ? `${content.slice(0, 80)}...` : content;
  }
}
