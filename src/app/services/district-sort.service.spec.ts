import { TestBed } from '@angular/core/testing';

import { DistrictSortService } from './district-sort.service';

describe('DistrictSortService', () => {
  let service: DistrictSortService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DistrictSortService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
