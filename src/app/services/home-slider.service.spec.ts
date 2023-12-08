import { TestBed } from '@angular/core/testing';

import { HomeSliderService } from './home-slider.service';

describe('HomeSliderService', () => {
  let service: HomeSliderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HomeSliderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
