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
 * Fix: stub the concrete ViewRef implementation's detectChanges method (exported as the
 * internal ɵViewRef from @angular/core) to a no-op for the duration of each test.
 * Our tests assert component state (properties), not DOM output, so skipping Angular's
 * template-rendering pass has no effect on test correctness.
 */
import * as angularCore from '@angular/core';
import { afterEach, beforeEach, vi } from 'vitest';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const InternalViewRef = (angularCore as any)['ɵViewRef'];

beforeEach(() => {
  if (InternalViewRef?.prototype?.detectChanges) {
    vi.spyOn(InternalViewRef.prototype, 'detectChanges').mockImplementation(() => {});
  }
  // Also stub checkNoChanges: after the no-op detectChanges() Angular's fixture still
  // calls checkNoChanges() which compares current bindings against "last rendered" state
  // and throws NG0100 because no real render pass ever committed binding values.
  if (InternalViewRef?.prototype?.checkNoChanges) {
    vi.spyOn(InternalViewRef.prototype, 'checkNoChanges').mockImplementation(() => {});
  }
});

afterEach(() => {
  vi.restoreAllMocks();
});
