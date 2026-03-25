import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs/operators';
import {
  EnforcementResp,
  EnforcementStatus,
  GovernanceApiService
} from '../core/governance-api.service';

@Component({
  selector: 'app-enforcements-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './enforcements-page.component.html',
  styleUrl: './enforcements-page.component.scss'
})
export class EnforcementsPageComponent {
  readonly statusOptions: Array<EnforcementStatus | ''> = ['', 'ACTIVE', 'LIFTED', 'EXPIRED'];
  selectedStatus: EnforcementStatus | '' = '';
  targetUserIdInput = '';
  liftReason = '';

  loading = false;
  submitting = false;
  error = '';
  success = '';
  items: EnforcementResp[] = [];
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
    const parsedTargetUserId = this.parseTargetUserId();
    this.api
      .listEnforcements(this.selectedStatus, parsedTargetUserId, this.page, this.size)
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
          this.error = err?.error?.message || err?.message || 'Failed to load enforcements.';
          this.cdr.detectChanges();
        }
      });
  }

  lift(id: string): void {
    this.submitting = true;
    this.error = '';
    this.success = '';
    this.api
      .liftEnforcement(id, this.liftReason)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.submitting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          this.success = `Enforcement ${res.id} lifted.`;
          this.reload();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Failed to lift enforcement.';
          this.cdr.detectChanges();
        }
      });
  }

  private parseTargetUserId(): number | null {
    const raw = this.targetUserIdInput.trim();
    if (!raw) {
      return null;
    }
    const value = Number(raw);
    if (Number.isNaN(value) || value <= 0) {
      return null;
    }
    return value;
  }
}
