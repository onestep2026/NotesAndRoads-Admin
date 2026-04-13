import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
  selectedStatus: EnforcementStatus | '' = 'ACTIVE';
  targetUserId: number | null = null;

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
    private readonly cdr: ChangeDetectorRef,
    private readonly route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe((params) => {
      if (params['userId']) {
        this.targetUserId = Number(params['userId']);
        this.selectedStatus = '';
      }
      this.reload();
    });
  }

  lift(item: EnforcementResp): void {
    const reason = prompt('Reason for lifting this enforcement?');
    if (!reason) return;

    this.submitting = true;
    this.error = '';
    this.success = '';
    this.api.liftEnforcement(item.id, reason)
      .pipe(
        timeout(15000),
        finalize(() => { this.submitting = false; this.cdr.detectChanges(); })
      )
      .subscribe({
        next: () => {
          this.success = 'Enforcement lifted.';
          this.reload();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Failed to lift enforcement.';
          this.cdr.detectChanges();
        }
      });
  }

  reload(): void {
    this.loading = true;
    this.error = '';
    this.api.listEnforcements(this.selectedStatus, this.targetUserId, this.page, this.size)
      .pipe(
        timeout(15000),
        finalize(() => { this.loading = false; this.cdr.detectChanges(); })
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
}
