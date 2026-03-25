import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs/operators';
import {
  EnforcementReasonCode,
  EnforcementResp,
  EnforcementType,
  GovernanceApiService,
  ReportResp,
  ReportStatus
} from '../core/governance-api.service';

@Component({
  selector: 'app-report-detail-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './report-detail-page.component.html',
  styleUrl: './report-detail-page.component.scss'
})
export class ReportDetailPageComponent {
  reportId = '';
  loading = false;
  saving = false;
  error = '';
  success = '';
  report?: ReportResp;
  latestEnforcement?: EnforcementResp;

  reportStatus: ReportStatus = 'IN_REVIEW';
  reviewNote = '';

  enforcementType: EnforcementType = 'SHARE_BANNED';
  enforcementReasonCode: EnforcementReasonCode = 'POLICY_VIOLATION';
  enforcementReasonText = '';
  effectiveFrom = new Date().toISOString().slice(0, 16);
  effectiveUntil = '';
  contentActionReason = '';

  constructor(
    route: ActivatedRoute,
    private readonly api: GovernanceApiService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.reportId = route.snapshot.paramMap.get('id') || '';
    this.load();
  }

  load(): void {
    if (!this.reportId) {
      this.error = 'Missing report id.';
      return;
    }
    this.loading = true;
    this.error = '';
    this.success = '';
    this.api.getReport(this.reportId)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (report) => {
          this.report = report;
          this.reportStatus = report.status === 'OPEN' ? 'IN_REVIEW' : report.status;
          this.reviewNote = report.reviewNote || '';
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Failed to load report detail.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  saveReportStatus(): void {
    if (!this.reportId) {
      return;
    }
    this.saving = true;
    this.error = '';
    this.success = '';
    this.api.updateReportStatus(this.reportId, this.reportStatus, this.reviewNote)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.saving = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
      next: (report) => {
        this.report = report;
        this.success = 'Report status updated.';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to update report status.';
        this.cdr.detectChanges();
      }
    });
  }

  applyEnforcement(): void {
    if (!this.report) {
      return;
    }
    this.saving = true;
    this.error = '';
    this.success = '';
    const until = this.effectiveUntil.trim();
    this.api.createEnforcement({
      targetUserId: this.report.targetUserId,
      type: this.enforcementType,
      reasonCode: this.enforcementReasonCode,
      reasonText: this.enforcementReasonText,
      effectiveFrom: this.toIsoDateTime(this.effectiveFrom),
      effectiveUntil: until ? this.toIsoDateTime(until) : null
    }).subscribe({
      next: (resp) => {
        this.latestEnforcement = resp;
        this.success = `Enforcement applied: ${resp.type}`;
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to apply enforcement.';
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  requiresEffectiveUntil(): boolean {
    return this.enforcementType === 'LOGIN_BANNED';
  }

  takeDownTargetContent(): void {
    if (!this.report) {
      return;
    }
    this.saving = true;
    this.error = '';
    this.success = '';
    this.api.takeDownContent({
      targetContentType: this.report.targetContentType,
      targetContentId: this.report.targetContentId,
      reasonText: this.contentActionReason
    }).subscribe({
      next: (resp) => {
        this.success = `Content taken down. Affected shares: ${resp.affectedShareCount}`;
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to take down content.';
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  restoreTargetContent(): void {
    if (!this.report) {
      return;
    }
    this.saving = true;
    this.error = '';
    this.success = '';
    this.api.restoreContent({
      targetContentType: this.report.targetContentType,
      targetContentId: this.report.targetContentId,
      reasonText: this.contentActionReason
    }).subscribe({
      next: (resp) => {
        this.success = `Content restored. Affected shares: ${resp.affectedShareCount}`;
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to restore content.';
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteTargetContent(): void {
    if (!this.report) {
      return;
    }
    this.saving = true;
    this.error = '';
    this.success = '';
    this.api.deleteContent({
      targetContentType: this.report.targetContentType,
      targetContentId: this.report.targetContentId,
      reasonText: this.contentActionReason
    }).subscribe({
      next: (resp) => {
        this.success = `Content deleted. Affected shares: ${resp.affectedShareCount}`;
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to delete content.';
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  private toIsoDateTime(value: string): string {
    return new Date(value).toISOString().slice(0, 19);
  }
}
