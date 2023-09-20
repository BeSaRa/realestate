import { TestBed } from '@angular/core/testing';

import { ScreenBreakpointsService } from './screen-breakpoints.service';

describe('ScreenBreakpointsService', () => {
  let service: ScreenBreakpointsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScreenBreakpointsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
