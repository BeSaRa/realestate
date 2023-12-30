import { TestBed } from '@angular/core/testing';

import { FilterMessagesService } from './filter-messages.service';

describe('FilterMessagesService', () => {
  let service: FilterMessagesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilterMessagesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
