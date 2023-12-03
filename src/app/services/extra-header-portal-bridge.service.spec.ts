import { TestBed } from '@angular/core/testing';

import { ExtraHeaderPortalBridgeService } from './extra-header-portal-bridge.service';

describe('ExtraHeaderPortalBridgeService', () => {
  let service: ExtraHeaderPortalBridgeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExtraHeaderPortalBridgeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
