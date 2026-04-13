import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs/operators';
import {
  EnforcementResp,
  GovernanceApiService,
  ReportResp,
  ReportStatus
} from '../core/governance-api.service';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports-page.component.html',
  styleUrl: './reports-page.component.scss'
})
export class ReportsPageComponent {
  readonly statusOptions: Array<ReportStatus | ''> = [
    '',
    'OPEN',
    'IN_REVIEW',
    'RESOLVED_REJECTED',
    'RESOLVED_CONFIRMED'
  ];
  selectedStatus: ReportStatus | '' = 'OPEN';
  loading = false;
  submitting = false;
  error = '';
  success = '';
  reports: ReportResp[] = [];
  selectedReport: ReportResp | null = null;
  targetUserHistory: EnforcementResp[] = [];
  historyLoading = false;

  page = 0;
  size = 20;
  total = 0;

  reviewNote = '';

  constructor(
    private readonly api: GovernanceApiService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.reload();
  }

  selectReport(report: ReportResp): void {
    this.selectedReport = report;
    this.reviewNote = report.reviewNote || '';
    this.loadUserHistory(report.targetUserId);
    this.cdr.detectChanges();
  }

  loadUserHistory(userId: number): void {
    this.historyLoading = true;
    this.targetUserHistory = [];
    this.api
      .listEnforcements('', userId)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.historyLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          this.targetUserHistory = res.items;
          this.cdr.detectChanges();
        }
      });
  }

  updateStatus(status: ReportStatus): void {
    if (!this.selectedReport) return;
    this.submitting = true;
    this.error = '';
    this.success = '';
    this.api
      .updateReportStatus(this.selectedReport.id, status, this.reviewNote)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.submitting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          this.success = `Report #${res.id} resolved as ${status}.`;
          this.reload();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Failed to update report.';
          this.cdr.detectChanges();
        }
      });
  }

  reload(): void {
    const previousSelectedId = this.selectedReport?.id ?? null;
    this.loading = true;
    this.error = '';
    this.api
      .listReports(this.selectedStatus, this.page, this.size)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          this.reports = res.items;
          this.total = res.page.totalElements;
          if (this.reports.length === 0) {
            this.selectedReport = null;
            this.reviewNote = '';
            this.targetUserHistory = [];
          } else {
            const matched = previousSelectedId
              ? this.reports.find((item) => item.id === previousSelectedId)
              : null;
            this.selectReport(matched ?? this.reports[0]);
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Failed to load reports.';
          this.cdr.detectChanges();
        }
      });
  }
}
