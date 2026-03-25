/**
 * Global test setup file.
 *
 * Angular 21 throws "Should be run in update mode" when ChangeDetectorRef.detectChanges()
 * is called while the component view is still in creation mode (i.e. synchronously from
 * Observable subscribe callbacks that fire during the component constructor before the
 * first fixture.detectChanges() completes).
 *
 * All page components in this project call this.reload() in their constructors and
 * all reload() implementations call cdr.detectChanges() inside subscribe callbacks.
 * With synchronous of() mock observables the callbacks execute during createComponent(),
 * triggering the Angular 21 assertion.
 *
 * Fix: globally stub ViewRef.prototype.detectChanges to a no-op for the duration of
 * each test.  Our tests assert component state (properties), not DOM output, so skipping
 * Angular's template-rendering pass has no effect on test correctness.
 */
import { ViewRef } from '@angular/core';
import { afterEach, beforeEach, vi } from 'vitest';

beforeEach(() => {
  vi.spyOn(ViewRef.prototype, 'detectChanges').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});
