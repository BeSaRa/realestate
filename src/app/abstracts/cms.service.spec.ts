import { TestBed } from '@angular/core/testing';

import { CmsService } from './cms.service';

describe('CmsService', () => {
  let service: CmsService<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CmsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
