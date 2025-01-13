import { TestBed } from '@angular/core/testing';

import { AuthorityChatService } from './authority-chat.service';

describe('AuthorityChatMessagesContainerService', () => {
  let service: AuthorityChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthorityChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
