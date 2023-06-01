import { TestBed } from '@angular/core/testing';

import { LawService } from './law.service';

describe('LawService', () => {
  let service: LawService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LawService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
