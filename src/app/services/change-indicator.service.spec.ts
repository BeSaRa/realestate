import { TestBed } from '@angular/core/testing';

import { ChangeIndicatorService } from './change-indicator.service';

describe('ChangeIndicatorService', () => {
  let service: ChangeIndicatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChangeIndicatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
