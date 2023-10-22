import { TestBed } from '@angular/core/testing';

import { SectionTitleService } from './section-title.service';

describe('SectionTitleService', () => {
  let service: SectionTitleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SectionTitleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
