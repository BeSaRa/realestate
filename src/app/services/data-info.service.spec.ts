import { TestBed } from '@angular/core/testing';

import { DataInfoService } from './data-info.service';

describe('DataInfoService', () => {
  let service: DataInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
