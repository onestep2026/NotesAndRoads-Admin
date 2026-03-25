import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AdminConfigStore } from './admin-config.store';

export const adminAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const config = inject(AdminConfigStore);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        config.clearToken();
        void router.navigateByUrl('/login');
      }
      return throwError(() => err);
    })
  );
};
