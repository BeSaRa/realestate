import { TestBed } from '@angular/core/testing';

import { AuthorityFaqService } from './authority-faq.service';

describe('AuthorityFaqService', () => {
  let service: AuthorityFaqService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthorityFaqService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
