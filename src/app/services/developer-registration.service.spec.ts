import { TestBed } from '@angular/core/testing';

import { DeveloperRegistrationService } from './developer-registration.service';

describe('DeveloperRegistrationService', () => {
  let service: DeveloperRegistrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeveloperRegistrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
