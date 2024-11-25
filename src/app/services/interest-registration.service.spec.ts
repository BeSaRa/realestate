import { TestBed } from '@angular/core/testing';

import { InterestRegistrationService } from './interest-registration.service';

describe('InterestRegistrationService', () => {
  let service: InterestRegistrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InterestRegistrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
