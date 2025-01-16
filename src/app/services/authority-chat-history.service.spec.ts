import { TestBed } from '@angular/core/testing';

import { AuthorityChatHistoryService } from './authority-chat-history.service';

describe('AuthorityChatHistoryService', () => {
  let service: AuthorityChatHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthorityChatHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
