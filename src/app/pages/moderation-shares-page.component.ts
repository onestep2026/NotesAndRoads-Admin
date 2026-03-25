import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs/operators';
import {
  GovernanceApiService,
  ModerationShareResp,
  ModerationStatus
} from '../core/governance-api.service';

@Component({
  selector: 'app-moderation-shares-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './moderation-shares-page.component.html',
  styleUrl: './moderation-shares-page.component.scss'
})
export class ModerationSharesPageComponent {
  readonly statusOptions: Array<ModerationStatus | ''> = ['', 'REJECTED', 'PENDING', 'APPROVED'];
  selectedStatus: ModerationStatus | '' = 'REJECTED';
  reviewNote = '';

  loading = false;
  submitting = false;
  error = '';
  success = '';
  items: ModerationShareResp[] = [];
  total = 0;
  page = 0;
  size = 20;

  constructor(
    private readonly api: GovernanceApiService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.reload();
  }

  reload(): void {
    this.loading = true;
    this.error = '';
    this.success = '';
    this.api
      .listModerationShares(this.selectedStatus, this.page, this.size)
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
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Failed to load moderation shares.';
          this.cdr.detectChanges();
        }
      });
  }

  approve(id: string): void {
    this.submitting = true;
    this.error = '';
    this.success = '';
    this.api
      .approveModerationShare(id, this.reviewNote)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.submitting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          this.success = `Share ${res.id} approved.`;
          this.reload();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Failed to approve share.';
          this.cdr.detectChanges();
        }
      });
  }

  reject(id: string): void {
    this.submitting = true;
    this.error = '';
    this.success = '';
    this.api
      .rejectModerationShare(id, this.reviewNote)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.submitting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          this.success = `Share ${res.id} rejected.`;
          this.reload();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Failed to reject share.';
          this.cdr.detectChanges();
        }
      });
  }

  canReview(item: ModerationShareResp): boolean {
    return item.status === 'PENDING';
  }
}
