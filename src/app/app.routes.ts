import { adminAuthGuard } from './core/admin-auth.guard';
import { Routes } from '@angular/router';
import { EnforcementsPageComponent } from './pages/enforcements-page.component';
import { BookSubmissionsPageComponent } from './pages/book-submissions-page.component';
import { FeedbackDetailPageComponent } from './pages/feedback-detail-page.component';
import { FeedbacksPageComponent } from './pages/feedbacks-page.component';
import { LoginPageComponent } from './pages/login-page.component';
import { ModerationSharesPageComponent } from './pages/moderation-shares-page.component';
import { ReportDetailPageComponent } from './pages/report-detail-page.component';
import { ReportsPageComponent } from './pages/reports-page.component';
import { UnauthorizedPageComponent } from './pages/unauthorized-page.component';
import { CATALOG_ROLES, GOVERNANCE_ROLES, SUPER_ADMIN_ROLES } from './core/admin-roles';
import { AdminUsersPageComponent } from './pages/admin-users-page.component';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'unauthorized', component: UnauthorizedPageComponent, canActivate: [adminAuthGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'feedback' },
  { path: 'admin-users', component: AdminUsersPageComponent, canActivate: [adminAuthGuard], data: { requiredRoles: SUPER_ADMIN_ROLES } },
  { path: 'feedback', component: FeedbacksPageComponent, canActivate: [adminAuthGuard], data: { requiredRoles: GOVERNANCE_ROLES } },
  { path: 'feedback/:id', component: FeedbackDetailPageComponent, canActivate: [adminAuthGuard], data: { requiredRoles: GOVERNANCE_ROLES } },
  { path: 'reports', component: ReportsPageComponent, canActivate: [adminAuthGuard], data: { requiredRoles: GOVERNANCE_ROLES } },
  { path: 'reports/:id', component: ReportDetailPageComponent, canActivate: [adminAuthGuard], data: { requiredRoles: GOVERNANCE_ROLES } },
  { path: 'moderation-shares', component: ModerationSharesPageComponent, canActivate: [adminAuthGuard], data: { requiredRoles: GOVERNANCE_ROLES } },
  { path: 'enforcements', component: EnforcementsPageComponent, canActivate: [adminAuthGuard], data: { requiredRoles: GOVERNANCE_ROLES } },
  { path: 'book-submissions', component: BookSubmissionsPageComponent, canActivate: [adminAuthGuard], data: { requiredRoles: CATALOG_ROLES } }
];
