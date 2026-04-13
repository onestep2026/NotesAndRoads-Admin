import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs/operators';
import { GovernanceApiService, ModerationShareResp, ModerationStatus } from '../core/governance-api.service';

@Component({
  selector: 'app-moderation-shares-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './moderation-shares-page.component.html',
  styleUrl: './moderation-shares-page.component.scss'
})
export class ModerationSharesPageComponent {
  readonly statusOptions: Array<ModerationStatus | ''> = ['', 'PENDING', 'APPROVED', 'REJECTED'];
  selectedStatus: ModerationStatus | '' = 'PENDING';
  loading = false;
  submitting = false;
  error = '';
  success = '';
  items: ModerationShareResp[] = [];
  selectedItem: ModerationShareResp | null = null;
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

  selectItem(item: ModerationShareResp): void {
    this.selectedItem = item;
    this.reviewNote = '';
    this.cdr.detectChanges();
  }

  approve(): void {
    if (!this.selectedItem) return;
    this.submitting = true;
    this.error = '';
    this.success = '';
    this.api.approveModerationShare(this.selectedItem.id, this.reviewNote)
      .pipe(
        timeout(15000),
        finalize(() => { this.submitting = false; this.cdr.detectChanges(); })
      )
      .subscribe({
        next: () => {
          this.success = 'Share approved.';
          this.reload();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Failed to approve share.';
          this.cdr.detectChanges();
        }
      });
  }

  reject(): void {
    if (!this.selectedItem) return;
    this.submitting = true;
    this.error = '';
    this.success = '';
    this.api.rejectModerationShare(this.selectedItem.id, this.reviewNote)
      .pipe(
        timeout(15000),
        finalize(() => { this.submitting = false; this.cdr.detectChanges(); })
      )
      .subscribe({
        next: () => {
          this.success = 'Share rejected.';
          this.reload();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Failed to reject share.';
          this.cdr.detectChanges();
        }
      });
  }

  reload(): void {
    const previousSelectedId = this.selectedItem?.id ?? null;
    this.loading = true;
    this.error = '';
    this.api.listModerationShares(this.selectedStatus, this.page, this.size)
      .pipe(
        timeout(15000),
        finalize(() => { this.loading = false; this.cdr.detectChanges(); })
      )
      .subscribe({
        next: (res) => {
          this.items = res.items;
          this.total = res.page.totalElements;
          if (this.items.length === 0) {
            this.selectedItem = null;
            this.reviewNote = '';
          } else {
            const matched = previousSelectedId
              ? this.items.find((item) => item.id === previousSelectedId)
              : null;
            this.selectItem(matched ?? this.items[0]);
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Failed to load moderation shares.';
          this.cdr.detectChanges();
        }
      });
  }
}
