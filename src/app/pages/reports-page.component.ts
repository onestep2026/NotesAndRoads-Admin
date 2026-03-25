import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs/operators';
import { GovernanceApiService, ReportResp, ReportStatus } from '../core/governance-api.service';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reports-page.component.html',
  styleUrl: './reports-page.component.scss'
})
export class ReportsPageComponent {
  readonly statusOptions: Array<ReportStatus | ''> = ['', 'OPEN', 'IN_REVIEW', 'RESOLVED_REJECTED', 'RESOLVED_CONFIRMED'];
  selectedStatus: ReportStatus | '' = '';
  loading = false;
  error = '';
  reports: ReportResp[] = [];
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
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Failed to load reports.';
          this.cdr.detectChanges();
        }
      });
  }
}
