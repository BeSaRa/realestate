import { TestBed } from '@angular/core/testing';

import { SectionGuardService } from './section-guard.service';

describe('SectionGuardService', () => {
  let service: SectionGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SectionGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
