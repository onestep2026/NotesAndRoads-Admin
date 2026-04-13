import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs/operators';
import { ADMIN_ROLE_OPTIONS, AdminRole } from '../core/admin-roles';
import {
  CreateOperatorReq,
  IdentityAdminApiService,
  OperatorResp,
  ResetOperatorPasswordResp
} from '../core/identity-admin-api.service';

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users-page.component.html',
  styleUrl: './admin-users-page.component.scss'
})
export class AdminUsersPageComponent {
  readonly roleOptions = ADMIN_ROLE_OPTIONS;

  loading = false;
  submitting = false;
  error = '';
  success = '';
  operators: OperatorResp[] = [];
  selectedOperator: OperatorResp | null = null;
  selectedRoles: AdminRole[] = [];
  revealedPassword: string | null = null;
  revealedPasswordLabel = '';

  createForm: CreateOperatorReq = {
    email: '',
    displayName: '',
    homeRegion: 'CN',
    temporaryPassword: '',
    roles: ['GOVERNANCE_ADMIN']
  };

  constructor(
    private readonly api: IdentityAdminApiService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.reload();
  }

  reload(): void {
    const previousSelectedId = this.selectedOperator?.id ?? null;
    this.loading = true;
    this.error = '';
    this.api.listOperators()
      .pipe(
        timeout(15000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (operators) => {
          this.operators = operators;
          if (operators.length === 0) {
            this.selectedOperator = null;
            this.selectedRoles = [];
          } else {
            const matched = previousSelectedId
              ? operators.find((item) => item.id === previousSelectedId)
              : null;
            this.selectOperator(matched ?? operators[0]);
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Failed to load operators.';
          this.cdr.detectChanges();
        }
      });
  }

  selectOperator(operator: OperatorResp): void {
    this.selectedOperator = operator;
    this.selectedRoles = [...operator.roles];
    this.cdr.detectChanges();
  }

  toggleCreateRole(role: AdminRole, checked: boolean): void {
    this.createForm.roles = this.toggleRole(this.createForm.roles, role, checked);
  }

  toggleSelectedRole(role: AdminRole, checked: boolean): void {
    this.selectedRoles = this.toggleRole(this.selectedRoles, role, checked);
  }

  createOperator(): void {
    if (!this.createForm.email.trim()) {
      this.error = 'Email is required.';
      return;
    }
    if (this.createForm.roles.length === 0) {
      this.error = 'Select at least one operator role.';
      return;
    }
    this.submitting = true;
    this.error = '';
    this.success = '';
    this.api.createOperator(this.createForm)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.submitting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.success = `Operator ${response.operator.email} created.`;
          this.showTemporaryPassword(response.temporaryPassword, `Initial password for ${response.operator.email}`);
          this.resetCreateForm();
          this.reload();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Failed to create operator.';
          this.cdr.detectChanges();
        }
      });
  }

  saveRoles(): void {
    if (!this.selectedOperator) {
      return;
    }
    this.submitting = true;
    this.error = '';
    this.success = '';
    this.api.updateRoles(this.selectedOperator.id, this.selectedRoles)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.submitting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (operator) => {
          this.success = `Updated roles for ${operator.email}.`;
          this.replaceOperator(operator);
          this.selectOperator(operator);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Failed to update roles.';
          this.cdr.detectChanges();
        }
      });
  }

  resetPassword(): void {
    if (!this.selectedOperator) {
      return;
    }
    this.submitting = true;
    this.error = '';
    this.success = '';
    this.api.resetPassword(this.selectedOperator.id)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.submitting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.success = `Password reset for ${this.selectedOperator?.email}.`;
          this.showTemporaryPassword(response.temporaryPassword, `Temporary password for ${this.selectedOperator?.email}`);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Failed to reset password.';
          this.cdr.detectChanges();
        }
      });
  }

  disableOperator(): void {
    if (!this.selectedOperator || this.selectedOperator.status === 'DISABLED') {
      return;
    }
    if (!window.confirm(`Disable ${this.selectedOperator.email}? Existing sessions will be revoked.`)) {
      return;
    }
    this.submitting = true;
    this.error = '';
    this.success = '';
    this.api.disableOperator(this.selectedOperator.id)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.submitting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (operator) => {
          this.success = `Disabled ${operator.email}.`;
          this.replaceOperator(operator);
          this.selectOperator(operator);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Failed to disable operator.';
          this.cdr.detectChanges();
        }
      });
  }

  isRoleChecked(roles: readonly AdminRole[], role: AdminRole): boolean {
    return roles.includes(role);
  }

  private replaceOperator(operator: OperatorResp): void {
    this.operators = this.operators.map((item) => item.id === operator.id ? operator : item);
  }

  private resetCreateForm(): void {
    this.createForm = {
      email: '',
      displayName: '',
      homeRegion: 'CN',
      temporaryPassword: '',
      roles: ['GOVERNANCE_ADMIN']
    };
  }

  private toggleRole(current: readonly AdminRole[], role: AdminRole, checked: boolean): AdminRole[] {
    if (checked) {
      return current.includes(role) ? [...current] : [...current, role];
    }
    return current.filter((item) => item !== role);
  }

  private showTemporaryPassword(password: string, label: string): void {
    this.revealedPassword = password;
    this.revealedPasswordLabel = label;
  }
}
