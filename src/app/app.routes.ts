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

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: '', pathMatch: 'full', redirectTo: 'feedback' },
  { path: 'feedback', component: FeedbacksPageComponent, canActivate: [adminAuthGuard] },
  { path: 'feedback/:id', component: FeedbackDetailPageComponent, canActivate: [adminAuthGuard] },
  { path: 'reports', component: ReportsPageComponent, canActivate: [adminAuthGuard] },
  { path: 'reports/:id', component: ReportDetailPageComponent, canActivate: [adminAuthGuard] },
  { path: 'moderation-shares', component: ModerationSharesPageComponent, canActivate: [adminAuthGuard] },
  { path: 'enforcements', component: EnforcementsPageComponent, canActivate: [adminAuthGuard] },
  { path: 'book-submissions', component: BookSubmissionsPageComponent, canActivate: [adminAuthGuard] }
];
